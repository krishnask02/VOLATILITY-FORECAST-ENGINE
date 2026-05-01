import { useEngine } from '../../context/EngineContext';
import SpotlightCard from '../../components/shared/SpotlightCard/SpotlightCard';

export default function DeepLearning() {
  const { data } = useEngine();
  if (!data) return null;

  return (
    <div className="w-full">
        <SpotlightCard className="p-8 border border-zinc-900 bg-black/50 backdrop-blur-sm" spotlightColor="rgba(255, 255, 255, 0.03)">
            <span className="text-zinc-500 uppercase tracking-widest text-[10px] block mb-6 border-b border-zinc-800 pb-2">LSTM Walk-Forward Validation (MSE Convergence)</span>
            <div className="flex flex-col gap-6 font-mono text-[10px] text-zinc-500 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
            {data.training_history.map((batch, idx) => {
                const firstLoss = batch.losses[0];
                const lastLoss = batch.losses[batch.losses.length - 1];
                const improvement = (((firstLoss - lastLoss) / firstLoss) * 100).toFixed(1);
                return (
                <div key={idx} className="flex flex-col gap-1 w-full bg-[#0a0a0a] border border-zinc-900 p-4 rounded-sm">
                    <div className="flex justify-between text-zinc-400 mb-2">
                        <span className="text-white text-xs">{batch.step}</span>
                        <span className="text-emerald-500/70 border border-emerald-900/50 bg-emerald-950/30 px-2 py-0.5 rounded-sm">-{improvement}% Loss</span>
                    </div>
                    <div className="flex w-full justify-between gap-1 items-end h-16">
                    {batch.losses.map((loss, lIdx) => {
                        const heightPct = Math.max((loss / firstLoss) * 100, 5);
                        return (
                        <div key={lIdx} className="w-full bg-zinc-800 hover:bg-zinc-500 transition-colors relative group" style={{ height: `${heightPct}%` }}>
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] bg-black text-white px-2 py-1 rounded-sm z-10 pointer-events-none">
                            {loss.toFixed(6)}
                            </div>
                        </div>
                        );
                    })}
                    </div>
                </div>
                );
            })}
            </div>
        </SpotlightCard>
    </div>
  );
}
