import pandas as pd

def remove_outliers(df: pd.DataFrame, column: str = 'Close', z_threshold: float = 3.0) -> pd.DataFrame:
    """
    Removes extreme outliers based on z-score.
    Useful for cleaning erroneous spikes in price data.
    """
    z_scores = (df[column] - df[column].mean()) / df[column].std()
    clean_df = df[abs(z_scores) < z_threshold].copy()
    return clean_df

def interpolate_missing_data(df: pd.DataFrame, method: str = 'linear') -> pd.DataFrame:
    """
    Fills in missing chunks of data.
    """
    return df.interpolate(method=method)
