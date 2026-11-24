'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BatteryMedium, Flame, Moon, BrainCircuit } from 'lucide-react';
import { Tone, toneBg } from './ui';
import { Switch } from './ui/switch';
import { Label } from './ui/label';

type Numeric = { fatigue_num?: number; stress_num?: number; sleep_num?: number; task_num?: number };

interface CheckInPanelProps {
  onEvaluate: (fatigue: string, stress: string, sleep: string, task: string, numeric?: Numeric) => void;
  loading: boolean;
  currentFatigue: string;
  currentStress: string;
  currentSleep: string;
  currentTask: string;
}

type Option = { id: string; desc: string; justification: string };
type DriverKey = 'fatigue' | 'stress' | 'sleep' | 'task';

const TONES: Tone[] = ['ok', 'warn', 'danger'];

const DRIVERS: {
  key: DriverKey;
  label: string;
  question: string;
  scale: string;
  icon: React.ElementType;
  sliderLabel: string;
  options: Option[];
}[] = [
  {
    key: 'fatigue',
    label: 'Fatigue',
    question: 'How much energy do you have?',
    scale: 'Samn-Perelli',
    icon: BatteryMedium,
    sliderLabel: 'Fatigue',
    options: [
      { id: 'Energized', desc: 'Optimal alertness and physical vigor.', justification: 'Samn-Perelli 1–2. LMF core [0, 20] ensures full vigor.' },
      { id: 'Drained', desc: 'Moderate cognitive fatigue.', justification: 'Samn-Perelli 3–4. Processing speed slows by 15–25%.' },
      { id: 'Exhausted', desc: 'Severe mental and physical depletion.', justification: 'Samn-Perelli 5–7. Working memory degrades exponentially.' },
    ],
  },
  {
    key: 'stress',
    label: 'Stress',
    question: 'How much pressure do you feel?',
    scale: 'Cohen PSS',
    icon: Flame,
    sliderLabel: 'Stress',
    options: [
      { id: 'Relaxed', desc: 'Calm, parasympathetic dominance.', justification: 'Baseline calm (PSS < 10). UMF extends to 55 for positive eustress.' },
      { id: 'Pressured', desc: 'Time pressure and deadline urgency.', justification: 'Yerkes-Dodson optimal performance zone.' },
      { id: 'Overwhelmed', desc: 'Acute distress and emotional strain.', justification: 'Cortisol spike impairs prefrontal executive control.' },
    ],
  },
  {
    key: 'sleep',
    label: 'Sleep',
    question: 'How did you sleep?',
    scale: 'PSQI',
    icon: Moon,
    sliderLabel: 'Sleep deficit',
    options: [
      { id: 'Restful', desc: '8+ hours of restorative sleep.', justification: 'Full REM and slow-wave recovery (PSQI < 5).' },
      { id: 'Restless', desc: 'Fragmented or insufficient sleep.', justification: 'PSQI 5–10. Attentional lapses increase by ~30%.' },
      { id: 'Deprived', desc: 'Severe sleep debt or an all-nighter.', justification: '> 24h awake. Deficit comparable to 0.10% BAC.' },
    ],
  },
  {
    key: 'task',
    label: 'Task demand',
    question: 'How hard is the work ahead?',
    scale: 'NASA-TLX',
    icon: BrainCircuit,
    sliderLabel: 'Task demand',
    options: [
      { id: 'Routine', desc: 'Simple admin and email sorting.', justification: 'Low demand: 1–2 items in working memory (Cowan).' },
      { id: 'Challenging', desc: 'Code review and analytical writing.', justification: 'Moderate demand: 3–4 items in working memory.' },
      { id: 'Intense', desc: 'System design and deep math proofs.', justification: 'High demand: 5+ items, at capacity limit.' },
    ],
  },
];

const PRESETS: { label: string; values: [string, string, string, string] }[] = [
  { label: 'Fresh morning', values: ['Energized', 'Relaxed', 'Restful', 'Routine'] },
  { label: 'Midday crunch', values: ['Drained', 'Pressured', 'Restless', 'Challenging'] },
  { label: 'Burnout risk', values: ['Exhausted', 'Overwhelmed', 'Deprived', 'Intense'] },
];

export const CheckInPanel: React.FC<CheckInPanelProps> = ({
  onEvaluate,
  currentFatigue,
  currentStress,
  currentSleep,
  currentTask,
}) => {
  const [sel, setSel] = useState<Record<DriverKey, string>>({
    fatigue: currentFatigue,
    stress: currentStress,
    sleep: currentSleep,
    task: currentTask,
  });
  const [numericMode, setNumericMode] = useState(false);
  const [nums, setNums] = useState<Record<DriverKey, number>>({ fatigue: 50, stress: 60, sleep: 55, task: 65 });
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(debounce.current), []);

  const run = (s: Record<DriverKey, string>, n: Record<DriverKey, number>, useNumeric: boolean) =>
    onEvaluate(
      s.fatigue,
      s.stress,
      s.sleep,
      s.task,
      useNumeric ? { fatigue_num: n.fatigue, stress_num: n.stress, sleep_num: n.sleep, task_num: n.task } : undefined
    );

  const choose = (key: DriverKey, id: string) => {
    const next = { ...sel, [key]: id };
    setSel(next);
    run(next, nums, numericMode);
  };

  const applyPreset = (values: [string, string, string, string]) => {
    const next = { fatigue: values[0], stress: values[1], sleep: values[2], task: values[3] };
    setSel(next);
    run(next, nums, numericMode);
  };

  const slide = (key: DriverKey, v: number) => {
    const next = { ...nums, [key]: v };
    setNums(next);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => run(sel, next, true), 120);
  };

  const toggleNumeric = () => {
    const next = !numericMode;
    setNumericMode(next);
    run(sel, nums, next);
  };

  const activePreset = PRESETS.find(
    (p) =>
      p.values[0] === sel.fatigue && p.values[1] === sel.stress && p.values[2] === sel.sleep && p.values[3] === sel.task
  );

  return (
    <section className="card" aria-labelledby="checkin-heading">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 sm:px-6 pt-5 pb-4 border-b">
        <div>
          <h2 id="checkin-heading" className="text-base font-semibold">How are you right now?</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Pick the words that fit. The score updates as you go.</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p.values)}
              aria-pressed={activePreset === p}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors duration-200 ${
                activePreset === p
                  ? 'border-foreground bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:border-faint'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border">
        {DRIVERS.map((d) => {
          const Icon = d.icon;
          const selIdx = Math.max(0, d.options.findIndex((o) => o.id === sel[d.key]));
          const current = d.options[selIdx];
          return (
            <div key={d.key} className="px-5 sm:px-6 py-4 grid sm:grid-cols-[180px_1fr] gap-3 sm:gap-6">
              <div className="flex items-start gap-2.5">
                <Icon className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <h3 className="text-sm font-medium">{d.label}</h3>
                  <div className="text-xs text-muted-foreground">{d.question}</div>
                </div>
              </div>

              <div className="min-w-0">
                <div className="segmented w-full sm:w-auto" role="group" aria-label={d.label}>
                  {d.options.map((o, i) => (
                    <button
                      key={o.id}
                      aria-pressed={sel[d.key] === o.id}
                      onClick={() => choose(d.key, o.id)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5"
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          sel[d.key] === o.id ? toneBg[TONES[i]] : 'bg-faint/50'
                        }`}
                      />
                      {o.id}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-sm text-muted-foreground max-w-[65ch]">
                  {current.desc}{' '}
                  <span className="text-faint">{current.justification}</span>
                </p>

                {numericMode && (
                  <div className="mt-3 flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={nums[d.key]}
                      onChange={(e) => slide(d.key, Number(e.target.value))}
                      className="range flex-1"
                      style={{ ['--pct' as string]: `${nums[d.key]}%` }}
                      aria-label={`${d.sliderLabel} (0–100)`}
                    />
                    <span className="num text-sm w-8 text-right">{nums[d.key]}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 sm:px-6 py-3 border-t flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Switch id="numeric-mode" checked={numericMode} onCheckedChange={toggleNumeric} />
          <Label htmlFor="numeric-mode" className="font-normal text-muted-foreground cursor-pointer">
            Fine-tune with sliders (0–100)
          </Label>
        </div>
        <span className="hidden sm:block text-xs text-muted-foreground">
          {numericMode ? 'Exact values replace the words' : 'Words only'}
        </span>
      </div>
    </section>
  );
};
