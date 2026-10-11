'use client';

import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckCircle2, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';

export interface Task {
  id: string;
  title: string;
  category: string;
  loadType: 'High' | 'Moderate' | 'Low';
  estimatedMins: number;
}

const INITIAL_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Write System Architecture Documentation',
    category: 'Deep Work',
    loadType: 'High',
    estimatedMins: 90,
  },
  {
    id: 't2',
    title: 'Reply to Team Slack Messages & Emails',
    category: 'Communication',
    loadType: 'Low',
    estimatedMins: 20,
  },
  {
    id: 't3',
    title: 'Review Pull Requests for Fuzzy Engine',
    category: 'Code Review',
    loadType: 'Moderate',
    estimatedMins: 45,
  },
  {
    id: 't4',
    title: 'Refactor Karnik-Mendel Matrix Operations',
    category: 'Deep Work',
    loadType: 'High',
    estimatedMins: 120,
  },
  {
    id: 't5',
    title: 'Organize Desktop & Workspace Files',
    category: 'Admin',
    loadType: 'Low',
    estimatedMins: 15,
  },
];

interface TaskBoardProps {
  cognitiveLoadScore: number | null;
  recommendedAction: string | null;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  cognitiveLoadScore,
  recommendedAction,
}) => {
  const isHighLoad = cognitiveLoadScore !== null && cognitiveLoadScore > 65;

  // Filter tasks into columns based on dynamic CWW score reprioritization
  const todayTasks = INITIAL_TASKS.filter((task) => {
    if (isHighLoad && task.loadType === 'High') {
      return false; // Defer high load tasks
    }
    return true;
  });

  const deferredTasks = INITIAL_TASKS.filter((task) => {
    if (isHighLoad && task.loadType === 'High') {
      return true; // Moved to deferred
    }
    return false;
  });

  return (
    <div className="w-full glass-panel rounded-2xl p-6 mb-8 border border-slate-700/60 shadow-xl">
      {/* Dynamic Load Alert Banner */}
      {cognitiveLoadScore !== null && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
            isHighLoad
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}
        >
          <div className="flex items-center gap-3">
            {isHighLoad ? (
              <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            )}
            <div>
              <div className="font-bold text-sm">
                {isHighLoad
                  ? 'High Cognitive Load Detected (> 65.0) — Deep Work Tasks Auto-Deferred!'
                  : 'Optimal Cognitive Load (&le; 65.0) — Full Schedule Active'}
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {isHighLoad
                  ? `Score of ${cognitiveLoadScore.toFixed(1)} triggered dynamic schedule adjustment. High-load tasks are shifted to tomorrow to prevent fatigue.`
                  : `Score of ${cognitiveLoadScore.toFixed(1)} indicates balanced energy. You are ready for high-focus deep work!`}
              </p>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-xs font-mono px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-700">
              Score: {cognitiveLoadScore.toFixed(1)} / 100
            </span>
          </div>
        </div>
      )}

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Column 1: Today's Focus */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-slate-200 text-sm">
                Today&apos;s Focus Schedule
              </h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
              {todayTasks.length} tasks
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {todayTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic">
                No active tasks for today. Rest & recover!
              </div>
            ) : (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl glass-panel glass-panel-hover border border-slate-800 flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-100">
                      {task.title}
                    </span>
                    <Badge loadType={task.loadType} />
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[11px]">
                      {task.category}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {task.estimatedMins} min
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Deferred / Tomorrow */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-slate-200 text-sm">
                Deferred / Tomorrow Schedule
              </h3>
            </div>
            <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30">
              {deferredTasks.length} deferred
            </span>
          </div>

          <div className="space-y-3 flex-1">
            {deferredTasks.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs italic border border-dashed border-slate-800 rounded-xl">
                No tasks deferred. Cognitive load is manageable!
              </div>
            ) : (
              deferredTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 shadow-lg animate-fadeIn flex flex-col justify-between gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-200 line-through text-slate-400">
                      {task.title}
                    </span>
                    <Badge loadType={task.loadType} deferred />
                  </div>

                  <div className="flex items-center justify-between text-xs text-amber-400/90 pt-2 border-t border-slate-800">
                    <span className="flex items-center gap-1 text-[11px] font-medium">
                      <ArrowRight className="w-3 h-3" />
                      Moved to Tomorrow
                    </span>
                    <span className="font-mono text-slate-400">
                      {task.estimatedMins} min
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Badge = ({
  loadType,
  deferred = false,
}: {
  loadType: 'High' | 'Moderate' | 'Low';
  deferred?: boolean;
}) => {
  if (loadType === 'High') {
    return (
      <span
        className={`px-2.5 py-0.5 text-[11px] font-bold rounded-md shrink-0 border ${
          deferred
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        }`}
      >
        High Load
      </span>
    );
  }
  if (loadType === 'Moderate') {
    return (
      <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md shrink-0 bg-amber-500/10 text-amber-400 border border-amber-500/20">
        Moderate Load
      </span>
    );
  }
  return (
    <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-md shrink-0 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      Low Load
    </span>
  );
};
