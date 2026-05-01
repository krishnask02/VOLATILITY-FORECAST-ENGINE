import pandas as pd
import numpy as np

from config import TARGET_TICKER, MACRO_TICKER, START_DATE, END_DATE, INTERVAL, NN_EPOCHS, NN_BATCH_SIZE, NN_LEARNING_RATE, MONTE_CARLO_SIMS, MONTE_CARLO_HORIZON
from data.data_loader import load_market_data, load_macro_data, compute_log_returns
from data.feature_engineering import build_feature_matrix
from data.sentiment import fetch_and_score_news, add_simulated_sentiment_to_history
from realized_vol.realized_vol import calculate_historical_volatility
from quant_models.dynamic_selector import AdaptiveModelSelector
from nn_models.lstm_residual import VolatilityNN
from backtest.walk_forward import expanding_window_evaluation
from ensemble.combiner import HybridCombiner
from implied_vol.iv_model import ImpliedVolatilityModel
from simulation.monte_carlo import MonteCarloEngine

def main():
    print("--- High-Frequency Hybrid Regimes-Switching Volatility Engine ---")
    print(f"Target: {TARGET_TICKER} from {START_DATE} to {END_DATE} (Freq: {INTERVAL})")
    
    # 1. Market Data & Macro Data
    print("\n1. Fetching Intraday Market Data...")
    df = load_market_data(TARGET_TICKER, START_DATE, END_DATE, interval=INTERVAL)
    
    print(f"   -> Fetching Macro Data ({MACRO_TICKER})...")
    vix_df = load_macro_data(MACRO_TICKER, START_DATE, END_DATE, interval=INTERVAL)
    
    print("\n2. Computing Returns & Realized Volatility...")
    returns = compute_log_returns(df['Close'])
    # Adjust RV window for intraday (21 periods = ~2 hours at 5m instead of 1 month, let's use 78 periods which is 1 day)
    rv = calculate_historical_volatility(returns, window=78)

    # Sentiment Phase
    print("\n3. Analyzing Real-Time Sentiment (FinBERT NLP)...")
    live_sentiment = fetch_and_score_news(TARGET_TICKER)
    print(f"   -> Live Sentiment Score: {live_sentiment:.4f} (-1.0 to 1.0)")
    
    sentiment_series = add_simulated_sentiment_to_history(df, live_sentiment)

    # Dynamic Model Selector
    print("\n4. Evaluating Econometric Models dynamically...")
    # Lookback window for econometrics: 780 periods (~10 days)
    selector = AdaptiveModelSelector(returns, rv, lookback_window=780)
    selector.fit_all()
    
    adaptive_features = selector.get_selected_features()
    best_vol = adaptive_features['best_vol_series']
    best_resid = adaptive_features['best_residuals']

    print("\n5. Building Enhanced Feature Matrix for Deep Learning...")
    X = build_feature_matrix(returns, best_vol, best_resid, rv, df, vix_df, sentiment_series)
    y = X['realized_vol']

    # Walk-Forward Backtest
    print("\n6. Running Intraday Expanding Window Backtest...")
    # Initial train: ~20 days (78 periods * 20 = 1560)
    # Retrain: every 5 days (~390 periods)
    nn_corrections, _ = expanding_window_evaluation(
        X, y, 
        VolatilityNN, 
        nn_epochs=NN_EPOCHS, nn_batch=NN_BATCH_SIZE, nn_lr=NN_LEARNING_RATE,
        initial_train_size=1560,
        retrain_step=390
    )
    
    # Combine predictions only for the backtested range
    backtest_range = nn_corrections.index
    final_volatility = HybridCombiner.simple_addition(X.loc[backtest_range, 'garch_vol'], nn_corrections)

    print("\n[SUCCESS] Pipeline & Backtest completed.")
    
    final_model_prediction = final_volatility.iloc[-1]
    final_spot_price = df['Close'].iloc[-1]
    
    # 4. Implied Volatility Validation
    print("\n--- Phase 2: Implied Volatility Benchmarking ---")
    
    iv_calc = ImpliedVolatilityModel(risk_free_rate=0.04)
    pseudo_strike = final_spot_price * 1.05 # 5% OTM Call
    days_to_expiration = 30 / 365.0      # 1 month DTE
    pseudo_market_price = final_spot_price * 0.02 
    
    calculated_iv = iv_calc.estimate_iv(pseudo_market_price, final_spot_price, pseudo_strike, days_to_expiration)
    
    print(f"Asset Spot Price : ${final_spot_price:.2f}")
    print(f"Option Strike    : ${pseudo_strike:.2f}")
    print(f"Calculated IV    : {calculated_iv * 100:.2f}% (Annualized)")
    
    annualized_final_pred = final_model_prediction * np.sqrt(252) * 100
    print(f"Engine Hybrid Vol: {annualized_final_pred:.2f}% (Annualized)")
    
    if annualized_final_pred > (calculated_iv * 100):
        print("-> Decision: The engine flags Risk as UNDER-PRICED in the options market.")
    else:
        print("-> Decision: The engine flags Risk as OVER-PRICED in the options market.")

    # 5. Monte Carlo Simulation Engine
    print(f"\n--- Phase 3: Parallel Monte Carlo Simulations ---")
    print(f"Simulating {MONTE_CARLO_SIMS} pathways across a {MONTE_CARLO_HORIZON}-day horizon using the final Neural Net Volatility Forecast ({final_model_prediction:.4f} daily).")
    
    # Using historical mean as the drift bias
    historical_drift = returns.mean()
    
    mc_engine = MonteCarloEngine(simulations=MONTE_CARLO_SIMS, horizon_days=MONTE_CARLO_HORIZON)
    price_matrix = mc_engine.simulate_gbm(current_price=final_spot_price, daily_volatility=final_model_prediction, drift=historical_drift)
    
    metrics = mc_engine.get_risk_metrics(price_paths=price_matrix)
    
    print("\n[Terminal Risk Profile Projection]")
    for metric_name, value in metrics.items():
        print(f" * {metric_name:<26}: ${value:.2f}")

if __name__ == "__main__":
    main()
