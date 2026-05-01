import { useEngine } from '../context/EngineContext';
import SpotlightCard from '../components/shared/SpotlightCard/SpotlightCard';
import { TrendingUp, BarChart2, Database, Zap } from 'lucide-react';

export default function Dashboard() {
  const { data } = useEngine();

  if (!data) return null;

  // Derive historical dataset accuracy
  const initialLoss = data.training_history[0].losses[0];
  const finalBlock = data.training_history[data.training_history.length - 1];
  const finalLoss = finalBlock.losses[finalBlock.losses.length - 1];
  const totalImprovement = (((initialLoss - finalLoss) / initialLoss) * 100).toFixed(2);

  return (
    <div className="w-full flex flex-col gap-6">
      <h2 className="text-2xl font-light text-white mb-2">Dual-Phase Engine Output</h2>
      <p className="text-zinc-500 text-xs tracking-widest uppercase mb-8">Phase 1: Dataset Training vs Phase 2: Live API Inference</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PHASE 1: DATASET TRAINING */}
        <SpotlightCard className="p-8 border border-zinc-900 bg-black/50 backdrop-blur-sm" spotlightColor="rgba(161, 161, 170, 0.05)">
          <div className="flex flex-col gap-2">
            <div className="flex w-full items-center justify-between mb-4">
              <span className="text-zinc-400 uppercase tracking-widest text-[10px] font-bold mt-1 flex items-center gap-2">
                  <Database size={14} className="text-zinc-500" /> Historic Dataset Accuracy
              </span>
            </div>
            <h2 className="text-5xl font-light tabular-nums text-zinc-300">
              -{totalImprovement}%
            </h2>
            <p className="text-zinc-600 text-[10px] mt-4 uppercase tracking-widest">
              MSE Learning Convergence (Training Complete)
            </p>
          </div>
        </SpotlightCard>

        {/* PHASE 2: LIVE INFERENCE */}
        <SpotlightCard className="p-8 border border-zinc-900 bg-black/50 backdrop-blur-sm shadow-[0_0_20px_rgba(255,255,255,0.03)]" spotlightColor="rgba(255, 255, 255, 0.1)">
          <div className="flex flex-col gap-2">
            <div className="flex w-full items-center justify-between mb-4">
              <span className="text-white uppercase tracking-widest text-[10px] font-bold mt-1 flex items-center gap-2">
                  <Zap size={14} className="text-white" /> Live API Inference
              </span>
            </div>
            <h2 className="text-5xl font-normal tabular-nums text-white">
              {data.hybrid_vol_annualized.toFixed(2)}%
            </h2>
            <div className="text-zinc-400 text-xs mt-4 tracking-wide flex items-center gap-2">
              <span className={`px-2 py-1 uppercase text-[10px] font-bold ${data.decision.includes('UNDER-PRICED') ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-500'}`}>
                {data.decision.split('.')[2].trim()}
              </span>
              <span className="uppercase text-[9px] text-zinc-600 tracking-widest">( Forward Extrapolation )</span>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  );
}
