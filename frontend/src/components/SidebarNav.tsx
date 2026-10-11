'use client';

import React from 'react';
import { LayoutDashboard, Sliders, LineChart, BookOpen, Cpu } from 'lucide-react';

export type TabType = 'dashboard' | 'input' | 'visualizer' | 'rationale';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  deferredCount: number;
  score: number | null;
}

export const SidebarNav: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  deferredCount,
  score,
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Task Board',
      icon: LayoutDashboard,
      badge: deferredCount > 0 ? `${deferredCount} Deferred` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'input' as TabType,
      label: 'Behavioral Drivers',
      icon: Sliders,
    },
    {
      id: 'visualizer' as TabType,
      label: 'IT2 FOU Visualizer',
      icon: LineChart,
      badge: score !== null ? `Score: ${score.toFixed(1)}` : undefined,
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    },
    {
      id: 'rationale' as TabType,
      label: 'Academic Rationale',
      icon: BookOpen,
    },
  ];

  return (
    <nav className="w-full bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 mb-6 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800/80">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 px-2 py-0.5 text-[10px] font-mono rounded-full border ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 px-3 py-1.5 bg-slate-950/60 rounded-xl border border-slate-800">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-mono text-[11px]">Karnik-Mendel Type-Reduction Active</span>
        </div>
      </div>
    </nav>
  );
};
