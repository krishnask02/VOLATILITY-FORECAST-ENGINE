import numpy as np
from scipy.stats import norm
from scipy.optimize import brentq

class ImpliedVolatilityModel:
    """
    Mathematically inverted Black-Scholes model to estimate Implied Volatility.
    Uses the Brent root-finding method.
    """
    def __init__(self, risk_free_rate: float = 0.05):
        self.r = risk_free_rate

    def black_scholes_call(self, S: float, K: float, T: float, sigma: float) -> float:
        """
        Standard BSM Call Option Price
        """
        # Handle zero variance edge cases
        if sigma <= 0 or T <= 0:
            return max(0.0, S - K)
            
        d1 = (np.log(S / K) + (self.r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
        d2 = d1 - sigma * np.sqrt(T)
        
        call_price = (S * norm.cdf(d1)) - (K * np.exp(-self.r * T) * norm.cdf(d2))
        return call_price

    def estimate_iv(self, market_price: float, S: float, K: float, T: float, option_type: str = 'C') -> float:
        """
        Finds the Implied Volatility that matches the market price using brentq.
        """
        if market_price <= 0:
            return 0.0001
            
        if option_type != 'C':
            raise NotImplementedError("Currently only Call option IV is implemented.")

        # Define objective function: Difference between BSM Price and Market Price
        def objective_function(sigma):
            return self.black_scholes_call(S, K, T, sigma) - market_price

        try:
            # We search for implied volatility between 0.1% and 500%
            iv = brentq(objective_function, 1e-4, 5.0, xtol=1e-5)
            # Volatility is conventionally an annualized percentage
            return iv
        except ValueError:
            print("Failed to converge on an Implied Volatility.")
            return np.nan
