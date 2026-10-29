'use client';

import React from 'react';
import { Cpu, Activity, Brain, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  score: number | null;
  kmIterations: number | null;
  recommendedAction: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  score,
  kmIterations,
  recommendedAction,
}) => {
  const isHighLoad = score !== null && score > 65;

  return (
    <header className="w-full glass-panel border-b border-slate-800 py-4 px-6 mb-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-xl text-white shadow-lg shadow-teal-500/20">
            <Brain className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                Computing with Words (CWW)
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
                IT2 Fuzzy Logic
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Behavioral Load Manager &bull; Dynamic Cognitive Workload Management
            </p>
          </div>
        </div>

        {/* Real-time Status Badge & Score Quick-View */}
        <div className="flex items-center gap-4 flex-wrap">
          {score !== null && (
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/60 rounded-xl border border-slate-700/60">
              <div className="text-right">
                <div className="text-xs text-slate-400 font-medium">Cognitive Load</div>
                <div className="text-lg font-extrabold flex items-center justify-end gap-1">
                  <span className={isHighLoad ? 'text-amber-400' : 'text-emerald-400'}>
                    {score.toFixed(1)}
                  </span>
                  <span className="text-xs font-normal text-slate-400">/ 100</span>
                </div>
              </div>

              <div
                className={`w-3 h-3 rounded-full animate-pulse ${
                  isHighLoad ? 'bg-amber-400 shadow-amber-500/50' : 'bg-emerald-400 shadow-emerald-500/50'
                } shadow-lg`}
              />
            </div>
          )}

          {kmIterations !== null && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-slate-900/40 rounded-xl border border-slate-800 text-xs text-slate-300">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>KM Iterations: <strong>{kmIterations}</strong></span>
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Karnik-Mendel Engine Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};
