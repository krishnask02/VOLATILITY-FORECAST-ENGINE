import pandas as pd
import numpy as np

def parkinson_estimator(df: pd.DataFrame, window: int = 21) -> pd.Series:
    """
    Estimates volatility using high and low prices.
    """
    rs = (1.0 / (4.0 * np.log(2.0))) * (np.log(df['High'] / df['Low']) ** 2)
    return np.sqrt(rs.rolling(window=window).mean())

def garman_klass_estimator(df: pd.DataFrame, window: int = 21) -> pd.Series:
    """
    Estimates volatility using open, high, low, and close prices.
    """
    log_hl = np.log(df['High'] / df['Low']) ** 2
    log_co = np.log(df['Close'] / df['Open']) ** 2
    rs = 0.5 * log_hl - (2.0 * np.log(2.0) - 1.0) * log_co
    return np.sqrt(rs.rolling(window=window).mean())
