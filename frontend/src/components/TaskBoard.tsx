'use client';

import React, { useId, useState } from 'react';
import { ArrowRight, ShieldAlert, ShieldHalf, Plus, Trash2, Pencil } from 'lucide-react';
import { CRITICAL_THRESHOLD, MODERATE_THRESHOLD, formatMinutes, Tone, ToneBadge, toneBg } from './ui';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Label } from './ui/label';
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
          submitLabel="Save changes"
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
      ? `Load is between ${MODERATE_THRESHOLD} and ${CRITICAL_THRESHOLD}. One short deep-work block stays; the rest move to tomorrow.`
      : 'Load is low. Your full schedule stays in place.';

  return (
    <section className="card" aria-labelledby="plan-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b">
        <div>
          <h2 id="plan-heading" className="text-base font-semibold">
            Today&apos;s plan
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5 max-w-[65ch]">{summary}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          {mode === 'shielded' && (
            <ToneBadge tone="danger">
              <ShieldAlert /> Shield on
            </ToneBadge>
          )}
          {mode === 'limited' && (
            <ToneBadge tone="warn">
              <ShieldHalf /> Partial shield
            </ToneBadge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
          >
            <Plus /> Add task
          </Button>
        </div>
      </div>

      {adding && (
        <div className="px-4 sm:px-5 py-4 border-b bg-sunken">
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

      <div className="grid md:grid-cols-2 md:divide-x">
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
          className="border-t md:border-t-0"
        >
          {deferred.length === 0 ? (
            <Empty>Nothing deferred. Heavy work stays on today&apos;s plan.</Empty>
          ) : (
            deferred.map((t) => renderTask(t, true))
          )}
        </Column>
      </div>
    </section>
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
      <h3 className="text-sm font-medium">{title}</h3>
      <span className="text-xs text-muted-foreground num">{meta}</span>
    </div>
    <ul className="space-y-0.5" aria-label={title}>
      {children}
    </ul>
  </div>
);

const Empty = ({ children }: { children: React.ReactNode }) => (
  <li className="px-3 py-8 text-center text-sm text-muted-foreground rounded-lg bg-sunken">{children}</li>
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
    className={`group flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-sunken transition-colors duration-150 ${
      deferred || task.done ? 'text-muted-foreground' : ''
    }`}
  >
    <Checkbox
      checked={task.done}
      onCheckedChange={onToggle}
      aria-label={task.done ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}
      className="size-[18px] rounded-[5px]"
    />
    <div className="flex-1 min-w-0">
      <div className={`text-sm truncate ${task.done ? 'line-through decoration-faint' : ''}`}>{task.title}</div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
        <span className="flex items-center gap-1">
          <span className={`size-1.5 rounded-full ${toneBg[LOAD_TONE[task.load_type]]}`} aria-hidden />
          {task.load_type} load
        </span>
        <span aria-hidden>·</span>
        <span className="truncate">{task.category}</span>
        {deferred && (
          <>
            <span aria-hidden>·</span>
            <span className="flex items-center gap-0.5 text-warn shrink-0">
              <ArrowRight className="size-3" /> Tomorrow
            </span>
          </>
        )}
      </div>
    </div>
    <span className="num text-xs text-muted-foreground shrink-0 group-hover:hidden group-focus-within:hidden">
      {formatMinutes(task.estimated_mins)}
    </span>
    <span className="hidden group-hover:flex group-focus-within:flex items-center shrink-0">
      <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label={`Edit "${task.title}"`}>
        <Pencil />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        aria-label={`Delete "${task.title}"`}
        className="hover:text-danger"
      >
        <Trash2 />
      </Button>
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
  const id = useId();
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
      setErr(`${ex.message || 'Could not save the task.'} Check the backend is running, then try again.`);
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      onKeyDown={(e) => e.key === 'Escape' && onCancel()}
      className="space-y-3"
      aria-label={submitLabel}
      noValidate
    >
      <div className="grid sm:grid-cols-[1fr_10rem] gap-3">
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-title`}>Task title</Label>
          <Input
            id={`${id}-title`}
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Draft the methods section"
            aria-invalid={err === 'Give the task a name.' || undefined}
            className="bg-card"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-category`}>Category</Label>
          <Input
            id={`${id}-category`}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="General"
            className="bg-card"
          />
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <span className="text-sm font-medium" id={`${id}-load`}>
            Load
          </span>
          <div className="segmented flex" role="radiogroup" aria-labelledby={`${id}-load`}>
            {LOADS.map((l) => (
              <button
                type="button"
                role="radio"
                key={l}
                aria-checked={load === l}
                onClick={() => setLoad(l)}
                className="inline-flex items-center gap-1.5"
              >
                <span className={`size-1.5 rounded-full ${toneBg[LOAD_TONE[l]]}`} aria-hidden />
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${id}-mins`}>Estimated minutes</Label>
          <Input
            id={`${id}-mins`}
            type="number"
            inputMode="numeric"
            min={1}
            max={1440}
            value={mins}
            onChange={(e) => setMins(e.target.value)}
            className="w-28 num bg-card"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {submitLabel}
          </Button>
        </div>
      </div>
      {err && (
        <p role="alert" className="text-sm text-danger">
          {err}
        </p>
      )}
    </form>
  );
};
