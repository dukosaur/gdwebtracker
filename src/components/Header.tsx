import React from 'react';
import { LayoutGrid, BarChart3 } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#12131a]/95 backdrop-blur-md border-b border-[#262838] px-4 lg:px-8 py-3.5 shadow-xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3.5">
          <div className="relative group cursor-pointer">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-pink-500 to-indigo-600 p-1 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <img
                src="/faces/demon-extreme.png"
                alt="Geometry Dash Demon"
                className="w-8 h-8 object-contain drop-shadow group-hover:rotate-6 transition-transform"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#12131a] rounded-full"></div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white font-['Outfit'] flex items-center gap-1.5">
                GEOMETRY DASH <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-indigo-400">TRACKER</span>
              </h1>
            </div>
          </div>
        </div>

        {/* Center / Right controls: View Switcher */}
        <div className="flex items-center gap-2.5">
          
          {/* View Mode Toggle (Showcase & Stats) */}
          <div className="flex items-center bg-[#1a1b26] p-1 rounded-xl border border-[#2b2d42] shadow-inner">
            <button
              id="view-mode-showcase"
              onClick={() => setViewMode('showcase')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'showcase'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#252738]'
              }`}
              title="Geometry Dash Card Showcase"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Showcase</span>
            </button>

            <button
              id="view-mode-stats"
              onClick={() => setViewMode('stats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'stats'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#252738]'
              }`}
              title="Ashrit vs Arsh head-to-head comparison"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Stats</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
