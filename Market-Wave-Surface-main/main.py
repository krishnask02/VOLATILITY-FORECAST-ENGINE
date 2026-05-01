"""
main.py
Entry point for the Market Wave Surface project.
Loads data, computes returns, trains ML model, predicts, and visualizes results.
"""
import pandas as pd
import numpy as np
from data_loader import load_data, compute_returns
from ml_model import train_linear_regression, predict_next_returns
from visualization import plot_3d_surface, animate_surface, plot_2d_line, plot_heatmap
from utils import calculate_volatility

# --- Configuration ---
ASSETS = ["AAPL", "MSFT", "GOOGL"]
START_DATE = "2022-01-01"
END_DATE = "2023-01-01"
USE_MOCK = False  # Set True for offline demo

# --- Data Loading ---
prices = load_data(ASSETS, START_DATE, END_DATE, use_mock=USE_MOCK)
returns = compute_returns(prices)

# --- ML Model Training & Prediction ---
models = train_linear_regression(returns)
pred_returns = predict_next_returns(models, returns)

# --- Volatility Calculation ---
volatility = calculate_volatility(returns, window=10)

# --- 3D Surface Visualization ---
time = returns.index.astype(str)
assets = returns.columns.tolist()
surface = returns.values
pred_surface = pred_returns.values
vol_intensity = volatility.values

# --- Plot Actual 3D Surface ---
plot_3d_surface(time, assets, surface, title="Actual Returns Surface", color_map_intensity=vol_intensity)

# --- Plot Predicted 3D Surface ---
plot_3d_surface(time, assets, pred_surface, title="Predicted Returns Surface", color_map_intensity=vol_intensity)

# --- Animate Actual Returns Surface ---
# For animation, use a rolling window
window = 30
# Each surface for animation must have shape (len(assets), window+1)
surfaces = [surface[i-window:i+1].T for i in range(window, len(surface))]
vol_slices = [vol_intensity[i-window:i+1].T for i in range(window, len(surface))]
anim_time = [time[i-window:i+1] for i in range(window, len(surface))]
if surfaces:
    animate_surface(time, assets, surfaces, title="Animated Returns Surface", color_map_intensity=vol_slices)

# --- 2D Line Chart for First Asset ---
plot_2d_line(time, returns.iloc[:, 0], assets[0], color="#00fff7")

# --- Heatmap of Returns ---
plot_heatmap(returns, title="Returns Heatmap")

print("All visualizations complete. Close all windows to finish.")
