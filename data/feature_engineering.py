import pandas as pd
import numpy as np

def build_feature_matrix(
    returns: pd.Series, 
    garch_vol: pd.Series, 
    garch_resid: pd.Series, 
    rv: pd.Series,
    market_data: pd.DataFrame,
    macro_data: pd.DataFrame,
    sentiment: pd.Series
) -> pd.DataFrame:
    """
    Constructs the feature matrix X_t for the neural network, including microstructure and macro features.
    """
    
    # Microstructure features
    # Proxy LOB spread using High-Low spread
    high_low_spread = (market_data['High'] - market_data['Low']) / market_data['Close']
    
    # Handle log volume (0 -> 1 before log to avoid -inf)
    volume = market_data['Volume'].replace(0, 1)
    log_volume = np.log(volume)
    
    # Macro features
    if not macro_data.empty and 'Close' in macro_data.columns:
        vix_close = macro_data['Close']
        vix_ret = np.log(vix_close / vix_close.shift(1)).fillna(0)
    else:
        # Fallback if VIX isn't available
        vix_close = pd.Series(0, index=returns.index)
        vix_ret = pd.Series(0, index=returns.index)

    # Note: reindex everything to `returns` to ensure we don't drop rows unnecessarily yet
    # but we will dropna() at the end to ensure clean inputs for the NN
    
    df = pd.DataFrame({
        'returns': returns,
        'garch_vol': garch_vol,
        'garch_resid': garch_resid,
        'realized_vol': rv,
        'hl_spread': high_low_spread,
        'log_volume': log_volume,
        'vix_close': vix_close,
        'vix_ret': vix_ret,
        'sentiment': sentiment
    })
    
    # Forward fill macro data in case timestamps slightly mismatch between asset and VIX
    df['vix_close'] = df['vix_close'].ffill()
    df['vix_ret'] = df['vix_ret'].ffill()
    
    df = df.dropna()
    
    # Add squared returns
    df['returns_sq'] = df['returns'] ** 2
    
    # Reorder columns to a specific stable order
    features = [
        'returns', 'returns_sq', 'garch_vol', 'garch_resid', 'realized_vol',
        'hl_spread', 'log_volume', 'vix_close', 'vix_ret', 'sentiment'
    ]
    X = df[features].copy()
    
    # -----------------------------------------------------------------
    # Z-Score Standardization
    # Deep Neural Networks require normalized variances to avoid gradient collision
    # -----------------------------------------------------------------
    # We do NOT standardize 'realized_vol' directly if it's the target `y`, 
    # and we also DO NOT standardize 'garch_vol' because it represents actual 
    # unscaled financial metrics required for the Hybrid Combiner arithmetic later!
    # Small volatility metrics (~0.01) are perfectly safe for Neural Networks unscaled.
    feature_cols = [c for c in features if c not in ('realized_vol', 'garch_vol')]
    
    for col in feature_cols:
        col_mean = X[col].mean()
        col_std = X[col].std()
        if col_std > 1e-6:
            X[col] = (X[col] - col_mean) / col_std
    
    return X
