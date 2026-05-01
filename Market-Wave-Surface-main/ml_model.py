"""
ml_model.py
Defines and trains regression/time-series models for return prediction.
"""
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from typing import Tuple

def train_linear_regression(returns: pd.DataFrame) -> dict:
    """
    Trains a simple linear regression for each asset to predict next-step return.
    Returns a dict of asset: model
    """
    models = {}
    for asset in returns.columns:
        X = returns[asset].shift(1).dropna().values.reshape(-1, 1)
        y = returns[asset].dropna().values[1:]
        model = LinearRegression().fit(X, y)
        models[asset] = model
    return models

def predict_next_returns(models: dict, returns: pd.DataFrame) -> pd.DataFrame:
    """
    Predicts next-step returns for each asset using trained models.
    Returns DataFrame with same shape as returns (NaN for first row).
    """
    preds = pd.DataFrame(index=returns.index, columns=returns.columns)
    for asset, model in models.items():
        X = returns[asset].shift(1)
        mask = ~X.isna()
        X_valid = X[mask].values.reshape(-1, 1)
        pred = np.full(len(X), np.nan)
        if len(X_valid) > 0:
            pred[mask.values] = model.predict(X_valid)
        preds[asset] = pred
    return preds
