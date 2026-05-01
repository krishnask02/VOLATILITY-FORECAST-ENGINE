import pandas as pd
import numpy as np

class BaseVolatilityModel:
    def __init__(self, returns: pd.Series, name: str):
        self.returns = returns
        self.name = name
        self.conditional_variance = None

    def fit(self):
        raise NotImplementedError

    def get_volatility_series(self) -> pd.Series:
        if self.conditional_variance is None:
            raise ValueError(f"{self.name} model not fitted yet.")
        # Ensure variance is strictly positive to avoid warning/errors
        var = np.maximum(self.conditional_variance, 1e-12)
        return np.sqrt(var)

    def get_residuals(self) -> pd.Series:
        if self.conditional_variance is None:
            raise ValueError(f"{self.name} model not fitted yet.")
        var = np.maximum(self.conditional_variance, 1e-12)
        sigma = np.sqrt(var)
        return self.returns / sigma

class StandardGARCH(BaseVolatilityModel):
    def __init__(self, returns: pd.Series):
        super().__init__(returns, "GARCH(1,1)")
        
    def fit(self):
        # Stub: rolling std as base volatility
        vol = self.returns.rolling(21, min_periods=1).std().fillna(self.returns.std())
        self.conditional_variance = vol ** 2
        return self

class EGARCH(BaseVolatilityModel):
    def __init__(self, returns: pd.Series):
        super().__init__(returns, "EGARCH(1,1)")
        
    def fit(self):
        # Stub: EGARCH behaves differently on negative returns
        # Pretend we are modeling asymmetry (leverage effect)
        vol = self.returns.rolling(21, min_periods=1).apply(
            lambda x: np.sqrt(np.sum((x[x < 0]**2) * 1.5 + (x[x >= 0]**2) * 0.5) / len(x))
        ).fillna(self.returns.std())
        self.conditional_variance = vol ** 2
        return self

class GJRGARCH(BaseVolatilityModel):
    def __init__(self, returns: pd.Series):
        super().__init__(returns, "GJR-GARCH(1,1)")
        
    def fit(self):
        # Stub: Another form of asymmetric volatility
        vol = self.returns.rolling(14, min_periods=1).std().fillna(self.returns.std()) * 1.1
        self.conditional_variance = vol ** 2
        return self
