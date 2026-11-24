'use client';

import React from 'react';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import { CRITICAL_THRESHOLD, formatMinutes, Tone, toneBg } from './ui';

export interface Task {
  id: string;
  title: string;
  category: string;
  loadType: 'High' | 'Moderate' | 'Low';
  estimatedMins: number;
}

export const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Write system architecture documentation', category: 'Deep work', loadType: 'High', estimatedMins: 90 },
  { id: 't2', title: 'Reply to team Slack messages and emails', category: 'Communication', loadType: 'Low', estimatedMins: 20 },
  { id: 't3', title: 'Review pull requests for the fuzzy engine', category: 'Code review', loadType: 'Moderate', estimatedMins: 45 },
  { id: 't4', title: 'Refactor Karnik-Mendel matrix operations', category: 'Deep work', loadType: 'High', estimatedMins: 120 },
  { id: 't5', title: 'Organize desktop and workspace files', category: 'Admin', loadType: 'Low', estimatedMins: 15 },
];

const LOAD_TONE: Record<Task['loadType'], Tone> = { High: 'danger', Moderate: 'warn', Low: 'ok' };

export function splitTasks(score: number | null) {
  const high = score !== null && score > CRITICAL_THRESHOLD;
  const today = INITIAL_TASKS.filter((t) => !(high && t.loadType === 'High'));
  const deferred = INITIAL_TASKS.filter((t) => high && t.loadType === 'High');
  return { high, today, deferred };
}

interface TaskBoardProps {
  cognitiveLoadScore: number | null;
  recommendedAction?: string | null;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({ cognitiveLoadScore }) => {
  const { high, today, deferred } = splitTasks(cognitiveLoadScore);
  const sum = (ts: Task[]) => ts.reduce((a, t) => a + t.estimatedMins, 0);

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 sm:px-6 pt-5 pb-4 border-b border-line">
        <div>
          <h3 className="font-medium">Today&apos;s plan</h3>
          <p className="text-[13px] text-muted mt-0.5">
            {cognitiveLoadScore === null
              ? 'Your schedule adapts once a load score is available.'
              : high
              ? `Load is above ${CRITICAL_THRESHOLD}, so deep-work tasks moved to tomorrow.`
              : 'Load is manageable. Your full schedule stays in place.'}
          </p>
        </div>
        {high && (
          <span className="tag bg-warn/10 text-warn self-start sm:self-center">
            <ShieldAlert className="w-3.5 h-3.5" /> Shield active
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 md:divide-x divide-line">
        <Column title="Today" meta={`${today.length} tasks · ${formatMinutes(sum(today))}`}>
          {today.length === 0 ? (
            <Empty>Nothing scheduled. Rest and recover.</Empty>
          ) : (
            today.map((t) => <TaskRow key={t.id} task={t} />)
          )}
        </Column>
        <Column
          title="Moved to tomorrow"
          meta={deferred.length ? `${deferred.length} tasks · ${formatMinutes(sum(deferred))}` : 'None'}
          className="border-t md:border-t-0 border-line"
        >
          {deferred.length === 0 ? (
            <Empty>No tasks deferred.</Empty>
          ) : (
            deferred.map((t) => <TaskRow key={t.id} task={t} deferred />)
          )}
        </Column>
      </div>
    </div>
  );
};

const Column = ({
  title,
  meta,
  children,
  className = '',
}: {
  title: string;
  meta: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`p-3 sm:p-4 ${className}`}>
    <div className="flex items-baseline justify-between px-2 pb-2">
      <span className="text-[13px] font-medium">{title}</span>
      <span className="text-[12px] text-faint num">{meta}</span>
    </div>
    <ul className="space-y-1">{children}</ul>
  </div>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <li className="px-3 py-8 text-center text-[13px] text-faint border border-dashed border-line rounded-lg">
    {children}
  </li>
);

const TaskRow = ({ task, deferred = false }: { task: Task; deferred?: boolean }) => (
  <li
    className={`group flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-sunken transition-colors animate-rise ${
      deferred ? 'text-muted' : ''
    }`}
  >
    <span
      className={`w-1 self-stretch rounded-full shrink-0 ${toneBg[LOAD_TONE[task.loadType]]} ${
        deferred ? 'opacity-40' : 'opacity-80'
      }`}
      aria-hidden
    />
    <div className="flex-1 min-w-0">
      <div className={`text-[13.5px] truncate ${deferred ? 'line-through decoration-faint' : ''}`}>{task.title}</div>
      <div className="flex items-center gap-2 text-[11.5px] text-faint mt-0.5">
        <span>{task.loadType} load</span>
        <span>·</span>
        <span>{task.category}</span>
        {deferred && (
          <>
            <span>·</span>
            <span className="flex items-center gap-0.5 text-warn">
              <ArrowRight className="w-3 h-3" /> Tomorrow
            </span>
          </>
        )}
      </div>
    </div>
    <span className="num font-mono text-[12px] text-faint shrink-0">{formatMinutes(task.estimatedMins)}</span>
  </li>
);
