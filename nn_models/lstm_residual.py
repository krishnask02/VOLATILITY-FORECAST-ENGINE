import torch
import torch.nn as nn

class ResidualBlock(nn.Module):
    """
    Core Residual mapping (Skip Connection) to allow historical data features
    to bypass rigid transformations, preserving raw metric variance.
    """
    def __init__(self, channels: int, dropout: float = 0.2):
        super(ResidualBlock, self).__init__()
        self.fc1 = nn.Linear(channels, channels)
        self.gelu = nn.GELU()
        self.dropout = nn.Dropout(dropout)
        
    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # F(x) = GELU(Dropout(W*x))
        residual = x
        out = self.fc1(x)
        out = self.dropout(out)
        out = self.gelu(out)
        # H(x) = F(x) + x
        return out + residual

class VolatilityNN(nn.Module):
    """
    Deep Residual neural network specializing in non-linear historical convergence.
    """
    def __init__(self, input_dim: int = 9): # 10 total cols, 9 inputs (excludes 'realized_vol')
        super(VolatilityNN, self).__init__()
        
        # Initial projection phase
        self.proj = nn.Linear(input_dim, 64)
        self.gelu = nn.GELU()
        
        # The deep residual core preventing gradient loss
        self.res1 = ResidualBlock(64, dropout=0.2)
        self.res2 = ResidualBlock(64, dropout=0.2)
        
        # Compression phase
        self.compress = nn.Linear(64, 32)
        self.res3 = ResidualBlock(32, dropout=0.2)
        
        # Output predicted volatility residual
        self.out = nn.Linear(32, 1)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Forward pass. Expects feature matrix shape: (batch_size, input_dim)
        """
        # Exclude realized_vol if passed identically (in expanding_window we just pass X, y separately. 
        # But wait! X currently includes realized_vol inside expanding_window setup? 
        # Let's cleanly just utilize the dimensions we receive.
        
        x = self.proj(x)
        x = self.gelu(x)
        
        x = self.res1(x)
        x = self.res2(x)
        
        x = self.compress(x)
        x = self.gelu(x)
        
        x = self.res3(x)
        
        out = self.out(x)
        return out
