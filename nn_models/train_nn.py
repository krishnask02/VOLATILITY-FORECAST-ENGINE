import torch
from torch.utils.data import DataLoader, TensorDataset
import torch.nn as nn
import torch.optim as optim
import pandas as pd
import numpy as np

def train_volatility_model(
    model: nn.Module, 
    X: pd.DataFrame, 
    y: pd.Series, 
    epochs: int = 50, 
    batch_size: int = 32, 
    learning_rate: float = 0.001,
    verbose: bool = True
):
    """
    Trains the Volatility Neural Network.
    Formula: MSE(predicted_volatility, realized_volatility)
    """
    # Ensure target 'realized_vol' is stripped from training features if it was mapped via build_feature_matrix
    if 'realized_vol' in X.columns:
        X = X.drop(columns=['realized_vol'])
        
    # Convert data to tensors
    X_tensor = torch.tensor(X.values, dtype=torch.float32)
    y_tensor = torch.tensor(y.values, dtype=torch.float32).view(-1, 1)
    
    # Create DataLoader
    dataset = TensorDataset(X_tensor, y_tensor)
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=False)
    
    criterion = nn.MSELoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    
    # Cosine Annealing aggressively sweeps the loss basin, then lowers LR to lock optimal weights
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs, eta_min=1e-5)
    
    model.train()
    loss_history = []
    
    for epoch in range(epochs):
        epoch_loss = 0.0
        for batch_X, batch_y in loader:
            optimizer.zero_grad()
            
            # Forward pass
            predictions = model(batch_X)
            
            # Loss calculation
            loss = criterion(predictions, batch_y)
            
            # Backward pass
            loss.backward()
            optimizer.step()
            
            epoch_loss += loss.item()
            
        scheduler.step()
        avg_loss = epoch_loss/len(loader)
        loss_history.append(float(avg_loss))
        
        if verbose and (epoch + 1) % 10 == 0:
            print(f"Epoch {epoch+1}/{epochs}, Loss: {avg_loss:.6f}")
            
    return model, loss_history

def predict_volatility(model: nn.Module, X: pd.DataFrame) -> pd.Series:
    """
    Generates predictions using the trained model.
    """
    model.eval()
    if 'realized_vol' in X.columns:
        X = X.drop(columns=['realized_vol'])
        
    with torch.no_grad():
        X_tensor = torch.tensor(X.values, dtype=torch.float32)
        preds = model(X_tensor).numpy().flatten()
    
    return pd.Series(preds, index=X.index, name="NN_Residual_Vol")
