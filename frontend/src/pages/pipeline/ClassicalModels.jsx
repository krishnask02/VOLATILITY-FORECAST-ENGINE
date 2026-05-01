import { useState } from 'react';
import { useEngine } from '../../context/EngineContext';
import SpotlightCard from '../../components/shared/SpotlightCard/SpotlightCard';

const PARAMETER_EXPL = {
  'omega': { label: 'Weight (ω)', text: "Weight (Omega) represents the structural long-term baseline variance of the asset. It acts as the mathematical anchor, ensuring that when the market calms down, volatility eventually mean-reverts back to this stable long-term equilibrium rate rather than dropping to zero." },
  'alpha': { label: 'Shock (α)', text: "Shock (Alpha) quantifies the asset's immediate, short-term sensitivity to intraday surprises. Mathematically, it dictates how aggressively yesterday's unexpected price drop or surge (the squared residual) instantly spikes today's forecasted volatility." },
  'beta': { label: 'Persistence (β)', text: "Persistence (Beta) defines the 'memory' of the market's volatility. A high persistence (near 1.0) means that once the market enters a chaotic regime, it will stay highly volatile for an extended period, slowly decaying back to the baseline over many days." }
};

const MetricCard = ({ label, value, isActive, onClick }) => (
  <div 
     onClick={onClick}
     className={`flex flex-col items-center justify-center h-full bg-[#050505] p-4 rounded text-center cursor-pointer transition-all duration-200 ${
        isActive 
          ? 'border border-zinc-500 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)] ring-1 ring-zinc-700' 
          : 'border border-zinc-900 shadow-[inset_0_0_10px_rgba(0,0,0,1)] hover:border-zinc-700'
     }`}>
    <div className={`text-[9px] mb-2 font-bold tracking-widest uppercase ${isActive ? 'text-zinc-300' : 'text-zinc-500'}`}>{label}</div>
    <div className={`text-2xl font-mono tabular-nums tracking-wider ${isActive ? 'text-white' : 'text-zinc-400'}`}>{value?.toFixed(4) || '---'}</div>
  </div>
);

export const GARCHInspector = ({ garchParams, duration, activeParam, setActiveParam }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm rounded-sm">
       {/* Math Panel */}
       <div className="w-full lg:w-1/3 flex flex-col justify-center">
          <h4 className="text-zinc-500 tracking-widest font-bold text-[10px] mb-4 uppercase">GARCH(1,1) Structural Base</h4>
          <div className="font-serif text-3xl text-white italic tracking-wide">
            σ²ₜ = ω + αε²ₜ₋₁ + βσ²ₜ₋₁
          </div>
          <div className="mt-6 text-xs text-zinc-500 border-l px-4 border-zinc-700">
             Current parameters dynamically extracted from a {duration}-day rolling window, tracking the persistence ($β$) and immediate shock responses ($α$). 
          </div>
       </div>

       {/* Data Panel */}
       <div className="w-full lg:w-2/3 grid grid-cols-3 gap-4">
          <MetricCard 
              label="Weight (ω)" 
              value={garchParams?.omega} 
              isActive={activeParam === 'omega'} 
              onClick={() => setActiveParam(activeParam === 'omega' ? null : 'omega')} 
          />
          <MetricCard 
              label="Shock (α)" 
              value={garchParams?.alpha} 
              isActive={activeParam === 'alpha'} 
              onClick={() => setActiveParam(activeParam === 'alpha' ? null : 'alpha')} 
          />
          <MetricCard 
              label="Persistence (β)" 
              value={garchParams?.beta} 
              isActive={activeParam === 'beta'} 
              onClick={() => setActiveParam(activeParam === 'beta' ? null : 'beta')} 
          />
       </div>
    </div>
  );
};

export default function ClassicalModels() {
  const { data } = useEngine();
  const [activeParam, setActiveParam] = useState(null);

  if (!data) return null;

  return (
    <div className="w-full flex flex-col gap-6 pb-20">
        
        <GARCHInspector 
             garchParams={data.garch_params} 
             duration={data.garch_params.duration} 
             activeParam={activeParam}
             setActiveParam={setActiveParam}
        />

        {activeParam && PARAMETER_EXPL[activeParam] && (
            <div className="w-full p-6 border-l-4 border-emerald-900/70 bg-emerald-950/10 rounded-r shadow-inner transition-all duration-300 animate-in fade-in slide-in-from-top-4">
                <span className="text-emerald-500/80 uppercase tracking-widest text-[10px] font-bold block mb-2">{PARAMETER_EXPL[activeParam].label} Explanation</span>
                <p className="text-zinc-300 text-sm leading-relaxed tracking-wide">
                    {PARAMETER_EXPL[activeParam].text}
                </p>
            </div>
        )}

        <SpotlightCard className="p-8 border border-zinc-900 bg-black/50 backdrop-blur-sm mt-4" spotlightColor="rgba(255, 255, 255, 0.03)">
            <span className="text-zinc-500 uppercase tracking-widest text-[10px] block mb-4 border-b border-zinc-800 pb-2">Adaptive Model Extraction</span>
            <p className="text-zinc-400 text-sm font-mono mb-6">
               The pipeline evaluates classical GARCH, EGARCH, and GJR-GARCH models dynamically. It extracts their residuals and conditional volatilties based on the rolling minimum MSE across structural variants.
               This prevents the neural network from "re-learning" established heteroskedasticity.
            </p>
            <div className="p-5 bg-zinc-900/30 border border-zinc-800 rounded-sm w-fit shadow-inner">
                <span className="text-zinc-600 uppercase tracking-widest text-[10px] font-bold block mb-4">Engineered Classical Features Fed to PyTorch</span>
                <div className="flex gap-4">
                    
                    {/* Volatility Hover Group */}
                    <div className="relative group cursor-help">
                        <span className="text-emerald-500/80 text-sm font-mono bg-emerald-950/20 border border-emerald-900/50 px-3 py-1.5 rounded transition-all group-hover:bg-emerald-900/40 block">
                            garch_volatility
                        </span>
                        
                        <div className="absolute bottom-full left-0 mb-3 w-[400px] p-5 bg-[#080808] border border-emerald-900/30 rounded shadow-[0_15px_40px_-5px_rgba(16,185,129,0.15)] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 transform origin-bottom-left -translate-y-2 group-hover:translate-y-0">
                            <span className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest block mb-2 border-b border-emerald-900/30 pb-2">Deterministic Baseline Tracker</span>
                            <p className="text-zinc-400 text-xs leading-relaxed text-left">
                                The extracted conditional volatility sequence acts as the deterministic baseline fed into the PyTorch network. By pre-calculating the standard econometric heteroskedasticity, we fundamentally prevent the deep learning model from wasting generic computational cycles 're-learning' established classical market dynamics. The network is thus anchored contextually from epoch zero.
                            </p>
                        </div>
                    </div>

                    {/* Residuals Hover Group */}
                    <div className="relative group cursor-help">
                        <span className="text-indigo-400/80 text-sm font-mono bg-indigo-950/20 border border-indigo-900/50 px-3 py-1.5 rounded transition-all group-hover:bg-indigo-900/40 block">
                            garch_residuals
                        </span>
                        
                        <div className="absolute bottom-full left-0 mb-3 w-[400px] p-5 bg-[#080808] border border-indigo-900/30 rounded shadow-[0_15px_40px_-5px_rgba(99,102,241,0.15)] opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 z-50 transform origin-bottom-left -translate-y-2 group-hover:translate-y-0">
                            <span className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest block mb-2 border-b border-indigo-900/30 pb-2">Non-Linear Chaos Target</span>
                            <p className="text-zinc-400 text-xs leading-relaxed text-left">
                                These residuals represent the exact standardized mathematical errors where the classical GARCH model failed to accurately predict variance. They encapsulate the chaotic, non-linear market shocks, such as institutional spoofing or algorithmic liquidations. Feeding these directly to the AI forces PyTorch to act exclusively as a residual error-correction layer, massively maximizing pure predictive alpha.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </SpotlightCard>
    </div>
  );
}
