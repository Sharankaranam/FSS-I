'use client';

import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="w-full glass-panel rounded-2xl p-6 mb-8 border border-slate-800 animate-pulse space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="space-y-2">
          <div className="h-5 w-48 bg-slate-800 rounded-lg" />
          <div className="h-3 w-80 bg-slate-800/60 rounded-lg" />
        </div>
        <div className="h-8 w-32 bg-slate-800/80 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-64 bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="h-4 w-36 bg-slate-800 rounded-md" />
          <div className="h-20 bg-slate-800/40 rounded-xl" />
          <div className="h-20 bg-slate-800/40 rounded-xl" />
        </div>

        <div className="h-64 bg-slate-900/60 rounded-xl border border-slate-800 p-4 space-y-3">
          <div className="h-4 w-36 bg-slate-800 rounded-md" />
          <div className="h-20 bg-slate-800/40 rounded-xl" />
          <div className="h-20 bg-slate-800/40 rounded-xl" />
        </div>
      </div>
    </div>
  );
};
