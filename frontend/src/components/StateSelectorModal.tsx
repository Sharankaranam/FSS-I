'use client';

import React, { useState } from 'react';
import {
  BatteryCharging,
  Flame,
  Moon,
  BrainCircuit,
  Sliders,
  Sparkles,
  Send,
  RefreshCw,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface StateSelectorModalProps {
  onEvaluate: (
    fatigue: string,
    stress: string,
    sleep: string,
    task: string,
    numeric?: {
      fatigue_num?: number;
      stress_num?: number;
      sleep_num?: number;
      task_num?: number;
    }
  ) => void;
  loading: boolean;
  currentFatigue: string;
  currentStress: string;
  currentSleep: string;
  currentTask: string;
}

const FATIGUE_OPTIONS = [
  {
    id: 'Energized',
    label: 'Energized',
    desc: 'Optimal alertness & physical vigor',
    justification: 'Samn-Perelli scale 1-2. LMF core [0, 20] ensures full vigor.',
    activeColor: 'bg-gradient-to-br from-emerald-500/25 to-teal-500/20 text-emerald-200 border-emerald-400 ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-500/20',
  },
  {
    id: 'Drained',
    label: 'Drained',
    desc: 'Moderate cognitive fatigue',
    justification: 'Samn-Perelli scale 3-4. Processing speed slows by 15-25%.',
    activeColor: 'bg-gradient-to-br from-amber-500/25 to-orange-500/20 text-amber-200 border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/20',
  },
  {
    id: 'Exhausted',
    label: 'Exhausted',
    desc: 'Severe mental & physical depletion',
    justification: 'Samn-Perelli scale 5-7. Working memory degrades exponentially.',
    activeColor: 'bg-gradient-to-br from-rose-500/25 to-red-500/20 text-rose-200 border-rose-400 ring-2 ring-rose-400/60 shadow-lg shadow-rose-500/20',
  },
];

const STRESS_OPTIONS = [
  {
    id: 'Relaxed',
    label: 'Relaxed',
    desc: 'Calm, parasympathetic dominance',
    justification: 'Baseline calm (PSS < 10). UMF extends to 55 for positive eustress.',
    activeColor: 'bg-gradient-to-br from-emerald-500/25 to-teal-500/20 text-emerald-200 border-emerald-400 ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-500/20',
  },
  {
    id: 'Pressured',
    label: 'Pressured',
    desc: 'Time pressure & deadline urgency',
    justification: 'Yerkes-Dodson optimal performance zone.',
    activeColor: 'bg-gradient-to-br from-amber-500/25 to-orange-500/20 text-amber-200 border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/20',
  },
  {
    id: 'Overwhelmed',
    label: 'Overwhelmed',
    desc: 'Acute distress & emotional strain',
    justification: 'Cortisol spike impairs prefrontal cortex executive control.',
    activeColor: 'bg-gradient-to-br from-rose-500/25 to-red-500/20 text-rose-200 border-rose-400 ring-2 ring-rose-400/60 shadow-lg shadow-rose-500/20',
  },
];

const SLEEP_OPTIONS = [
  {
    id: 'Restful',
    label: 'Restful',
    desc: '8+ hrs restorative REM sleep',
    justification: 'Full REM & slow-wave recovery (PSQI < 5). Maximum synaptic homeostasis.',
    activeColor: 'bg-gradient-to-br from-emerald-500/25 to-teal-500/20 text-emerald-200 border-emerald-400 ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-500/20',
  },
  {
    id: 'Restless',
    label: 'Restless',
    desc: 'Fragmented or insufficient sleep',
    justification: 'PSQI 5-10. Attentional lapses increase by 30%.',
    activeColor: 'bg-gradient-to-br from-amber-500/25 to-orange-500/20 text-amber-200 border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/20',
  },
  {
    id: 'Deprived',
    label: 'Deprived',
    desc: 'Severe sleep debt / All-nighter',
    justification: '> 24h wakefulness. Cognitive deficit equivalent to 0.10% BAC.',
    activeColor: 'bg-gradient-to-br from-rose-500/25 to-red-500/20 text-rose-200 border-rose-400 ring-2 ring-rose-400/60 shadow-lg shadow-rose-500/20',
  },
];

const TASK_OPTIONS = [
  {
    id: 'Routine',
    label: 'Routine',
    desc: 'Simple admin & email sorting',
    justification: 'NASA-TLX Low Demand (1-2 items in Cowan working memory model).',
    activeColor: 'bg-gradient-to-br from-emerald-500/25 to-teal-500/20 text-emerald-200 border-emerald-400 ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-500/20',
  },
  {
    id: 'Challenging',
    label: 'Challenging',
    desc: 'Code review & analytical writing',
    justification: 'NASA-TLX Moderate Demand (3-4 items in working memory).',
    activeColor: 'bg-gradient-to-br from-amber-500/25 to-orange-500/20 text-amber-200 border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/20',
  },
  {
    id: 'Intense',
    label: 'Intense',
    desc: 'System design & deep math proofs',
    justification: 'NASA-TLX High Demand (5+ items, operating at capacity limit).',
    activeColor: 'bg-gradient-to-br from-rose-500/25 to-red-500/20 text-rose-200 border-rose-400 ring-2 ring-rose-400/60 shadow-lg shadow-rose-500/20',
  },
];

export const StateSelectorModal: React.FC<StateSelectorModalProps> = ({
  onEvaluate,
  loading,
  currentFatigue,
  currentStress,
  currentSleep,
  currentTask,
}) => {
  const [selectedFatigue, setSelectedFatigue] = useState<string>(currentFatigue);
  const [selectedStress, setSelectedStress] = useState<string>(currentStress);
  const [selectedSleep, setSelectedSleep] = useState<string>(currentSleep);
  const [selectedTask, setSelectedTask] = useState<string>(currentTask);
  const [useNumericOverride, setUseNumericOverride] = useState<boolean>(false);
  const [fatigueNum, setFatigueNum] = useState<number>(50);
  const [stressNum, setStressNum] = useState<number>(60);
  const [sleepNum, setSleepNum] = useState<number>(55);
  const [taskNum, setTaskNum] = useState<number>(65);

  const handleSelect = (
    fatigue: string,
    stress: string,
    sleep: string,
    task: string
  ) => {
    setSelectedFatigue(fatigue);
    setSelectedStress(stress);
    setSelectedSleep(sleep);
    setSelectedTask(task);
    if (useNumericOverride) {
      onEvaluate(fatigue, stress, sleep, task, {
        fatigue_num: fatigueNum,
        stress_num: stressNum,
        sleep_num: sleepNum,
        task_num: taskNum,
      });
    } else {
      onEvaluate(fatigue, stress, sleep, task);
    }
  };

  const handleSliderChange = (
    fatigueN: number,
    stressN: number,
    sleepN: number,
    taskN: number
  ) => {
    setFatigueNum(fatigueN);
    setStressNum(stressN);
    setSleepNum(sleepN);
    setTaskNum(taskN);
    onEvaluate(selectedFatigue, selectedStress, selectedSleep, selectedTask, {
      fatigue_num: fatigueN,
      stress_num: stressN,
      sleep_num: sleepN,
      task_num: taskN,
    });
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6 border border-slate-700/80 shadow-2xl relative overflow-hidden">
      {/* Top Header & Presets Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full">
              Interactive 4-Driver Control Panel
            </span>
            <span className="text-xs text-slate-400">&bull; Click any card below to update load score</span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400 animate-pulse" />
            Subjective Behavioral State Selection (CWW Engine)
          </h2>
        </div>

        {/* Preset Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => handleSelect('Energized', 'Relaxed', 'Restful', 'Routine')}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-sm transition-all hover:scale-105"
          >
            ⚡ Fresh Morning
          </button>
          <button
            type="button"
            onClick={() => handleSelect('Drained', 'Pressured', 'Restless', 'Challenging')}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 shadow-sm transition-all hover:scale-105"
          >
            ⌛ Midday Crunch
          </button>
          <button
            type="button"
            onClick={() => handleSelect('Exhausted', 'Overwhelmed', 'Deprived', 'Intense')}
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-sm transition-all hover:scale-105"
          >
            🚨 Burnout Alert
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Driver 1: Fatigue */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BatteryCharging className="w-4 h-4 text-cyan-400" />
              Driver 1: Fatigue Level (Physical &amp; Mental Energy)
            </label>
            <span className="text-[11px] font-mono text-cyan-400">Selected: {selectedFatigue}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {FATIGUE_OPTIONS.map((item) => {
              const isSelected = selectedFatigue === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    handleSelect(item.id, selectedStress, selectedSleep, selectedTask)
                  }
                  className={`p-4 rounded-xl text-left border transition-all relative overflow-hidden ${
                    isSelected
                      ? item.activeColor
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-base">{item.label}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0 animate-bounce-short" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-300 mb-2">{item.desc}</p>
                  <p className="text-[11px] text-slate-400 leading-tight border-t border-slate-800/60 pt-2 flex items-start gap-1">
                    <Info className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                    {item.justification}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Driver 2: Stress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              Driver 2: Stress Level (Perceived Pressure &amp; Urgency)
            </label>
            <span className="text-[11px] font-mono text-amber-400">Selected: {selectedStress}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {STRESS_OPTIONS.map((item) => {
              const isSelected = selectedStress === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    handleSelect(selectedFatigue, item.id, selectedSleep, selectedTask)
                  }
                  className={`p-4 rounded-xl text-left border transition-all relative overflow-hidden ${
                    isSelected
                      ? item.activeColor
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-base">{item.label}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 animate-bounce-short" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-300 mb-2">{item.desc}</p>
                  <p className="text-[11px] text-slate-400 leading-tight border-t border-slate-800/60 pt-2 flex items-start gap-1">
                    <Info className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    {item.justification}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Driver 3: Sleep Quality */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Moon className="w-4 h-4 text-purple-400" />
              Driver 3: Sleep Quality (Restorative Sleep Deficit)
            </label>
            <span className="text-[11px] font-mono text-purple-400">Selected: {selectedSleep}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SLEEP_OPTIONS.map((item) => {
              const isSelected = selectedSleep === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    handleSelect(selectedFatigue, selectedStress, item.id, selectedTask)
                  }
                  className={`p-4 rounded-xl text-left border transition-all relative overflow-hidden ${
                    isSelected
                      ? item.activeColor
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-base">{item.label}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-purple-400 shrink-0 animate-bounce-short" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-300 mb-2">{item.desc}</p>
                  <p className="text-[11px] text-slate-400 leading-tight border-t border-slate-800/60 pt-2 flex items-start gap-1">
                    <Info className="w-3 h-3 text-purple-400 shrink-0 mt-0.5" />
                    {item.justification}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Driver 4: Task Complexity */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-emerald-400" />
              Driver 4: Task Complexity (External Working Memory Demand)
            </label>
            <span className="text-[11px] font-mono text-emerald-400">Selected: {selectedTask}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {TASK_OPTIONS.map((item) => {
              const isSelected = selectedTask === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    handleSelect(selectedFatigue, selectedStress, selectedSleep, item.id)
                  }
                  className={`p-4 rounded-xl text-left border transition-all relative overflow-hidden ${
                    isSelected
                      ? item.activeColor
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-base">{item.label}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce-short" />
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-300 mb-2">{item.desc}</p>
                  <p className="text-[11px] text-slate-400 leading-tight border-t border-slate-800/60 pt-2 flex items-start gap-1">
                    <Info className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    {item.justification}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Continuous Numeric Sliders Toggle */}
        <div className="pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={() => setUseNumericOverride(!useNumericOverride)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 font-bold transition-colors mb-3"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            {useNumericOverride
              ? '← Switch back to Pure Linguistic Words Mode'
              : '⚡ Toggle Continuous Numeric Membership Sliders (0 - 100)'}
          </button>

          {useNumericOverride && (
            <div className="p-4 bg-slate-900/90 rounded-xl border border-cyan-500/40 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn shadow-inner">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-200 font-bold">Fatigue:</span>
                  <span className="text-cyan-400 font-mono font-bold">{fatigueNum} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={fatigueNum}
                  onChange={(e) =>
                    handleSliderChange(
                      Number(e.target.value),
                      stressNum,
                      sleepNum,
                      taskNum
                    )
                  }
                  className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-200 font-bold">Stress:</span>
                  <span className="text-amber-400 font-mono font-bold">{stressNum} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={stressNum}
                  onChange={(e) =>
                    handleSliderChange(
                      fatigueNum,
                      Number(e.target.value),
                      sleepNum,
                      taskNum
                    )
                  }
                  className="w-full accent-amber-400 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-200 font-bold">Sleep Deficit:</span>
                  <span className="text-purple-400 font-mono font-bold">{sleepNum} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sleepNum}
                  onChange={(e) =>
                    handleSliderChange(
                      fatigueNum,
                      stressNum,
                      Number(e.target.value),
                      taskNum
                    )
                  }
                  className="w-full accent-purple-400 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-200 font-bold">Task Demand:</span>
                  <span className="text-emerald-400 font-mono font-bold">{taskNum} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={taskNum}
                  onChange={(e) =>
                    handleSliderChange(
                      fatigueNum,
                      stressNum,
                      sleepNum,
                      Number(e.target.value)
                    )
                  }
                  className="w-full accent-emerald-400 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
