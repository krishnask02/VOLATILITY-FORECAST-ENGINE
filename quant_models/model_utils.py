import numpy as np

def annualize_volatility(daily_vol: np.ndarray, trading_days: int = 252) -> np.ndarray:
    """
    Converts daily volatility to annualized.
    """
    return daily_vol * np.sqrt(trading_days)
