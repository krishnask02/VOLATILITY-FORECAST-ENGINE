# ⚡ Hybrid Volatility Engine: Quantitative Architecture
> High-Frequency Econometric & Natural Language Model specifically designed for Asymmetric Volatility Forecasting and Options Risk Extrapolation.

This documentation serves as the deep technical, mathematical, and algorithmic primer for the engine. For a non-technical project overview, please refer to the standard `README.md`.

---

## 🛠 Tech Stack & Infrastructure

### Backend (Quantitative Pipeline)
*   **Core:** Python 3.11, `pandas`, `numpy` (Vectorized microstructure parsing).
*   **Econometrics:** `arch` library for maximum likelihood estimation (MLE) of conditional heteroskedasticity.
*   **Deep Learning:** PyTorch (`torch`, `torch.nn`, `torch.optim`) for Residual Neural Networks and GPU-accelerated tensor math.
*   **Natural Language Processing:** HuggingFace `transformers` (ProsusAI/FinBERT) for real-time sentiment extraction.
*   **Server Framework:** FastAPI with Server-Sent Events (SSE) `StreamingResponse` for live NDJSON telemetry arrays. `uvicorn` ASGI.
*   **Data APIs:** `yfinance` for $T-60$ intraday 5-minute ticks and live $T_0$ spot quotes.

### Frontend (SPA & Data Visualization)
*   **Framework:** React (`react-router-dom`) + Vite bundler.
*   **Styling & UI:** Vanilla CSS + Tailwind CSS (compiled JIT). Glassmorphism custom token sets.
*   **Visualization:** `plotly.js` (`react-plotly.js`) deployed via WebGL for hardware-accelerated rendering of $O(N^2)$ stochastic path matrices.
*   **State Management:** React Context API (`EngineContext`) caching the entire server payload across the Virtual DOM.

---

## 📐 Mathematical & Econometric Postulates

### 1. Logarithmic Returns & Microstructure
Standard asset modeling begins with closing price $P_t$. To achieve covariance stationarity, we map the first difference of the logarithm:

$$ R_t = \ln\left(\frac{P_t}{P_{t-1}}\right) $$

To ingest secondary microstructure features without introducing strict multicollinearity, we engineer the High-Low spread as a proxy for liquidity density (LOB depth):
$$ \text{Spread}_t = \frac{\text{High}_t - \text{Low}_t}{\text{Close}_t} $$

### 2. Auto-Regressive Conditional Heteroskedasticity (Target Baseline)
Classical financial models assume variance $\sigma^2$ is constant (homoskedastic). We utilize the **GARCH(1,1)** framework, asserting variance is dynamic and mean-reverting:

$$ \sigma_t^2 = \omega + \alpha \epsilon_{t-1}^2 + \beta \sigma_{t-1}^2 $$

Where:
*   $\omega$ is the long-term structural variance baseline.
*   $\alpha$ measures the "shock" constraint (reaction to previous day's surprise $\epsilon_{t-1}$).
*   $\beta$ defines variance persistence (memory of previous volatility).

**Asymmetric Shocks:** The engine's *Adaptive Selector* dynamically traverses **EGARCH** and **GJR-GARCH** via Akaike Information Criterion (AIC). If the asset displays a heavy *leverage effect* (volatility spikes higher on negative returns $R_t < 0$), EGARCH isolates this asymmetry:
$$ \ln(\sigma_t^2) = \omega + \beta \ln(\sigma_{t-1}^2) + \alpha \left[ \frac{|\epsilon_{t-1}|}{\sigma_{t-1}} - \sqrt{\frac{2}{\pi}} \right] + \gamma \frac{\epsilon_{t-1}}{\sigma_{t-1}} $$

### 3. PyTorch Deep Residual AI Architecture
GARCH is linear and rigid. To account for market paradigm shifts, non-linear human behavior, and high-frequency noise, we built a non-linear network to predict the mathematical *residual* error of the GARCH baseline.

**Feature Space mapped to Tensor $X \in \mathbb{R}^{T \times 9}$:**
*   $R_t$, $R_t^2$, Unscaled GARCH Volatility, Unscaled GARCH Residuals
*   Log Volume, H/L Spread, FinBERT Sentiment Score $[-1, 1]$
*   VIX Close, VIX Log Returns

**Z-Score Standardization Limit:**
To prevent catastrophic gradient explosions, features $f_i$ (excluding base volatilities) are standardized:
$$ Z_i = \frac{f_i - \mu_i}{\sigma_i} $$

**Deep Residual Topology:**
*   Dense Matrix Projections $\rightarrow$ Gaussian Error Linear Units (GELU) $\rightarrow$ Dropout (p=0.2).
*   **Skip Connections (Residual Blocks):** $H(x) = F(x) + x$. This guarantees exact mapping of raw variance shocks deeper into the network.
*   **Optimizer:** `Adam` iterating backpropagation locked on Mean Squared Error $\min \sum (RV_t - \hat{\sigma}_{NN})^2$. Governed by `CosineAnnealingLR` over 50 epochs.
*   **Hybrid Combiner:** $\hat{\sigma}_{Final} = \max(\hat{\sigma}_{GARCH} + \hat{\sigma}_{NN}, 0.0001)$

### 4. Expanding Window Evaluation (Walk-Forward Backtest)
Preventing Look-Ahead bias (Data Leakage) is strictly enforced. The model initializes on $T=1560$ (5-minute ticks). It solves MLE equations, trains the PyTorch weights, and predicts forward $T=390$ steps out-of-sample. The window expands. 

This generates the **MSE Learning Convergence** metric seen in the Dashboard—proving empirical mathematical edge $P(\text{Loss}_{t} < \text{Loss}_{t-1})$.

### 5. Stochastic Extrapolation (Monte Carlo Fan Matrices)
Finally, after deriving $\hat{\sigma}_{Final}$ (the actual real-time implied engine volatility), we generate $N=500$ stochastic iterations of Future Asset Price $S_T$ utilizing **Geometric Brownian Motion (GBM)** via Ito Calculus:

$$ dS_t = \mu S_t dt + \sigma S_t dW_t $$
Where:
*   $\mu S_t dt$ is the deterministic drift term.
*   $\sigma S_t dW_t$ is the random shock governed by our Hybrid $\hat{\sigma}_{Final}$ and a Wiener Process $W_t \sim \mathcal{N}(0, t)$.

The matrix $X \in \mathbb{R}^{500 \times 21}$ is parsed mathematically through PyTorch and returned as an NDJSON binary stream to the WebGL Frontend for rendering 95th Percentile Fan Boundary limits.
