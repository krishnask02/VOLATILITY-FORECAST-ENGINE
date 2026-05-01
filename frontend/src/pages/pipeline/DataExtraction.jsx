import { useState } from 'react';
import { useEngine } from '../../context/EngineContext';
import SpotlightCard from '../../components/shared/SpotlightCard/SpotlightCard';

const FEATURE_EXPLANATIONS = {
  returns: { 
      title: "Logarithmic Returns", 
      math: "R_t = ln(P_t / P_{t-1})", 
      detailedDesc: "Logarithmic returns are fundamentally required to normalize the absolute price action of the asset. By calculating the continuous compounding rate of return, we achieve strict covariance stationarity. This transformation guarantees that the neural network and econometric models are ingesting the relative scale of price movements rather than absolute dollar changes, effectively stabilizing the variance targets across the entire intraday time series."
  },
  returns_sq: { 
      title: "Squared Returns", 
      math: "R_t²", 
      detailedDesc: "When isolating the directionless magnitude of asset movement, squared returns serve as the absolute foundational proxy for realized variance. In quantitative forecasting, mapping out the pure square of the return vector allows the system to focus entirely on the scale of the shock rather than whether it was a bullish or bearish event. This raw, unadjusted variance acts as an anchoring feature for establishing heavy-tailed anomalies before advanced model smoothing is applied."
  },
  garch_vol: { 
      title: "GARCH Baseline", 
      math: "σ_t² = ω + α ε_{t-1}² + β σ_{t-1}²", 
      detailedDesc: "The GARCH (Generalized AutoRegressive Conditional Heteroskedasticity) variance baseline forms the explicit econometric anchor of our hybrid system. Instead of deploying pure black-box deep learning, the pipeline solves Maximum Likelihood Estimation equations to calculate standard market memory and volatility clustering dynamics. This maps out classical mathematical market regimes, providing the PyTorch network with a highly structured, statistically rigorous foundation to correct."
  },
  garch_resid: { 
      title: "GARCH Residuals", 
      math: "ε_t = R_t / σ_t", 
      detailedDesc: "Residuals mathematically represent the explicit failure points of the classical GARCH model—the exact moments where standard Wall Street mathematics failed to predict a market shock. By passing these standardized, mathematically unpredictable errors directly into the deep residual network, the AI is explicitly trained to target and learn the non-linear, chaotic patterns that standard formulas strictly miss, such as algorithmic spoofing or rapid liquidation chains."
  },
  realized_vol: { 
      title: "Realized Volatility", 
      math: "√(Σ R_i²)", 
      detailedDesc: "Realized Volatility serves as the ultimate deterministic ground truth for the engine's predictive accuracy vectors. It tracks the rolling intraday standard deviation across high-frequency 5-minute ticks, capturing the definitive historical movement of the asset over a specific microstructure window. It explicitly acts as the empirical continuous 'target' array during Walk-Forward Backtesting, providing the neural network with a concrete metric to minimize its loss function against."
  },
  hl_spread: { 
      title: "High-Low Spread", 
      math: "(High_t - Low_t) / Close_t", 
      detailedDesc: "The High-Low Spread is deployed as a secondary quantitative feature designed to proxy invisible Limit Order Book (LOB) dynamics and intraday trading density. When the gap between an asset's high and low diverges severely from its closing vector, it strongly signals chaotic intraday trading battles or collapsing liquidity cascades. Introducing this structural dynamic allows the network to distinguish between low-volume drift and highly volatile price discovery events."
  },
  log_volume: { 
      title: "Log Volume", 
      math: "ln(V_t)", 
      detailedDesc: "Raw share volume sequences vary wildly across market regimes, ranging from baseline retail trading days to catastrophic volume explosions. To strictly prevent these massive outliers from triggering fatal gradient explosions inside the deep learning optimizer, the raw trading volume is logarithmically scaled. This mathematical transformation successfully preserves the relational flow density of institutional block trades while keeping the representation constrained within stable tensor bounds."
  },
  vix_close: { 
      title: "VIX Close", 
      math: "VIX_t", 
      detailedDesc: "As the quintessential 'Fear Index' defining S&P 500 implied volatility, the VIX spot rate integrates overarching macroeconomic regimes directly into the localized single-asset forecast. During periods of catastrophic structural market collapse, cross-asset correlations aggressively spike toward 1.0. By continuously tracking the absolute level of the VIX, the deep learning network scales its sensitivity weights in real-time, modifying baseline predictions based on global fear paradigms."
  },
  vix_ret: { 
      title: "VIX Log Returns", 
      math: "ln(VIX_t / VIX_{t-1})", 
      detailedDesc: "While the VIX spot rate defines the current overriding macro regime, the logarithmic returns of the VIX explicitly capture the instantaneous derivative momentum of that fear. A sharp upward velocity in this vector is mathematically indicative of sudden, high-stress institutional hedging or forced liquidations across the broader equities market. This acts as a predictive early-warning signal, forcing the simulation engine to aggressively widen expected risk bands."
  },
  sentiment: { 
      title: "FinBERT NLP Emotion", 
      math: "S_t ∈ [-1.0, 1.0]", 
      detailedDesc: "Market movement is driven significantly by asymmetric human emotion and reactive algorithmic news trading logic. Utilizing the HuggingFace FinBERT language model, real-time Natural Language Processing is continuously executed against live global financial news streams. These textual headlines are transformed on-the-fly into deterministic probability matrices, explicitly feeding non-quantitative contextual emotion and narrative momentum directly into the quantitative pipeline."
  },
};

export default function DataExtraction() {
  const { data } = useEngine();
  const [activeFeature, setActiveFeature] = useState(null);

  if (!data) return null;

  return (
    <div className="w-full flex flex-col gap-6">
        <SpotlightCard className="p-8 border border-zinc-900 bg-black/50 backdrop-blur-sm" spotlightColor="rgba(255, 255, 255, 0.03)">
            <span className="text-zinc-500 uppercase tracking-widest text-[10px] block mb-4 border-b border-zinc-800 pb-2">O(N) Engineered Matrices</span>
            
            <div className="flex flex-wrap gap-3 mb-8 relative">
                {data.input_features.map((feat, idx) => (
                    <button 
                        key={idx} 
                        className={`text-[10px] font-mono px-3 py-1.5 rounded-sm border transition-all duration-200 block ${
                            activeFeature === feat 
                                ? 'bg-zinc-800 border-zinc-500 text-white shadow-[0_0_10px_rgba(255,255,255,0.05)]' 
                                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                        }`}
                        onMouseEnter={() => setActiveFeature(feat)}
                        onClick={() => setActiveFeature(feat)}
                    >
                        {feat}
                    </button>
                ))}
            </div>

            {/* Dedicated Info Panel */}
            <div className="min-h-[140px] flex items-center justify-center border border-zinc-800/50 bg-black/40 rounded-lg p-6">
                {activeFeature && FEATURE_EXPLANATIONS[activeFeature] ? (
                    <div className="w-full flex flex-col xl:flex-row items-center gap-8 justify-between">
                        <div className="flex flex-col gap-4 max-w-2xl">
                            <span className="text-white text-sm font-bold uppercase tracking-widest border-b border-zinc-800 pb-2 inline-block w-fit">{FEATURE_EXPLANATIONS[activeFeature].title}</span>
                            <p className="text-zinc-400 text-xs leading-relaxed text-justify tracking-wide selection:bg-emerald-900/30">
                                {FEATURE_EXPLANATIONS[activeFeature].detailedDesc}
                            </p>
                        </div>
                        <div className="shrink-0 bg-emerald-950/10 px-5 py-4 rounded border border-emerald-900/20 shadow-[0_0_15px_rgba(16,185,129,0.02)] xl:self-start">
                            <span className="text-emerald-500 font-mono text-sm tracking-widest">{FEATURE_EXPLANATIONS[activeFeature].math}</span>
                        </div>
                    </div>
                ) : (
                    <span className="text-zinc-600 text-xs uppercase tracking-widest italic flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-zinc-800 animate-pulse"></span>
                        Select or hover over an engineered matrix to inspect its mathematical architecture
                    </span>
                )}
            </div>

        </SpotlightCard>
    </div>
  );
}
