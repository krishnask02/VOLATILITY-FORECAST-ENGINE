import pandas as pd
import numpy as np
from typing import List, Dict

from quant_models.garch_model import BaseVolatilityModel, StandardGARCH, EGARCH, GJRGARCH
from backtest.metrics import mean_squared_error

class AdaptiveModelSelector:
    """
    Evaluates multiple econometric models and dynamically switches to the one
    with the best short-term predictive power based on a target (realized volatility).
    """
    def __init__(self, returns: pd.Series, rv_target: pd.Series, lookback_window: int = 10):
        self.returns = returns
        self.rv_target = rv_target
        self.lookback_window = lookback_window
        
        # Instantiate models
        self.models = [
            StandardGARCH(returns),
            EGARCH(returns),
            GJRGARCH(returns)
        ]
        self.winning_model_name = None
        self.historical_winners = []
        
    def fit_all(self):
        for model in self.models:
            model.fit()
        return self
        
    def calculate_rolling_errors(self) -> pd.DataFrame:
        """
        Creates a DataFrame of MSE for each model on a trailing window basis.
        """
        error_df = pd.DataFrame(index=self.returns.index)
        
        for model in self.models:
            vol = model.get_volatility_series()
            # Calculate short term rolling MSE against the RV target
            sq_error = (vol - self.rv_target) ** 2
            rolling_mse = sq_error.rolling(self.lookback_window, min_periods=1).mean()
            error_df[model.name] = rolling_mse
            
        return error_df

    def get_selected_features(self) -> Dict[str, pd.Series]:
        """
        Dynamically constructs the 'best' volatility and residuals for every timestep
        by switching models whenever a model outperforms the others in the short-term window.
        """
        error_df = self.calculate_rolling_errors()
        
        # Forward and back fill to prevent ValueError on idxmin if a row is all NaNs (due to rolling windows)
        error_df = error_df.bfill().ffill()
        
        # Determine the winner index for each time step
        winner_series = error_df.idxmin(axis=1)
        
        # For tracking in the logs, what is the most recent winner
        self.winning_model_name = winner_series.iloc[-1]
        self.historical_winners = winner_series
        
        # Initialize output structures
        best_vol = pd.Series(index=self.returns.index, dtype=float)
        best_resid = pd.Series(index=self.returns.index, dtype=float)
        
        # Map out the actual values for the winning regime
        for model in self.models:
            vol = model.get_volatility_series()
            resid = model.get_residuals()
            
            mask = (winner_series == model.name)
            best_vol[mask] = vol[mask]
            best_resid[mask] = resid[mask]
            
        return {
            "best_vol_series": best_vol,
            "best_residuals": best_resid,
            "regime_history": winner_series
        }
