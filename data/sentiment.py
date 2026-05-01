import yfinance as yf
import pandas as pd
import numpy as np

# Lazy load transformers so it doesn't block fast execution if unused
_sentiment_pipeline = None

def get_sentiment_pipeline():
    global _sentiment_pipeline
    if _sentiment_pipeline is None:
        try:
            from transformers import pipeline
            print("Loading FinBERT sentiment model (this might take a second)...")
            _sentiment_pipeline = pipeline("sentiment-analysis", model="ProsusAI/finbert")
        except ImportError:
            print("Warning: 'transformers' library not found. Sentiment will be neutral.")
            return None
        except Exception as e:
            print(f"Warning: Failed to load FinBERT: {e}")
            return None
    return _sentiment_pipeline

def fetch_and_score_news(ticker: str) -> float:
    """
    Fetches recent news for the ticker from yfinance and scores it using FinBERT.
    Returns an aggregated sentiment score between -1.0 (very negative) and 1.0 (very positive).
    """
    t = yf.Ticker(ticker)
    news = t.news
    
    if not news:
        return 0.0
        
    pipeline = get_sentiment_pipeline()
    if pipeline is None:
        return 0.0
        
    headlines = [article['title'] for article in news if 'title' in article]
    if not headlines:
        return 0.0
        
    try:
        results = pipeline(headlines)
    except Exception as e:
        print(f"Error scoring news: {e}")
        return 0.0
        
    # Map FinBERT labels to scores
    score_mapping = {
        'positive': 1.0,
        'neutral': 0.0,
        'negative': -1.0
    }
    
    total_score = 0.0
    for res in results:
        label = res['label'].lower()
        score = res['score']
        
        direction = score_mapping.get(label, 0.0)
        # Weight by confidence score
        total_score += direction * score
        
    avg_score = total_score / len(results)
    return avg_score

def add_simulated_sentiment_to_history(df: pd.DataFrame, final_live_sentiment: float) -> pd.Series:
    """
    Since historical news for 60 days of 5m intervals requires Paid APIs,
    we simulate a stationary sentiment process (AR-1) reverting to the mean of 0,
    with the final value anchoring towards the live sentiment.
    """
    np.random.seed(42)
    n = len(df)
    
    # AR(1) process for fake sentiment
    sim_sentiment = np.zeros(n)
    sim_sentiment[0] = final_live_sentiment * 0.1 # start small
    
    rho = 0.95 # highly autocorrelated (sentiment persists)
    noise = np.random.normal(0, 0.05, n)
    
    for i in range(1, n):
        sim_sentiment[i] = rho * sim_sentiment[i-1] + noise[i]
        
    # Clip to -1, 1
    sim_sentiment = np.clip(sim_sentiment, -1.0, 1.0)
    
    # Gently nudge the last few values towards the actual live sentiment so it matches up
    if n > 100:
        sim_sentiment[-100:] = np.linspace(sim_sentiment[-101], final_live_sentiment, 100) + np.random.normal(0, 0.01, 100)
    
    return pd.Series(sim_sentiment, index=df.index)
