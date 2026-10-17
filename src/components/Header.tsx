/**
 * Header.tsx
 * Top navigation bar with physics branding, metric indicators, and clean tabs.
 */

import React from 'react';
import { Sparkles, Activity, BookOpen, Calculator, Eye } from 'lucide-react';

export type ActiveTab = 'apparatus' | 'graphs' | 'real_calc' | 'manual';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentL: number;
  theoreticalNA: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentL,
  theoreticalNA
}) => {
  const tabs = [
    { id: 'apparatus' as ActiveTab, label: '3D Optical Apparatus', icon: Eye },
    { id: 'graphs' as ActiveTab, label: 'Scientific Graphs (D & NA vs L)', icon: Activity },
    { id: 'real_calc' as ActiveTab, label: 'Real Lab Calculator', icon: Calculator },
    { id: 'manual' as ActiveTab, label: 'Lab Manual & Viva Voce', icon: BookOpen }
  ];

  return (
    <header className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 py-2.5 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title & College Physics Lab Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/50">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm md:text-base font-extrabold tracking-tight text-white uppercase font-sans">
                NUMERICAL APERTURE — OPTICAL FIBER LAB
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-bold rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                B.Tech Physics
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive 3D Physical Apparatus • Formula: θ = sin⁻¹(NA) • Experimental Analysis
            </p>
          </div>
        </div>

        {/* Quick Metrics Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Distance L:</span>
              <span className="font-mono font-bold text-amber-400">{currentL.toFixed(1)} mm</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400">Theoretical NA:</span>
              <span className="font-mono font-bold text-emerald-400">{theoreticalNA.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 mt-2.5 overflow-x-auto pb-0.5 border-t border-slate-900/60 pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-sm font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
