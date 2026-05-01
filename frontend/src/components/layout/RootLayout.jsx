import Navigation from './Navigation';
import DotGrid from '../shared/DotGrid/DotGrid';
import Loader from '../shared/Loader';
import { useEngine } from '../../context/EngineContext';
import { Outlet } from 'react-router-dom';

export default function RootLayout() {
  const { data } = useEngine();

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-zinc-100 overflow-x-hidden font-sans">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <DotGrid baseColor="#18181b" activeColor="#ffffff" dotSize={2} gap={24} />
      </div>
      
      {/* If data exists, show the full app. Otherwise show the Loader. */}
      {data ? (
          <div className="relative z-10 w-full flex flex-col min-h-screen">
             <Navigation />
             <main className="flex-1 w-full max-w-7xl mx-auto p-6 animate-in fade-in duration-700">
                <Outlet />
             </main>
          </div>
      ) : (
          <div className="relative z-10 flex min-h-screen items-center py-20">
             <Loader />
          </div>
      )}
    </div>
  );
}
