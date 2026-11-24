'use client';

import React, { useState } from 'react';
import { ArrowRight, ShieldAlert, ShieldHalf, Check, Plus, Trash2, Pencil } from 'lucide-react';
import { CRITICAL_THRESHOLD, MODERATE_THRESHOLD, formatMinutes, Tone, toneBg } from './ui';
import type { LoadType, PlannerTask } from '../utils/api';
import { splitTasks } from '../utils/plan';

const LOAD_TONE: Record<LoadType, Tone> = { High: 'danger', Moderate: 'warn', Low: 'ok' };
const LOADS: LoadType[] = ['Low', 'Moderate', 'High'];

export type TaskDraft = { title: string; category: string; load_type: LoadType; estimated_mins: number };

interface TaskBoardProps {
  tasks: PlannerTask[];
  loading?: boolean;
  cognitiveLoadScore: number | null;
  onAdd: (draft: TaskDraft) => Promise<void>;
  onUpdate: (id: number, patch: Partial<TaskDraft & { done: boolean }>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  loading = false,
  cognitiveLoadScore,
  onAdd,
  onUpdate,
  onDelete,
}) => {
  const { mode, today, deferred, open } = splitTasks(tasks, cognitiveLoadScore);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const sum = (ts: PlannerTask[]) => ts.reduce((a, t) => a + t.estimated_mins, 0);

  const renderTask = (t: PlannerTask, isDeferred = false) =>
    editingId === t.id ? (
      <li key={t.id} className="px-1 py-2">
        <TaskForm
          initial={t}
          submitLabel="Save"
          onCancel={() => setEditingId(null)}
          onSubmit={async (d) => {
            await onUpdate(t.id, d);
            setEditingId(null);
          }}
        />
      </li>
    ) : (
      <TaskRow
        key={t.id}
        task={t}
        deferred={isDeferred}
        onToggle={() => onUpdate(t.id, { done: !t.done })}
        onEdit={() => {
          setEditingId(t.id);
          setAdding(false);
        }}
        onDelete={() => onDelete(t.id)}
      />
    );

  const summary =
    mode === 'unknown'
      ? 'Your plan adapts once a load score is available.'
      : mode === 'shielded'
      ? `Load is above ${CRITICAL_THRESHOLD}, so every deep-work task moved to tomorrow.`
      : mode === 'limited'
      ? `Load is between ${MODERATE_THRESHOLD} and ${CRITICAL_THRESHOLD}: one short deep-work block stays, the rest move to tomorrow.`
      : 'Load is low. Your full schedule stays in place.';

  return (
    <div className="card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 sm:px-6 pt-5 pb-4 border-b border-line">
        <div>
          <h3 className="font-medium">Today&apos;s plan</h3>
          <p className="text-[13px] text-muted mt-0.5">{summary}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          {mode === 'shielded' && (
            <span className="tag bg-danger/10 text-danger">
              <ShieldAlert className="w-3.5 h-3.5" /> Shield on
            </span>
          )}
          {mode === 'limited' && (
            <span className="tag bg-warn/10 text-warn">
              <ShieldHalf className="w-3.5 h-3.5" /> Partial shield
            </span>
          )}
          <button
            className="btn-ghost !py-1.5"
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
          >
            <Plus className="w-4 h-4" /> Add task
          </button>
        </div>
      </div>

      {adding && (
        <div className="px-4 sm:px-5 py-3 border-b border-line bg-sunken/40">
          <TaskForm
            submitLabel="Add task"
            onCancel={() => setAdding(false)}
            onSubmit={async (d) => {
              await onAdd(d);
              setAdding(false);
            }}
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 md:divide-x divide-line">
        <Column title="Today" meta={`${open.length} open · ${formatMinutes(sum(open))}`}>
          {loading && tasks.length === 0 ? (
            <Empty>Loading tasks…</Empty>
          ) : today.length === 0 ? (
            <Empty>No tasks yet. Add one to start planning.</Empty>
          ) : (
            today.map((t) => renderTask(t))
          )}
        </Column>
        <Column
          title="Moved to tomorrow"
          meta={deferred.length ? `${deferred.length} · ${formatMinutes(sum(deferred))}` : 'None'}
          className="border-t md:border-t-0 border-line"
        >
          {deferred.length === 0 ? (
            <Empty>No tasks deferred.</Empty>
          ) : (
            deferred.map((t) => renderTask(t, true))
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
    <ul className="space-y-0.5">{children}</ul>
  </div>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <li className="px-3 py-8 text-center text-[13px] text-faint border border-dashed border-line rounded-lg">
    {children}
  </li>
);

const TaskRow = ({
  task,
  deferred = false,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: PlannerTask;
  deferred?: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <li
    className={`group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sunken transition-colors ${
      deferred || task.done ? 'text-muted' : ''
    }`}
  >
    <button
      role="checkbox"
      aria-checked={task.done}
      aria-label={task.done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
      onClick={onToggle}
      className={`w-[18px] h-[18px] rounded-[5px] border grid place-items-center shrink-0 transition-colors ${
        task.done ? 'bg-accent border-accent text-accent-ink' : 'border-faint/60 hover:border-accent'
      }`}
    >
      {task.done && <Check className="w-3 h-3" strokeWidth={3} />}
    </button>
    <div className="flex-1 min-w-0">
      <div className={`text-[13.5px] truncate ${task.done ? 'line-through decoration-faint' : ''}`}>{task.title}</div>
      <div className="flex items-center gap-2 text-[11.5px] text-faint mt-0.5">
        <span className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full ${toneBg[LOAD_TONE[task.load_type]]}`} />
          {task.load_type} load
        </span>
        <span>·</span>
        <span className="truncate">{task.category}</span>
        {deferred && (
          <>
            <span>·</span>
            <span className="flex items-center gap-0.5 text-warn shrink-0">
              <ArrowRight className="w-3 h-3" /> Tomorrow
            </span>
          </>
        )}
      </div>
    </div>
    <span className="num font-mono text-[12px] text-faint shrink-0 group-hover:hidden group-focus-within:hidden">
      {formatMinutes(task.estimated_mins)}
    </span>
    <span className="hidden group-hover:flex group-focus-within:flex items-center gap-0.5 shrink-0">
      <button onClick={onEdit} className="p-1.5 rounded-md text-faint hover:text-ink hover:bg-surface" aria-label={`Edit "${task.title}"`}>
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button onClick={onDelete} className="p-1.5 rounded-md text-faint hover:text-danger hover:bg-surface" aria-label={`Delete "${task.title}"`}>
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </span>
  </li>
);

const TaskForm = ({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<TaskDraft>;
  submitLabel: string;
  onSubmit: (d: TaskDraft) => Promise<void>;
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState(initial?.category ?? '');
  const [load, setLoad] = useState<LoadType>(initial?.load_type ?? 'Moderate');
  const [mins, setMins] = useState(String(initial?.estimated_mins ?? 30));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = parseInt(mins, 10);
    if (!title.trim()) return setErr('Give the task a name.');
    if (!m || m <= 0) return setErr('Estimated time must be at least 1 minute.');
    setSaving(true);
    setErr(null);
    try {
      await onSubmit({ title: title.trim(), category: category.trim() || 'General', load_type: load, estimated_mins: m });
    } catch (ex: any) {
      setErr(ex.message || 'Could not save the task.');
      setSaving(false);
    }
  };

  const field = 'bg-surface border border-line rounded-lg px-2.5 py-1.5 text-[13px] focus:outline-none focus:border-accent';

  return (
    <form onSubmit={submit} onKeyDown={(e) => e.key === 'Escape' && onCancel()} className="space-y-2.5">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          aria-label="Task title"
          className={`${field} flex-1 min-w-0`}
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          aria-label="Category"
          className={`${field} sm:w-36`}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="segmented" role="group" aria-label="Load">
          {LOADS.map((l) => (
            <button type="button" key={l} aria-pressed={load === l} onClick={() => setLoad(l)} className="inline-flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${toneBg[LOAD_TONE[l]]}`} />
              {l}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5 text-[12.5px] text-muted">
          <input
            type="number"
            min={1}
            max={1440}
            value={mins}
            onChange={(e) => setMins(e.target.value)}
            aria-label="Estimated minutes"
            className={`${field} w-20 num`}
          />
          min
        </label>
        <div className="flex items-center gap-1 ml-auto">
          <button type="button" onClick={onCancel} className="btn-ghost">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {submitLabel}
          </button>
        </div>
      </div>
      {err && <p className="text-[12.5px] text-danger">{err}</p>}
    </form>
  );
};
