import pandas as pd
import numpy as np
import yfinance as yf

def load_market_data(ticker: str, start_date: str, end_date: str, interval: str = '1d') -> pd.DataFrame:
    """
    Downloads historical market data via the yfinance API.
    """
    print(f"Fetching data for {ticker} from {start_date} to {end_date} (Interval: {interval}) via yfinance...")
    
    # Download data
    df = yf.download(ticker, start=start_date, end=end_date, interval=interval, progress=False)
    
    if df.empty:
        raise ValueError(f"No data returned for ticker {ticker} in the specified date range.")
    
    # yfinance sometimes returns multi-index columns if you pass multiple tickers. 
    # Just grab the top level if it's a single ticker.
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
        
    return df

def load_macro_data(ticker: str, start_date: str, end_date: str, interval: str = '1d') -> pd.DataFrame:
    """
    Downloads structural macro indicators (like VIX) via yfinance.
    """
    print(f"Fetching macro data for {ticker} (Interval: {interval})...")
    df = yf.download(ticker, start=start_date, end=end_date, interval=interval, progress=False)
    
    if df.empty:
        print(f"Warning: No macro data returned for {ticker}.")
        return pd.DataFrame()
        
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
        
    return df

def compute_log_returns(prices: pd.Series) -> pd.Series:
    """
    Compute daily logarithmic returns.
    """
    # handle 0s or negatives if they ever happen
    safe_prices = prices.replace(0, np.nan).dropna()
    returns = np.log(safe_prices / safe_prices.shift(1))
    return returns.dropna()
