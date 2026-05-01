"""
visualization.py
3D and 2D visualizations for market wave surfaces with neon/dark theme and animation.
"""
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import cm
from matplotlib.animation import FuncAnimation
from mpl_toolkits.mplot3d import Axes3D
import pandas as pd

plt.style.use("dark_background")

# Neon color palette
def neon_palette():
    return ["#00fff7", "#a259f7", "#39ff14"]  # cyan, purple, green

def plot_3d_surface(time, assets, surface, title="3D Surface", cmap="cool",
                    zlim=None, color_map_intensity=None, animate=False, save_path=None):
    fig = plt.figure(figsize=(12, 8))
    ax = fig.add_subplot(111, projection="3d")
    X, Y = np.meshgrid(np.arange(len(time)), np.arange(len(assets)))
    # Add a subtle undulation for a more liquid look
    Z = surface.T + 0.5 * np.sin(0.2 * X + 0.3 * Y)
    # Use a smooth, liquid-like colormap
    liquid_cmap = cm.magma
    if color_map_intensity is not None:
        normed = (color_map_intensity.T - np.nanmin(color_map_intensity)) / (np.nanmax(color_map_intensity) - np.nanmin(color_map_intensity) + 1e-8)
        colors = liquid_cmap(normed)
    else:
        normed = (Z - np.nanmin(Z)) / (np.nanmax(Z) - np.nanmin(Z) + 1e-8)
        colors = liquid_cmap(normed)
    # Main surface: high transparency for liquid look
    surf = ax.plot_surface(X, Y, Z, facecolors=colors, rstride=1, cstride=1, linewidth=0, antialiased=True, alpha=0.65)
    # Glow/blur effect: overlay several more transparent surfaces
    for blur in [2, 4, 6]:
        surf_blur = ax.plot_surface(
            X, Y, Z + np.random.normal(0, 0.05 * blur, Z.shape),
            facecolors=colors, rstride=1, cstride=1, linewidth=0, antialiased=True, alpha=0.08)
    # Neon edge lines for extra glow
    for i in range(len(assets)):
        ax.plot(X[i], Y[i], Z[i], color=neon_palette()[i%3], linewidth=4, alpha=0.10)
        ax.plot(X[i], Y[i], Z[i], color=neon_palette()[i%3], linewidth=1.5, alpha=0.5)
    ax.set_xticks(np.arange(len(time))[::max(1, len(time)//10)])
    ax.set_xticklabels([str(t)[:10] for t in time[::max(1, len(time)//10)]], rotation=30, fontsize=8)
    ax.set_yticks(np.arange(len(assets)))
    ax.set_yticklabels(assets, fontsize=10)
    ax.set_zlabel("Returns")
    ax.set_title(title, color=neon_palette()[1], fontsize=16, pad=20)
    if zlim:
        ax.set_zlim(zlim)
    if save_path:
        plt.savefig(save_path, dpi=200, bbox_inches="tight", transparent=True)
    plt.show()

def animate_surface(time, assets, surfaces, title="Animated 3D Surface", cmap="cool",
                    color_map_intensity=None):
    fig = plt.figure(figsize=(12, 8))
    ax = fig.add_subplot(111, projection="3d")
    liquid_cmap = cm.magma
    def update(frame):
        ax.clear()
        Z = surfaces[frame]
        n_time = Z.shape[1]
        X, Y = np.meshgrid(np.arange(n_time), np.arange(len(assets)))
        # Add undulation for liquid effect
        Z_liquid = Z + 0.5 * np.sin(0.2 * X + 0.3 * Y + 0.2 * frame)
        if color_map_intensity is not None:
            normed = (color_map_intensity[frame] - np.nanmin(color_map_intensity[frame])) / (np.nanmax(color_map_intensity[frame]) - np.nanmin(color_map_intensity[frame]) + 1e-8)
            colors = liquid_cmap(normed)
        else:
            normed = (Z_liquid - np.nanmin(Z_liquid)) / (np.nanmax(Z_liquid) - np.nanmin(Z_liquid) + 1e-8)
            colors = liquid_cmap(normed)
        # Main surface: high transparency for liquid look
        surf = ax.plot_surface(X, Y, Z_liquid, facecolors=colors, rstride=1, cstride=1, linewidth=0, antialiased=True, alpha=0.65)
        # Glow/blur overlays
        for blur in [2, 4, 6]:
            surf_blur = ax.plot_surface(
                X, Y, Z_liquid + np.random.normal(0, 0.05 * blur, Z_liquid.shape),
                facecolors=colors, rstride=1, cstride=1, linewidth=0, antialiased=True, alpha=0.08)
        # Neon edge lines for extra glow
        for i in range(len(assets)):
            ax.plot(X[i], Y[i], Z_liquid[i], color=neon_palette()[i%3], linewidth=4, alpha=0.10)
            ax.plot(X[i], Y[i], Z_liquid[i], color=neon_palette()[i%3], linewidth=1.5, alpha=0.5)
        # Set ticks and labels for current window
        xticks = np.arange(0, n_time, max(1, n_time//10))
        ax.set_xticks(xticks)
        if len(time) >= n_time:
            ax.set_xticklabels([str(t)[:10] for t in time[frame:frame+n_time:max(1, n_time//10)]], rotation=30, fontsize=8)
        ax.set_yticks(np.arange(len(assets)))
        ax.set_yticklabels(assets, fontsize=10)
        ax.set_zlabel("Returns")
        ax.set_title(title, color=neon_palette()[1], fontsize=16, pad=20)
        return surf,
    anim = FuncAnimation(fig, update, frames=len(surfaces), interval=80, blit=False)
    plt.show()
    return anim

def plot_2d_line(time, series, asset, color="#00fff7"):
    plt.figure(figsize=(10, 4))
    plt.plot(time, series, color=color, linewidth=2, alpha=0.8)
    # Glow effect
    plt.plot(time, series, color=color, linewidth=8, alpha=0.15)
    plt.title(f"{asset} Returns Over Time", color=color, fontsize=14)
    plt.xlabel("Time")
    plt.ylabel("Returns")
    plt.grid(False)
    plt.show()

def plot_heatmap(returns: pd.DataFrame, title="Returns Heatmap"):
    plt.figure(figsize=(12, 4))
    plt.imshow(returns.T, aspect="auto", cmap="cool", interpolation="nearest")
    plt.colorbar(label="Returns")
    plt.yticks(np.arange(len(returns.columns)), returns.columns)
    plt.xticks(np.arange(0, len(returns.index), max(1, len(returns.index)//10)),
               [str(t)[:10] for t in returns.index[::max(1, len(returns.index)//10)]], rotation=30)
    plt.title(title, color=neon_palette()[2], fontsize=14)
    plt.xlabel("Time")
    plt.ylabel("Assets")
    plt.show()
