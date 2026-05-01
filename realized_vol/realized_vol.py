import pandas as pd
import numpy as np

def calculate_daily_realized_volatility(intraday_returns: pd.Series) -> float:
    """
    Calculates daily realized volatility from intraday returns 
    (e.g. 5-minute intervals).
    """
    return np.sqrt(np.sum(intraday_returns ** 2))

def calculate_historical_volatility(daily_returns: pd.Series, window: int = 21, annualize_factor: int = 252) -> pd.Series:
    """
    Calculates rolling historical volatility target based on daily returns.
    Useful when high-frequency data is not available.
    """
    return daily_returns.rolling(window=window).std() * np.sqrt(annualize_factor)
