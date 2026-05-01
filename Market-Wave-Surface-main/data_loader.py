"""
data_loader.py
Loads historical price data for multiple assets using yfinance or generates mock data.
"""
import numpy as np
import pandas as pd
import yfinance as yf
from typing import List, Tuple

def load_data(assets: List[str], start: str, end: str, use_mock: bool = False) -> pd.DataFrame:
    """
    Loads historical adjusted close prices for given assets between start and end dates.
    If use_mock is True, generates mock data instead.
    Returns a DataFrame: index=Date, columns=Assets, values=Prices
    """
    if use_mock:
        # Try to load sample data if available
        try:
            df = pd.read_csv("data/sample_data.csv", index_col=0, parse_dates=True)
            # Filter columns to match assets
            df = df[assets]
            return df.loc[start:end]
        except Exception:
            dates = pd.date_range(start, end)
            data = {asset: np.cumsum(np.random.randn(len(dates))) + 100 for asset in assets}
            df = pd.DataFrame(data, index=dates)
            return df
    else:
        df = yf.download(assets, start=start, end=end)
        # Handle both single and multi-index columns
        if isinstance(df.columns, pd.MultiIndex):
            if ("Adj Close" in df.columns.get_level_values(0)):
                df = df["Adj Close"]
            else:
                # fallback to Close if Adj Close not present
                df = df["Close"]
        elif "Adj Close" in df.columns:
            df = df["Adj Close"]
        elif "Close" in df.columns:
            df = df["Close"]
        if isinstance(df, pd.Series):
            df = df.to_frame()
        return df.dropna()

def compute_returns(prices: pd.DataFrame) -> pd.DataFrame:
    """
    Computes log returns from price DataFrame.
    """
    returns = np.log(prices / prices.shift(1)).dropna()
    return returns
