import React, { Component } from 'react';
import { useEngine } from '../context/EngineContext';
import SpotlightCard from '../components/shared/SpotlightCard/SpotlightCard';
import PlotlyComponent from 'react-plotly.js';

const Plot = PlotlyComponent.default || PlotlyComponent;

class PlotErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.toString() };
  }
  componentDidCatch(error, errorInfo) {
    console.error("Plotly WebGL Error: ", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <div className="text-red-500 font-mono text-xs p-4 bg-red-950/20 border border-red-900">WebGL Plot Error: {this.state.message}</div>;
    }
    return this.props.children;
  }
}

const calculateMedianPath = (paths) => {
    if (!paths || paths.length === 0) return [];
    const length = paths[0].length;
    const medianPath = [];
    for (let i = 0; i < length; i++) {
        const slice = paths.map(p => p[i]).sort((a,b) => a - b);
        medianPath.push(slice[Math.floor(slice.length / 2)]);
    }
    return medianPath;
};

export const MonteCarloViewer = ({ simulationData }) => {
  if (!simulationData || simulationData.length === 0) {
    return <div className="text-zinc-500 font-mono">Awaiting Stochastic Matrix...</div>;
  }

  // Inject the mathematical Sine wave perturbations to create the "liquid" surface 
  const liquidZ = simulationData.map((path, y) => 
      path.map((val, x) => val + (0.5 * Math.sin(0.2 * x + 0.3 * y)))
  );

  // Safely define X and Y arrays for Plotly WebGL strict bounds
  const xVals = Array.from({ length: liquidZ[0].length }, (_, i) => i);
  const yVals = Array.from({ length: liquidZ.length }, (_, i) => i);

  // Transmute the array into a singular 3D WebGL topographical trace
  const surfaceTrace = {
    x: xVals,
    y: yVals,
    z: liquidZ,
    type: 'surface',
    colorscale: 'Magma',
    opacity: 0.85,
    showscale: false,
    hoverinfo: 'none'
  };

  return (
    <div className="border border-zinc-800 bg-black/50 backdrop-blur-sm p-4 rounded w-full">
      <h3 className="text-zinc-500 text-[10px] font-bold mb-2 uppercase tracking-widest border-b border-zinc-800 pb-2">Stochastic Drift (3D Market Wave)</h3>
      <div className="w-full h-[500px]">
        <PlotErrorBoundary>
            <Plot
                data={[surfaceTrace]}
                layout={{
                    paper_bgcolor: 'rgba(0,0,0,0)',
                    plot_bgcolor: 'rgba(0,0,0,0)',
                    margin: { t: 0, b: 0, l: 0, r: 0 },
                    autosize: true
                }}
                useResizeHandler={true}
                config={{ displayModeBar: false, responsive: true }}
                style={{ width: '100%', height: '100%' }}
            />
        </PlotErrorBoundary>
      </div>
    </div>
  );
};

export default function Simulations() {
  const { data } = useEngine();
  if (!data) return null;

  return (
    <div className="w-full flex flex-col gap-6">
      <h2 className="text-2xl font-light text-white mb-2">Stochastic Simulations</h2>
      <p className="text-zinc-500 text-xs tracking-widest uppercase mb-8">Monte Carlo Geometric Brownian Motion Engine (21-Day Horizon)</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SpotlightCard className="p-8 border border-zinc-900 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-center" spotlightColor="rgba(255, 255, 255, 0.03)">
            <span className="text-zinc-600 uppercase tracking-widest text-[10px] mb-4">Worst Expected (5th)</span>
            <span className="text-3xl font-light text-zinc-300">${data.monte_carlo.worst_expected.toFixed(2)}</span>
        </SpotlightCard>
        
        <SpotlightCard className="p-8 border border-zinc-900 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-center ring-1 ring-zinc-700 shadow-[0_0_30px_rgba(255,255,255,0.05)]" spotlightColor="rgba(255, 255, 255, 0.1)">
            <span className="text-zinc-400 uppercase tracking-widest text-[10px] mb-4">Median Expected</span>
            <span className="text-4xl font-normal text-white">${data.monte_carlo.median_expected.toFixed(2)}</span>
        </SpotlightCard>
        
        <SpotlightCard className="p-8 border border-zinc-900 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-center" spotlightColor="rgba(255, 255, 255, 0.03)">
            <span className="text-zinc-600 uppercase tracking-widest text-[10px] mb-4">Best Expected (95th)</span>
            <span className="text-3xl font-light text-zinc-300">${data.monte_carlo.best_expected.toFixed(2)}</span>
        </SpotlightCard>
      </div>

      <div className="w-full mt-6">
        <MonteCarloViewer simulationData={data.monte_carlo.paths} />
      </div>

    </div>
  );
}
