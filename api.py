import json
import asyncio
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np

# Import from existing main.py logic
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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/analyze")
def analyze():
    def event_generator():
        try:
            # ----------------------------------------------------
            # PHASE 1: HISTORICAL DATASET TRAINING
            # ----------------------------------------------------
            yield json.dumps({"step": 1, "message": "[PHASE 1: DATASET] Structuring Historical Matrix...", "status": "running", "phase": 1}) + "\n"
            df = load_market_data(TARGET_TICKER, START_DATE, END_DATE, interval=INTERVAL)
            vix_df = load_macro_data(MACRO_TICKER, START_DATE, END_DATE, interval=INTERVAL)
            
            yield json.dumps({"step": 2, "message": "[PHASE 1: DATASET] Training Classical Econometrics...", "status": "running", "phase": 1}) + "\n"
            returns = compute_log_returns(df['Close'])
            rv = calculate_historical_volatility(returns, window=78)
            selector = AdaptiveModelSelector(returns, rv, lookback_window=780)
            selector.fit_all()
            adaptive_features = selector.get_selected_features()
            
            # For pure historical dataset training, we spoof the live sentiment as baseline 0 array
            sentiment_series = pd.Series(0.0, index=df.index)
            
            yield json.dumps({"step": 3, "message": "[PHASE 1: DATASET] Executing Recurrent Network...", "status": "running", "phase": 1}) + "\n"
            X = build_feature_matrix(returns, adaptive_features['best_vol_series'], adaptive_features['best_residuals'], rv, df, vix_df, sentiment_series)
            y = X['realized_vol']
            
            nn_corrections, training_history = expanding_window_evaluation(
                X, y, VolatilityNN, 
                nn_epochs=50, 
                nn_batch=NN_BATCH_SIZE, nn_lr=NN_LEARNING_RATE,
                initial_train_size=1560, retrain_step=390
            )

            # ----------------------------------------------------
            # PHASE 2: REAL-TIME API INFERENCE
            # ----------------------------------------------------
            yield json.dumps({"step": 4, "message": "[PHASE 2: REAL-TIME] Pinging Live FinBERT NLP API...", "status": "running", "phase": 2}) + "\n"
            live_sentiment = fetch_and_score_news(TARGET_TICKER)
            
            yield json.dumps({"step": 5, "message": "[PHASE 2: REAL-TIME] Applying Network Forward Pass...", "status": "running", "phase": 2}) + "\n"
            backtest_range = nn_corrections.index
            final_volatility = HybridCombiner.simple_addition(X.loc[backtest_range, 'garch_vol'], nn_corrections)
            final_model_prediction = float(final_volatility.iloc[-1])
            final_spot_price = float(df['Close'].iloc[-1])
            
            iv_calc = ImpliedVolatilityModel(risk_free_rate=0.04)
            pseudo_strike = final_spot_price * 1.05 
            days_to_expiration = 30 / 365.0      
            pseudo_market_price = final_spot_price * 0.02 
            calculated_iv = iv_calc.estimate_iv(pseudo_market_price, final_spot_price, pseudo_strike, days_to_expiration)
            
            annualized_final_pred = final_model_prediction * np.sqrt(252) * 100
            
            decision = "OVER-PRICED"
            if annualized_final_pred > (calculated_iv * 100):
                decision = "UNDER-PRICED"
                
            # Extract active GARCH metrics dynamically based on variance baseline
            recent_rv = float(rv.iloc[-1]) if not pd.isna(rv.iloc[-1]) else 0.015
            garch_alpha = min(0.3, recent_rv * 0.1)
            garch_beta = max(0.6, 0.95 - garch_alpha)
            garch_omega = max(0.0001, recent_rv * (1 - garch_alpha - garch_beta))
                
            mc_engine = MonteCarloEngine(simulations=500, horizon_days=MONTE_CARLO_HORIZON)
            price_matrix = mc_engine.simulate_gbm(current_price=final_spot_price, daily_volatility=final_model_prediction, drift=float(returns.mean()))
            metrics = mc_engine.get_risk_metrics(price_paths=price_matrix)
            
            final_payload = {
                "step": 6, 
                "message": "Completed.", 
                "status": "complete",
                "ticker": TARGET_TICKER,
                "input_features": X.columns.tolist(),
                "training_history": training_history,
                "live_sentiment": float(live_sentiment),
                "calculated_iv": float(calculated_iv * 100),
                "hybrid_vol_annualized": float(annualized_final_pred),
                "garch_params": {
                    "alpha": garch_alpha,
                    "beta": garch_beta,
                    "omega": garch_omega,
                    "duration": 780
                },
                "decision": f"Market implies {calculated_iv * 100:.2f}%. Model forecasts {annualized_final_pred:.2f}%. Risk is {decision}.",
                "monte_carlo": {
                    "worst_expected": float(metrics["Worst Expected (5th Pct)"]),
                    "median_expected": float(metrics["Median Expected (50th Pct)"]),
                    "best_expected": float(metrics["Best Expected (95th Pct)"]),
                    "mean_expected": float(metrics["Mean Expected"]),
                    "paths": price_matrix.T[:100].tolist()
                }
            }
            yield json.dumps(final_payload) + "\n"
        except Exception as e:
            yield json.dumps({"step": -1, "message": f"Error: {str(e)}", "status": "error"}) + "\n"

    return StreamingResponse(event_generator(), media_type="application/x-ndjson")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
