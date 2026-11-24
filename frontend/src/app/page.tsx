'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { SidebarNav, TabType } from '../components/SidebarNav';
import { CheckInPanel } from '../components/CheckInPanel';
import { ScorePanel } from '../components/ScorePanel';
import { TaskBoard, splitTasks } from '../components/TaskBoard';
import { FOUVisualizer } from '../components/FOUVisualizer';
import { AcademicInspector } from '../components/AcademicInspector';
import { LiveWellDatabaseViewer } from '../components/LiveWellDatabaseViewer';
import { evaluateLoad, EvaluateLoadResponse } from '../utils/api';

type Numeric = { fatigue_num?: number; stress_num?: number; sleep_num?: number; task_num?: number };

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Home() {
  const [tab, setTab] = useState<TabType>('today');
  const [fatigueState, setFatigueState] = useState('Drained');
  const [stressState, setStressState] = useState('Pressured');
  const [sleepState, setSleepState] = useState('Restless');
  const [taskState, setTaskState] = useState('Challenging');
  const [apiData, setApiData] = useState<EvaluateLoadResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hello, setHello] = useState('Hello');
  const [dateLabel, setDateLabel] = useState('Today');
  const reqId = useRef(0);

  const fetchLoadEvaluation = async (
    fatigue: string,
    stress: string,
    sleep: string,
    task: string,
    numeric?: Numeric
  ) => {
    const id = ++reqId.current;
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
      if (id !== reqId.current) return; // a newer request superseded this one
      setApiData(data);
      setFatigueState(fatigue);
      setStressState(stress);
      setSleepState(sleep);
      setTaskState(task);
    } catch (err: any) {
      if (id !== reqId.current) return;
      setError(err.message || 'Failed to reach the backend.');
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  };

  useEffect(() => {
    setHello(greeting());
    setDateLabel(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));
    fetchLoadEvaluation('Drained', 'Pressured', 'Restless', 'Challenging');
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab]);

  const score = apiData?.cognitive_load_score ?? null;
  const { deferred } = splitTasks(score);
  const online = error ? false : apiData ? true : null;

  return (
    <div className="lg:flex min-h-screen">
      <SidebarNav
        activeTab={tab}
        setActiveTab={setTab}
        deferredCount={deferred.length}
        score={score}
        online={online}
      />

      <main className="flex-1 min-w-0">
        <div className="max-w-[1120px] mx-auto px-4 sm:px-8 py-6 sm:py-10">
          {error && (
            <div
              role="alert"
              className="mb-6 card border-danger/30 bg-danger/5 p-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-danger shrink-0 mt-0.5" />
                <div className="text-[13.5px]">
                  <div className="font-medium">Can&apos;t reach the inference engine</div>
                  <div className="text-muted mt-0.5">
                    {error} Start the FastAPI backend on <span className="font-mono">localhost:8000</span>, then retry.
                  </div>
                </div>
              </div>
              <button
                onClick={() => fetchLoadEvaluation(fatigueState, stressState, sleepState, taskState)}
                className="btn border border-line bg-surface hover:bg-sunken shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Retry
              </button>
            </div>
          )}

          {tab === 'today' && (
            <div className="space-y-6 animate-rise">
              <div>
                <div className="eyebrow mb-1">
                  {dateLabel}
                </div>
                <h1 className="font-display text-[34px] sm:text-[40px] leading-[1.05] tracking-tight">
                  {hello}. Let&apos;s size today to you.
                </h1>
                <p className="text-[14.5px] text-muted mt-2 max-w-2xl">
                  Describe how you feel in plain words. Interval type-2 fuzzy logic turns them into a load score and
                  reshapes your plan so heavy work lands when you can handle it.
                </p>
              </div>

              <div className="grid xl:grid-cols-[1fr_360px] gap-6 items-start">
                <CheckInPanel
                  onEvaluate={fetchLoadEvaluation}
                  loading={loading}
                  currentFatigue={fatigueState}
                  currentStress={stressState}
                  currentSleep={sleepState}
                  currentTask={taskState}
                />
                <div className="space-y-4 xl:sticky xl:top-10">
                  <ScorePanel apiData={apiData} loading={loading} />
                  {apiData && (
                    <button
                      onClick={() => setTab('inference')}
                      className="w-full text-left text-[13px] text-muted hover:text-ink px-1"
                    >
                      See how this score was computed →
                    </button>
                  )}
                </div>
              </div>

              <TaskBoard cognitiveLoadScore={score} recommendedAction={apiData?.recommended_action ?? null} />
            </div>
          )}

          {tab === 'inference' && (
            <div className="animate-rise">
              <FOUVisualizer apiData={apiData} />
            </div>
          )}
          {tab === 'method' && (
            <div className="animate-rise">
              <AcademicInspector />
            </div>
          )}
          {tab === 'library' && (
            <div className="animate-rise">
              <LiveWellDatabaseViewer />
            </div>
          )}

          <footer className="mt-16 pt-6 border-t border-line text-[12px] text-faint flex flex-col sm:flex-row justify-between gap-2">
            <span>Fuzzy Sprint Shield · Computing with Words, IT2 fuzzy inference, Karnik-Mendel type-reduction</span>
            <span>Decision support only, not medical advice.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
