import React, { useState } from 'react';
import GlareHover from '../components/shared/GlareHover';
import { Database, BrainCircuit, ActivitySquare, TerminalSquare, Sigma, Settings, Globe, LineChart, Zap, LayoutDashboard } from 'lucide-react';

const NODE_DETAILS = {
  external_data: {
    title: "1. External Data APIs",
    type: "Ingestion Layer",
    math: "D_t = \\{ P_{t,i}, V_{t,i}, N_{t,i} : i \\in \\text{Assets} \\}",
    color: "#a1a1aa", // zinc-400
    description: "Connects to downstream pipelines, pulling zero-lag limit order quotes, historical daily bars, and fundamental vectors from multiple third-party API nodes (e.g. YFinance, Alpaca).",
    code: "ingest_raw_market_data(source='yfinance')"
  },
  feature_eng: {
    title: "2. Feature Engineering",
    type: "Transform Pipeline",
    math: "F(X) = \\{ \\ln(\\frac{P_t}{P_{t-1}}), \\frac{H-L}{C}, \\ln(V) \\}",
    color: "#60a5fa", // blue-400
    description: "Computes discrete log-returns, systemic volume shifts, and high-low limit order dynamics directly off raw structural data to guarantee covariance stationarity.",
    code: "build_feature_matrix(returns, rv, vix_close)"
  },
  garch: {
    title: "3A. GARCH Engine",
    type: "Classical Foundation",
    math: "\\sigma^2_t = \\omega + \\alpha\\epsilon^2_{t-1} + \\beta\\sigma^2_{t-1}",
    color: "#fb923c", // orange-400
    description: "Iterates through EGARCH, GJR, and Standard constructs, isolating the lowest local MSE to extract mathematically defined standard volatility and raw residuals.",
    code: "AdaptiveModelSelector().get_best()"
  },
  nlp: {
    title: "3B. FinBERT NLP Context",
    type: "Market Sentiment",
    math: "\\Phi(X) = W_{Trans} \\times X_{News}",
    color: "#818cf8", // indigo-400 
    description: "Connects zero-lag scraping of target ticker news headlines directly into HuggingFace bounds, vectorizing positive and negative institutional positioning into deterministic probability scores [-1, 1].",
    code: "fetch_and_score_news(TARGET_TICKER)"
  },
  macro: {
    title: "3C. Macro Signals",
    type: "Regime Identification",
    math: "\\Delta M_t = \\ln(VIX_t/VIX_{t-1})",
    color: "#f43f5e", // rose-500
    description: "Integrates overarching macroeconomic fear benchmarks (VIX spot & log returns) into the localized asset structure to adapt against sudden severe global correlations.",
    code: "fetch_macro_regimes()"
  },
  residual_lstm: {
    title: "4. Residual Learning (NN / LSTM)",
    type: "Adaptive Non-Linear Network",
    math: "h_t = f_W(h_{t-1}, [\\epsilon_t, \\Phi(X), \\Delta M_t])",
    color: "#10b981", // emerald-500
    description: "Ingests the engineered arrays and GARCH residuals to compute deep non-linear corrections. It strictly avoids modeling standard volatility to focus its parameters solely on chaotic shocks.",
    code: "LSTMRegressor(input_dim=N).forward()"
  },
  vol_output: {
    title: "5. Hybrid Volatility Output",
    type: "Deterministic Matrix",
    math: "\\hat{\\sigma}_{Hybrid} = \\hat{\\sigma}_{GARCH} + \\hat{\\sigma}_{NN}",
    color: "#2dd4bf", // teal-400
    description: "Fuses the structural classical baseline with the deep learning localized error correction, producing a unified, mathematically robust forecast of tomorrow's realized volatility.",
    code: "engine.extract_hybrid_forecast()"
  },
  monte_carlo: {
    title: "6. Monte Carlo Simulation (GBM)",
    type: "Stochastic Extrapolation",
    math: "dS_t = \\mu S_t dt + \\hat{\\sigma}_{Hybrid} S_t dW_t",
    color: "#c084fc", // purple-400
    description: "Utilizes the forecasted hybrid volatility bounds to project 10,000 independent stochastic drift paths over an N-day window, defining the absolute 95% Expected Shortfall.",
    code: "mc_engine.simulate_gbm(vol_hybrid)"
  },
  fast_api: {
    title: "7. FastAPI Streaming API",
    type: "Backend Orchestration",
    math: "200 \\text{ OK} : application/x-ndjson",
    color: "#fbbf24", // amber-400
    description: "Asynchronous backend layer wrapping the quantitative PyTorch pipeline. It serializes millions of tensor matrices into high-performance NDJSON streams for the frontend.",
    code: "app.get('/api/v1/simulate/stream')"
  },
  react_dash: {
    title: "8. React + Plotly Dashboard",
    type: "Client Visualization",
    math: "\\text{WebGL} : \\mathbb{R}^3 \\to \\text{Pixels}",
    color: "#38bdf8", // sky-400
    description: "Vite-compiled React SPA that consumes standard API endpoints and streams data directly into WebGL 3D matrices, surfacing actionable stochastic paths without blocking the main event-loop.",
    code: "Plotly.newPlot('surface', data, layout)"
  }
};

export default function Architecture() {
  const [activeNode, setActiveNode] = useState('residual_lstm');
  
  const current = NODE_DETAILS[activeNode];

  const SystemNode = ({ id, icon: Icon, glow, customWidth }) => {
    const isActive = activeNode === id;
    const isLstm = id === 'residual_lstm';
    return (
      <div 
        onMouseEnter={() => setActiveNode(id)}
        className={`group relative w-full ${customWidth || 'max-w-[140px]'} cursor-pointer transition-all duration-300 ${isActive ? 'scale-110 z-50' : 'hover:scale-105 hover:z-[100] opacity-90 hover:opacity-100 z-10'}`}
      >
        <GlareHover 
            className={`py-3 px-4 border text-center transition-colors 
            ${isActive ? 'border-zinc-300 shadow-[0_0_20px_rgba(255,255,255,0.1)]' : isLstm ? 'border-emerald-900/50' : 'border-zinc-800'}
            `} 
            background="#050505"
            glareColor={NODE_DETAILS[id].color}
            glareOpacity={0.4}
            transitionDuration={400}
        >
            <Icon size={18} className={isActive ? 'text-white' : 'text-zinc-500'} />
            <span className="text-[8px] font-bold uppercase tracking-wide text-zinc-300 leading-tight">{NODE_DETAILS[id].title.split('. ')[1]}</span>
        </GlareHover>

        {/* Dynamic Abstract Hover Panes */}
        <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-[340px] p-6 bg-[#080808]/95 backdrop-blur-xl border border-zinc-800/80 rounded shadow-[0_40px_80px_-10px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-[100] transform origin-top -translate-y-2 group-hover:translate-y-0 text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest block mb-2 border-b border-zinc-800/50 pb-2" style={{ color: NODE_DETAILS[id].color }}>
                ► {NODE_DETAILS[id].type}
            </span>
            <div className="text-[10px] text-zinc-500 font-mono bg-zinc-900/40 p-2.5 rounded border border-zinc-800/50 mb-3 break-all truncate shadow-inner">
                {NODE_DETAILS[id].code}
            </div>
            
            <div className="mb-3 p-3 bg-black/50 border border-zinc-900 rounded font-serif italic text-white tracking-wider text-center text-sm shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                {NODE_DETAILS[id].math}
            </div>

            <p className="text-zinc-400 text-xs leading-relaxed text-justify">
                {NODE_DETAILS[id].description}
            </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex mt-4 border-t border-zinc-900/50">
      
      {/* FULL: MASTER (DAG Topology) */}
      <div className="w-full flex flex-col items-center p-8 lg:min-h-[80vh] overflow-y-auto scrollbar-none pb-32">
        <h3 className="text-zinc-600 font-bold uppercase tracking-widest text-[10px] mb-8 w-full max-w-4xl border-b border-zinc-900 pb-2 shrink-0 text-center">Topological Layout (DAG)</h3>
        
        {/* Tier 1 */}
        <SystemNode id="external_data" icon={Database} glow="rgba(161, 161, 170, 0.2)" />
        <div className="w-px h-6 bg-zinc-700 shrink-0"></div>

        {/* Tier 2 */}
        <SystemNode id="feature_eng" icon={Settings} glow="rgba(96, 165, 250, 0.2)" />
        
        {/* Branching Triad lines */}
        <div className="relative w-full max-w-[420px] h-6 flex justify-center mt-1 pointer-events-none shrink-0">
            <div className="absolute top-0 w-px h-1/2 bg-zinc-700"></div>
            <div className="absolute top-1/2 w-full border-t border-zinc-700 h-px"></div>
            <div className="absolute top-1/2 left-0 w-px h-1/2 bg-zinc-700"></div>
            <div className="absolute top-1/2 right-0 w-px h-1/2 bg-zinc-700"></div>
            <div className="absolute top-1/2 w-px h-1/2 bg-zinc-700"></div>
        </div>

        {/* Tier 3: Triad */}
        <div className="flex w-full justify-between items-start max-w-[500px] px-2 gap-4 shrink-0">
            <SystemNode id="garch" icon={Sigma} glow="rgba(251, 146, 60, 0.2)" />
            <SystemNode id="nlp" icon={ActivitySquare} glow="rgba(129, 140, 248, 0.2)" />
            <SystemNode id="macro" icon={Globe} glow="rgba(244, 63, 94, 0.2)" />
        </div>

        {/* Converge Triad lines */}
        <div className="relative w-full max-w-[420px] h-6 flex justify-center pointer-events-none mb-1 shrink-0">
            <div className="absolute top-0 left-0 w-px h-1/2 bg-zinc-700"></div>
            <div className="absolute top-0 right-0 w-px h-1/2 bg-zinc-700"></div>
            <div className="absolute top-0 w-px h-1/2 bg-zinc-700"></div>
            <div className="absolute top-1/2 w-full border-t border-zinc-700 h-px"></div>
            <div className="absolute top-1/2 w-px h-1/2 bg-zinc-700"></div>
        </div>

        {/* Tier 4 */}
        <SystemNode id="residual_lstm" icon={BrainCircuit} glow="rgba(16, 185, 129, 0.2)" customWidth="max-w-[180px]" />
        <div className="w-px h-6 bg-zinc-700 shrink-0"></div>

        {/* Tier 5 */}
        <SystemNode id="vol_output" icon={LineChart} glow="rgba(45, 212, 191, 0.2)" customWidth="max-w-[160px]" />
        <div className="w-px h-6 bg-zinc-700 shrink-0"></div>

        {/* Tier 6 */}
        <SystemNode id="monte_carlo" icon={TerminalSquare} glow="rgba(192, 132, 252, 0.2)" customWidth="max-w-[180px]" />
        <div className="w-px h-6 bg-zinc-700 shrink-0"></div>

        {/* Tier 7 */}
        <SystemNode id="fast_api" icon={Zap} glow="rgba(251, 191, 36, 0.2)" customWidth="max-w-[160px]" />
        <div className="w-px h-6 bg-zinc-700 shrink-0"></div>

        {/* Tier 8 */}
        <SystemNode id="react_dash" icon={LayoutDashboard} glow="rgba(56, 189, 248, 0.2)" customWidth="max-w-[180px]" />
        
      </div>
    </div>
  );
}
