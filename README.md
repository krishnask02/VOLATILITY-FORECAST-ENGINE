# Hybrid Volatility Engine: AI-Powered Options Pricing

## 1. Why Did We Build This Project?
In quantitative finance, accurately predicting *Volatility* (how wildly a stock's price will swing) is the holy grail of options trading. For decades, Wall Street has relied on classical mathematical formulas like the Black-Scholes model and Econometric models like GARCH. 

The problem? **Classical math models are rigid.** They fail to account for the chaotic, sudden shocks of modern markets (like unexpected news tweets, sudden volume spikes, or retail trading frenzies). 

We built this project to solve this exact flaw. We wanted to create a **"Hybrid Engine"**—a system that takes the rigorous, trusted math of classical finance, and feeds it into the adaptable, pattern-recognizing brain of a Deep Learning Neural Network. This allows us to predict market swings with vastly higher accuracy than traditional formulas.

---

## 2. What Exactly Did We Do?
We architected a complete, full-stack quantitative trading platform. 
1. **Data Ingestion:** The engine automatically scrapes the stock market and financial news feeds in real-time.
2. **Mathematical Foundation:** It runs complex classical statistical math to find the "baseline" volatility.
3. **AI Correction:** It feeds that baseline into a PyTorch Neural Network to correct mathematical errors based on hidden market patterns.
4. **Visual Dashboard:** Finally, it streams all of these complex calculations into a beautiful, easy-to-read web dashboard that tells a trader exactly whether the current market options are "Under-Priced" or "Over-Priced".

---

## 3. How We Created the Hybrid Models
To build the most accurate system, we use an **Ensemble Pattern** (combining multiple models together):
- **The Classical Math (GARCH):** We built an *Adaptive Econometric Selector*. It looks at the stock, tests three different classical math models (GARCH, EGARCH, GJR-GARCH), and automatically selects the one that best fits the current market regime. 
- **The Neural Network (PyTorch):** Classical models are purely math-based, meaning they miss non-linear human behavior. We built a customized **Deep Residual Neural Network**. We feed this network 9 different features (stock volume, High/Low spreads, options indexes). To stop the network from crashing from widely varying numbers, we use something called **"Z-Score Normalization"** (scaling every wild number perfectly proportionally). The network uses "Residual Skip Connections," meaning it can remember raw historical anomalies deeply without forgetting them during learning. 

---

## 4. The Datasets and APIs (Where Does the Data Come From?)
To make this work, we need both a massive historical dataset for training the AI, and a live data feed to make real-time predictions.

- **The Historic Dataset:** We programmatically pull our dataset using the `yfinance` API (from Yahoo Finance). We specifically download the absolute maximum intraday resolution allowed by the system: **The last 60 days of human trading, broken down into precise 5-minute intervals.** This provides thousands of rows of Open, High, Low, Close, and Volume metrics. Analyzing historical data in fast 5-minute ticks instead of slow daily ticks gives our Neural Network massively more action to learn from.
- **The Live API (Real-Time Data):** After the model is finished tracking the 60-day dataset, it pings the Yahoo API one more time to get the absolute live, to-the-second price of the target stock (currently hardcoded as **Apple Inc. / AAPL**). It also pulls data for the **S&P 500 VIX** (The universal market fear index).
- **The Sentiment API (FinBERT):** Stock prices move wildly based on news. We integrated the HuggingFace API to utilize **FinBERT**—a Natural Language Processing (NLP) model trained strictly on financial text. It scans the live internet for news regarding Apple, reads the English headlines, and mathematically scores whether the news is "Negative, Neutral, or Positive", feeding that emotion directly into our PyTorch Neural Network.

---

## 5. How We Conducted Backtesting
You cannot train an AI on financial data just once. A stock market model trained in a roaring bull market will fail miserably in a sudden crash.
To mathematically solve this, our code conducts **Expanding Window Walk-Forward Evaluation**.
1. We give the AI a small "window" of the oldest data (e.g., Days 1–10) and ask it to predict Day 11.
2. We then evaluate its error (Mean Squared Error).
3. Then, we "walk forward." We give the AI Days 1–11, and ask it to predict Day 12. 
4. We force the AI to do this repeatedly for 50 intense cycles ("Epochs"), constantly dropping its internal math errors drastically until it demonstrates complete adaptability to all previous time frames.

---

## 6. The Web Dashboard (Frontend UI)
Engineers love staring at raw Python terminal text, but non-engineers and traders need fast, beautiful visual insights. We built the frontend using **React.js, Vite, and Tailwind CSS**. 

We heavily prioritized visual excellence:
- **Two-Phase Architecture:** When you click "Initialize," the frontend loader actively tracks what the Python backend is doing. It shows you exactly when it's training on the Historical Dataset, and when it switches over to pulling Live API data.
- **Master-Detail Layout:** We built a dedicated "Architecture" page featuring an interactive system map. You can click on any node in the map (like the Neural Network Node or the NLP model), and a sleek side-panel will dynamically slide out explaining exactly what that specific piece of code is currently doing.
- **Visual Analytics:** We used high-performance WebGL to render complex 2D Monte Carlo fan charts and loss convergence curves. The UI is designed in a premium, ultra-modern "monochrome black glassmorphism" aesthetic, turning a highly complex quantitative mathematics script into a gorgeous, enterprise-ready web application!
