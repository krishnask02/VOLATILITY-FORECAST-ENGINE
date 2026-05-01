import pandas as pd
from nn_models.train_nn import train_volatility_model, predict_volatility

def expanding_window_evaluation(
    X: pd.DataFrame, 
    y: pd.Series, 
    model_class, 
    nn_epochs: int = 50, 
    nn_batch: int = 32, 
    nn_lr: float = 0.001, 
    initial_train_size: int = 252, 
    retrain_step: int = 30
) -> pd.Series:
    """
    Walk-forward evaluation with an expanding window.
    Retrains the Neural Network every `retrain_step` days to save compute context,
    but predicts the volatility iteratively block-by-block.
    """
    # Isolate training features out of X
    X_features = X.drop(columns=['realized_vol']) if 'realized_vol' in X.columns else X
    
    if len(X_features) <= initial_train_size:
        raise ValueError("Dataset is too small for the initial train size.")
        
    predictions = pd.Series(index=X.index, dtype=float)
    all_training_history = []
    
    print(f"Starting Walk-Forward Backtest (Total Length: {len(X_features)}, Initial Train: {initial_train_size}, Retrain Interval: {retrain_step} days)")
    
    for start_idx in range(initial_train_size, len(X_features), retrain_step):
        end_idx = min(start_idx + retrain_step, len(X_features))
        
        # Expanding window sizes
        train_X = X_features.iloc[:start_idx]
        train_y = y.iloc[:start_idx]
        test_X = X_features.iloc[start_idx:end_idx]
        
        print(f" -> Backtesting Step [Training on 0:{start_idx}] [Predicting {start_idx}:{end_idx}]...")
        
        # Re-initialize Neural Network
        model = model_class(input_dim=X_features.shape[1])
        
        # Train silently
        trained_model, loss_history = train_volatility_model(
            model, train_X, train_y, 
            epochs=nn_epochs, 
            batch_size=nn_batch, 
            learning_rate=nn_lr,
            verbose=False
        )
        
        all_training_history.append({
            "step": f"Train: 0-{start_idx}",
            "losses": loss_history
        })
        
        # Predict on out-of-sample block
        preds = predict_volatility(trained_model, test_X)
        predictions.iloc[start_idx:end_idx] = preds.values
        
    return predictions.dropna(), all_training_history
