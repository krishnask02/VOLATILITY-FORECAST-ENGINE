import pandas as pd
import numpy as np

class HARModel:
    """
    Heterogeneous Autoregressive model for realized volatility.
    Calculates moving averages at Daily, Weekly, and Monthly frequencies.
    """
    def __init__(self, rv: pd.Series):
        self.rv = rv

    def generate_features(self) -> pd.DataFrame:
        """
        Constructs HAR features.
        """
        df = pd.DataFrame(self.rv, columns=['RV_daily'])
        df['RV_weekly'] = self.rv.rolling(5).mean()
        df['RV_monthly'] = self.rv.rolling(22).mean()
        return df.dropna()
