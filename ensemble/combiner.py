import pandas as pd

class HybridCombiner:
    """
    Combines outputs of various volatility models.
    """
    @staticmethod
    def simple_addition(garch_forecast: pd.Series, nn_residuals: pd.Series) -> pd.Series:
        """
        Final volatility:
        sigma_t = sigma_GARCH_t + NN(features_t)
        """
        combined = garch_forecast + nn_residuals
        # Floor at 0 just in case the NN correction is heavily negative
        return combined.clip(lower=0.0)

    @staticmethod
    def weighted_average(garch_forecast: pd.Series, nn_forecast: pd.Series, weight_garch: float = 0.5) -> pd.Series:
        """
        Weighted average ensemble. 
        """
        weight_nn = 1.0 - weight_garch
        return (weight_garch * garch_forecast) + (weight_nn * nn_forecast)
