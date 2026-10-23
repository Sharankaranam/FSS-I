'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { StateSelectorModal } from '../components/StateSelectorModal';
import { TaskBoard } from '../components/TaskBoard';
import { FOUVisualizer } from '../components/FOUVisualizer';
import { AcademicInspector } from '../components/AcademicInspector';
import { LiveWellDatabaseViewer } from '../components/LiveWellDatabaseViewer';
import { evaluateLoad, EvaluateLoadResponse } from '../utils/api';
import { AlertCircle, RefreshCw, BookOpen, Layers, Sparkles } from 'lucide-react';

export default function Home() {
  const [fatigueState, setFatigueState] = useState<string>('Drained');
  const [stressState, setStressState] = useState<string>('Pressured');
  const [sleepState, setSleepState] = useState<string>('Restless');
  const [taskState, setTaskState] = useState<string>('Challenging');
  const [apiData, setApiData] = useState<EvaluateLoadResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLoadEvaluation = async (
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
  ) => {
    setLoading(true);
    setError(null);
    try {
      const data = await evaluateLoad({
        user_id: 'u_12345',
        fatigue_state: fatigue,
        stress_state: stress,
        sleep_state: sleep,
        task_complexity_state: task,
        fatigue_numeric: numeric?.fatigue_num,
        stress_numeric: numeric?.stress_num,
        sleep_numeric: numeric?.sleep_num,
        task_complexity_numeric: numeric?.task_num,
      });
      setApiData(data);
      setFatigueState(fatigue);
      setStressState(stress);
      setSleepState(sleep);
      setTaskState(task);
    } catch (err: any) {
      setError(
        err.message ||
          'Failed to connect to FastAPI Backend. Ensure FastAPI backend is running at http://localhost:8000.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoadEvaluation('Drained', 'Pressured', 'Restless', 'Challenging');
  }, []);

  const score = apiData?.cognitive_load_score ?? null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-16 selection:bg-teal-500 selection:text-white">
      {/* Brand Header */}
      <Header
        score={score}
        kmIterations={apiData?.km_iterations ?? null}
        recommendedAction={apiData?.recommended_action ?? null}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center justify-between gap-4 shadow-lg shadow-rose-500/5">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="text-xs">
                <strong>Backend Communication Error:</strong> {error}
              </div>
            </div>
            <button
              onClick={() =>
                fetchLoadEvaluation(fatigueState, stressState, sleepState, taskState)
              }
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-rose-500/30 shrink-0 transition-all"
            >
              <RefreshCw className="w-3 h-3 animate-spin-hover" />
              Retry Connection
            </button>
          </div>
        )}

        {/* 1. SECTION 1: Vibrant 4-Driver Behavioral Input Selection */}
        <section>
          <StateSelectorModal
            onEvaluate={(fatigue, stress, sleep, task, numeric) =>
              fetchLoadEvaluation(fatigue, stress, sleep, task, numeric)
            }
            loading={loading}
            currentFatigue={fatigueState}
            currentStress={stressState}
            currentSleep={sleepState}
            currentTask={taskState}
          />
        </section>

        {/* 2. SECTION 2: Dynamic Task Reprioritization Kanban Board */}
        <section>
          <TaskBoard
            cognitiveLoadScore={score}
            recommendedAction={apiData?.recommended_action ?? null}
          />
        </section>

        {/* 3. SECTION 3: IT2 Footprint of Uncertainty (FOU) & Karnik-Mendel Visualizer */}
        <section>
          <FOUVisualizer apiData={apiData} />
        </section>

        {/* 4. SECTION 4: Academic Rationale & Psychometric Foundations */}
        <section>
          <AcademicInspector />
        </section>

        {/* 5. SECTION 5: Dr. Murthy Gokula LiveWell Clinical Knowledge Base & Quizzes */}
        <section>
          <LiveWellDatabaseViewer />
        </section>

        {/* Academic Context Footer */}
        <footer className="w-full glass-panel rounded-2xl p-6 border border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-4 mt-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <div className="font-semibold text-slate-200">
                Master of Science in Computer Science Thesis
              </div>
              <div>University of Neuchâtel &bull; LiveWell Ecosystem Research</div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              4-Driver Karnik-Mendel (KM) IT2 Engine
            </span>
            <span>&bull;</span>
            <span>React (Next.js) + Tailwind CSS</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
