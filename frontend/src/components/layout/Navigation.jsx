import { NavLink } from 'react-router-dom';
import { Activity, Network, Target, LayoutDashboard } from 'lucide-react';

export default function Navigation() {
  const navItems = [
    { to: "/", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
    { to: "/pipeline/data", icon: <Activity size={16} />, label: "Pipeline Inspector" },
    { to: "/simulations", icon: <Target size={16} />, label: "Monte Carlo" },
    { to: "/architecture", icon: <Network size={16} />, label: "Architecture" },
    { to: "/evaluation", icon: <Network size={16} className="rotate-90"/>, label: "Methodology & Edge" },
  ];

  return (
    <nav className="w-full border-b border-zinc-900 bg-black/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white font-bold tracking-[0.2em] uppercase text-xs">
           <Activity size={18} className="text-zinc-500"/>
           Volatility Engine
        </div>
        
        <div className="hidden md:flex gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center gap-2 text-[10px] tracking-widest uppercase font-semibold transition-colors duration-200 ${
                  isActive ? 'text-white border-b-2 border-white/50 py-2' : 'text-zinc-500 hover:text-zinc-300 py-2'
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}
