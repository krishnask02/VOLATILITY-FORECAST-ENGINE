import { Outlet, NavLink } from 'react-router-dom';

export default function PipelineLayout() {
  const tabs = [
    { to: "/pipeline/data", label: "Data & Sentiment" },
    { to: "/pipeline/model", label: "Classical Models" },
    { to: "/pipeline/dl", label: "Deep Learning (LSTM)" },
  ];

  return (
    <div className="w-full flex flex-col gap-8">
      
      {/* Internal Tab Navigation */}
      <div className="w-full border-b border-zinc-800 pb-2">
         <h2 className="text-2xl font-light text-white mb-6">Pipeline Inspection</h2>
         <div className="flex gap-8">
           {tabs.map(tab => (
             <NavLink 
                key={tab.to} 
                to={tab.to}
                className={({ isActive }) => 
                  `uppercase text-[10px] tracking-widest font-bold transition-all duration-300 pb-2 border-b-2 ${
                    isActive ? 'text-zinc-100 border-zinc-400' : 'text-zinc-700 border-transparent hover:text-zinc-500'
                  }`
                }
             >
                {tab.label}
             </NavLink>
           ))}
         </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
         <Outlet />
      </div>
      
    </div>
  );
}
