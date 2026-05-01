"""
utils.py
Utility functions for the project.
"""
import numpy as np
import pandas as pd

def calculate_volatility(returns: pd.DataFrame, window: int = 10) -> pd.DataFrame:
    """
    Calculates rolling volatility (std dev) for each asset.
    """
    return returns.rolling(window=window).std()
