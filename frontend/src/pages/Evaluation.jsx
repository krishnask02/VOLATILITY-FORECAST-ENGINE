import { useEngine } from '../context/EngineContext';
import SpotlightCard from '../components/shared/SpotlightCard/SpotlightCard';
import { TrendingDown, TrendingUp, Cpu, LineChart } from 'lucide-react';

export default function Evaluation() {
  const { data } = useEngine();
  if (!data) return null;

  // Calculate PyTorch walk-forward optimization edge
  const initialLoss = data.training_history[0].losses[0];
  const finalBlock = data.training_history[data.training_history.length - 1];
  const finalLoss = finalBlock.losses[finalBlock.losses.length - 1];
  const totalImprovement = (((initialLoss - finalLoss) / initialLoss) * 100).toFixed(2);

  // Black-Scholes Delta (Alpha)
  const alphaDelta = (data.calculated_iv - data.hybrid_vol_annualized).toFixed(2);

  return (
    <div className="w-full flex flex-col gap-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="w-full border-b border-zinc-800 pb-2">
         <h2 className="text-2xl font-light text-white mb-2">Performance & Model Alpha</h2>
         <p className="text-zinc-500 text-xs tracking-widest uppercase mb-4">Methodology justification and competitive quantitative edge.</p>
      </div>

      {/* PILLAR 1: The Baseline Flaw */}
      <div className="w-full flex flex-col gap-4">
          <h3 className="text-zinc-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 drop-shadow-md">
            <LineChart size={14} className="text-blue-500" /> Layer 01: The Baseline Flaw
          </h3>
          <SpotlightCard className="p-8 border border-zinc-900 bg-black/50 backdrop-blur-sm" spotlightColor="rgba(59, 130, 246, 0.05)">
              <div className="flex flex-col lg:flex-row gap-8 items-center">
                  <div className="flex-1 text-sm font-mono text-zinc-400 space-y-4 leading-relaxed">
                      <p>
                          Standard option pricing strictly relies on the **Black-Scholes Implied Volatility** (derived here as <span className="text-white bg-zinc-900 px-1 py-0.5">{data.calculated_iv.toFixed(2)}%</span>). 
                      </p>
                      <p>
                          However, market makers systematically overprice out-of-the-money derivatives (the <i>Volatility Smile</i>) as a structural safety premium. By mathematically stripping away these market-maker premiums, our Hybrid Forecast isolates the "True" localized geometric risk to <span className="text-white bg-zinc-900 px-1 py-0.5">{data.hybrid_vol_annualized.toFixed(2)}%</span>.
                      </p>
                  </div>
                  <div className="w-full lg:w-1/3 flex flex-col items-center justify-center p-6 bg-[#050505] border border-zinc-800 rounded-sm">
                      <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Captured Alpha Delta</span>
                      <span className={`text-4xl font-light ${parseFloat(alphaDelta) > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                          {parseFloat(alphaDelta) > 0 ? '+' : ''}{alphaDelta}%
                      </span>
                  </div>
              </div>
          </SpotlightCard>
      </div>

      {/* PILLAR 2: Microstructure Integration */}
      <div className="w-full flex flex-col gap-4">
          <h3 className="text-zinc-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 drop-shadow-md">
            <TrendingDown size={14} className="text-orange-500" /> Layer 02: Market Microstructure
          </h3>
          <SpotlightCard className="p-8 border border-zinc-900 bg-black/50 backdrop-blur-sm" spotlightColor="rgba(249, 115, 22, 0.05)">
              <div className="flex flex-col lg:flex-row gap-8">
                   <div className="flex-1 text-sm font-mono text-zinc-400 space-y-4 leading-relaxed">
                      <p>
                          Traditional models (Daily GARCH) rely entirely on End-of-Day close prices. They are fundamentally blind to intraday liquidity cascades. 
                      </p>
                      <p>
                          Our system engineers a dense `<span className="text-orange-400/80">O(N) Matrix</span>` extracting 5-Minute `High-Low Spreads` and structural `Log Volumes`. This explicitly maps order-book exhaustion and short-term mean-reversion potentials that institutional algos hunt for.
                      </p>
                  </div>
                  <div className="w-full lg:w-1/3 grid grid-cols-2 gap-4">
                      {["log_volume", "hl_spread", "vol_ratio", "vix_ret"].map(feat => (
                           <div key={feat} className="bg-zinc-900/50 border border-zinc-800 rounded px-3 py-4 text-center">
                               <span className="text-[10px] font-mono text-zinc-300">{feat}</span>
                           </div>
                      ))}
                  </div>
              </div>
          </SpotlightCard>
      </div>

      {/* PILLAR 3: Non-Linear Correction */}
      <div className="w-full flex flex-col gap-4 mb-12">
          <h3 className="text-zinc-300 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 drop-shadow-md">
            <Cpu size={14} className="text-emerald-500" /> Layer 03: Non-Linear Neural Core
          </h3>
          <SpotlightCard className="p-8 border border-emerald-900/40 bg-black/60 shadow-[0_0_30px_rgba(16,185,129,0.03)] backdrop-blur-md" spotlightColor="rgba(16, 185, 129, 0.1)">
               <div className="flex flex-col lg:flex-row gap-8 items-center">
                  <div className="flex-1 text-sm font-mono text-zinc-400 space-y-4 leading-relaxed">
                      <p>
                          The fatal flaw of classical econometrics is assuming volatility shocks are symmetric and identically distributed. Our architecture utilizes a localized, recurrent **LSTM Network** strictly to map the non-linear residuals that classical arrays leave mathematically unresolved.
                      </p>
                  </div>
                  <div className="w-full lg:w-1/3 flex flex-col items-center justify-center p-6 bg-emerald-950/20 border border-emerald-900/50 rounded-sm">
                      <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-2">Out-of-Sample Optimization</span>
                      <div className="flex items-end gap-2">
                          <TrendingDown className="text-emerald-500 pb-1" size={24} />
                          <span className="text-4xl font-light text-emerald-400 tabular-nums">
                              -{totalImprovement}%
                          </span>
                      </div>
                      <span className="text-[9px] text-zinc-500 uppercase tracking-widest mt-2">MSE Loss Reduction</span>
                  </div>
              </div>
          </SpotlightCard>
      </div>

    </div>
  );
}
