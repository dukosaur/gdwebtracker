import React from 'react';
import { TabId } from '../types';
import { User, Users, Flame } from 'lucide-react';

interface TabNavigationProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  ashritCount: number;
  arshCount: number;
  sharedCount: number;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  setActiveTab,
  ashritCount,
  arshCount,
  sharedCount,
}) => {
  return (
    <div className="w-full bg-[#161722] border-b border-[#25283a] px-4 lg:px-8 pt-3">
      <div className="max-w-7xl mx-auto flex items-end gap-2 overflow-x-auto no-scrollbar">
        
        {/* Tab 1: Ashrit */}
        <button
          id="tab-ashrit"
          onClick={() => setActiveTab('ashrit')}
          className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-t-xl font-medium text-sm transition-all duration-200 border-t-2 select-none ${
            activeTab === 'ashrit'
              ? 'bg-[#252b48] text-white border-indigo-400 shadow-[0_-4px_16px_rgba(79,70,229,0.15)] font-semibold'
              : 'bg-[#181926] text-gray-400 border-transparent hover:bg-[#1e2030] hover:text-gray-200'
          }`}
        >
          <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="font-['Outfit'] tracking-wide">ashriiiiiiiiiiiiiit</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'ashrit' ? 'bg-indigo-400/20 text-indigo-200 font-bold' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {ashritCount}
          </span>
          {activeTab === 'ashrit' && (
            <span className="w-2 h-2 rounded-full bg-indigo-400 absolute right-2 top-2"></span>
          )}
        </button>

        {/* Tab 2: Arsh */}
        <button
          id="tab-arsh"
          onClick={() => setActiveTab('arsh')}
          className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-t-xl font-medium text-sm transition-all duration-200 border-t-2 select-none ${
            activeTab === 'arsh'
              ? 'bg-[#8c2621] text-white border-red-400 shadow-[0_-4px_16px_rgba(239,68,68,0.15)] font-semibold'
              : 'bg-[#181926] text-gray-400 border-transparent hover:bg-[#1e2030] hover:text-gray-200'
          }`}
        >
          <div className="w-6 h-6 rounded-lg bg-red-500/20 text-red-300 flex items-center justify-center text-xs font-bold">
            <User className="w-3.5 h-3.5" />
          </div>
          <span className="font-['Outfit'] tracking-wide">mahmoud arsh im sorry</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'arsh' ? 'bg-red-400/25 text-red-100 font-bold' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {arshCount}
          </span>
          {activeTab === 'arsh' && (
            <span className="w-2 h-2 rounded-full bg-red-400 absolute right-2 top-2"></span>
          )}
        </button>

        {/* Tab 3: Shared / Fun */}
        <button
          id="tab-shared"
          onClick={() => setActiveTab('shared')}
          className={`group relative flex items-center gap-2.5 px-5 py-3 rounded-t-xl font-medium text-sm transition-all duration-200 border-t-2 select-none ${
            activeTab === 'shared'
              ? 'bg-[#1e2029] text-amber-300 border-amber-400 shadow-[0_-4px_16px_rgba(245,158,11,0.15)] font-semibold'
              : 'bg-[#181926] text-gray-400 border-transparent hover:bg-[#1e2030] hover:text-gray-200'
          }`}
        >
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs font-bold">
            <Users className="w-3.5 h-3.5" />
          </div>
          <span className="font-['Outfit'] tracking-wide">fun googogoaaaagga</span>
          <span className="text-[10px] text-amber-400/80 bg-amber-400/10 px-1.5 py-0.2 rounded font-mono">
            fun shit
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              activeTab === 'shared' ? 'bg-amber-400/25 text-amber-100 font-bold' : 'bg-gray-800 text-gray-400'
            }`}
          >
            {sharedCount}
          </span>
          {activeTab === 'shared' && (
            <span className="w-2 h-2 rounded-full bg-amber-400 absolute right-2 top-2"></span>
          )}
        </button>

      </div>
    </div>
  );
};
