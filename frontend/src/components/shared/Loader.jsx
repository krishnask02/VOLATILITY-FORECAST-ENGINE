import React, { useEffect, useRef } from 'react';
import { useEngine } from '../../context/EngineContext';
import SpotlightCard from './SpotlightCard/SpotlightCard';
import BlurText from './BlurText/BlurText';
import { Activity, Zap, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Loader({ onComplete }) {
  const { data, loading, logs, hasStarted, fetchData } = useEngine();
  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // If we already have data, we just return null because the wrapper will redirect/render children
  if (data) {
    if (onComplete) onComplete();
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] w-full max-w-2xl mx-auto px-6">
      
      {!hasStarted && (
        <div className="text-center w-full animate-in fade-in duration-1000">
            <BlurText 
                text="VOLATILITY ENGINE" 
                className="text-6xl md:text-7xl font-black tracking-[0.2em] text-white mb-4"
                delay={50}
            />
            <p className="text-zinc-500 uppercase tracking-[0.3em] text-xs font-semibold mb-16">
                High-Frequency Regime-Switching Neural Forecast
            </p>
            <button 
                onClick={fetchData}
                disabled={loading}
                className="mx-auto px-8 py-4 bg-transparent text-white font-bold uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-black transition-all duration-300 cursor-pointer flex items-center gap-3 border border-zinc-800 hover:border-white"
            >
                <Zap size={16} />
                Initialize Pipeline
            </button>
        </div>
      )}

      {hasStarted && (
        <div className="w-full animate-in fade-in slide-in-from-bottom-5 duration-700">
             <SpotlightCard className="p-6 border border-zinc-900 bg-black/80 backdrop-blur-md" spotlightColor="rgba(255, 255, 255, 0.05)">
                <h3 className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold mb-4 flex items-center gap-2 border-b border-zinc-800 pb-2">
                    {loading ? <Activity className="animate-spin text-white" size={12}/> : <CheckCircle2 className="text-emerald-500" size={12}/>}
                    {loading ? 'Pipeline Execution in Progress...' : 'Pipeline Finalized'}
                </h3>
                <div className="flex flex-col gap-3 font-mono text-[10px] text-zinc-400 min-h-[100px] max-h-[300px] overflow-y-auto">
                    {logs.map((log, idx) => {
                        const isDataset = log.message.includes('[PHASE 1: DATASET]');
                        const isRealtime = log.message.includes('[PHASE 2: REAL-TIME]');
                        const logColor = log.error ? 'text-red-500' : 
                                         log.success ? 'text-emerald-500 font-bold' : 
                                         isDataset ? 'text-zinc-500' : 
                                         isRealtime ? 'text-white font-bold' : 
                                         'text-zinc-300';
                        
                        return (
                            <div key={idx} className={`flex items-start gap-2 ${logColor} animate-in fade-in slide-in-from-left-2 duration-300`}>
                                <ChevronRight size={14} className="mt-[2px] shrink-0" />
                                <span>{log.message}</span>
                            </div>
                        );
                    })}
                    <div ref={logsEndRef} />
                </div>
            </SpotlightCard>
        </div>
      )}

    </div>
  );
}
