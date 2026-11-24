'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { SidebarNav, TabType } from '../components/SidebarNav';
import { CheckInPanel } from '../components/CheckInPanel';
import { ScorePanel } from '../components/ScorePanel';
import { TaskBoard } from '../components/TaskBoard';
import { TrendCard } from '../components/TrendCard';
import { ProfileSwitcher } from '../components/ProfileSwitcher';
import { FOUVisualizer } from '../components/FOUVisualizer';
import { AcademicInspector } from '../components/AcademicInspector';
import { LiveWellDatabaseViewer } from '../components/LiveWellDatabaseViewer';
import { evaluateLoad, EvaluateLoadResponse } from '../utils/api';
import { splitTasks } from '../utils/plan';
import { usePlanner } from '../utils/usePlanner';

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
  const [panelKey, setPanelKey] = useState(0);
  const reqId = useRef(0);
  const restored = useRef(false);
  const planner = usePlanner();

  const fetchLoadEvaluation = async (
    fatigue: string,
    stress: string,
    sleep: string,
    task: string,
    numeric?: Numeric,
    record = true
  ) => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const data = await evaluateLoad({
        user_id: planner.profile?.id ?? 'guest',
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
      if (record) planner.scheduleCheckin(data);
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
    fetchLoadEvaluation('Drained', 'Pressured', 'Restless', 'Challenging', undefined, false);
  }, []);

  // Start from today's latest check-in, if there is one (once per profile).
  useEffect(() => {
    if (!planner.profile || planner.tasksLoading || restored.current) return;
    restored.current = true;
    const last = planner.checkins[planner.checkins.length - 1];
    if (last && new Date(last.created_at).toDateString() === new Date().toDateString()) {
      fetchLoadEvaluation(last.fatigue_state, last.stress_state, last.sleep_state, last.task_complexity_state, undefined, false).then(
        () => setPanelKey((k) => k + 1)
      );
    }
  }, [planner.profile, planner.tasksLoading, planner.checkins]);

  useEffect(() => {
    restored.current = false;
  }, [planner.profile?.id]);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [tab]);

  const score = apiData?.cognitive_load_score ?? null;
  const { deferred } = splitTasks(planner.tasks, score);
  const online = error ? false : apiData ? true : null;

  return (
    <div className="lg:flex min-h-screen">
      <SidebarNav
        activeTab={tab}
        setActiveTab={setTab}
        deferredCount={deferred.length}
        score={score}
        online={online}
        profileControl={(compact) => (
          <ProfileSwitcher
            compact={compact}
            profile={planner.profile}
            profiles={planner.profiles}
            onSwitch={planner.switchProfile}
            onCreate={planner.newProfile}
            onRename={planner.rename}
          />
        )}
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
                <div className="text-sm">
                  <div className="font-medium">Can&apos;t reach the inference engine</div>
                  <div className="text-muted-foreground mt-0.5">
                    {error} Start the FastAPI backend on localhost:8000, then retry.
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="shrink-0"
                onClick={() => fetchLoadEvaluation(fatigueState, stressState, sleepState, taskState)}
              >
                <RefreshCw className={loading ? 'animate-spin' : ''} /> Retry connection
              </Button>
            </div>
          )}

          {tab === 'today' && (
            <div className="space-y-6">
              <div className="pb-2">
                <h1 className="font-display text-[34px] sm:text-[42px] leading-[1.05] tracking-[-0.025em]">
                  {hello}. Let&apos;s size today to you.
                </h1>
                <p className="text-[15px] text-muted-foreground mt-3 max-w-[65ch]">
                  {dateLabel}. Describe how you feel in plain words; the engine turns them into a load score and moves
                  heavy work to when you can handle it.
                </p>
              </div>

              <div className="grid xl:grid-cols-[1fr_360px] gap-6 items-start">
                <CheckInPanel
                  key={`${planner.profile?.id ?? 'none'}-${panelKey}`}
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
                    <Button variant="link" className="px-1 h-auto text-muted-foreground hover:text-foreground" onClick={() => setTab('inference')}>
                      See how this score was computed <ArrowRight />
                    </Button>
                  )}
                  <TrendCard checkins={planner.checkins} />
                </div>
              </div>

              {planner.error && (
                <div className="card p-4 flex items-center justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">Your tasks and history couldn&apos;t be loaded: {planner.error}</span>
                  <Button variant="outline" size="sm" className="shrink-0" onClick={planner.retry}>
                    <RefreshCw /> Retry
                  </Button>
                </div>
              )}

              <TaskBoard
                tasks={planner.tasks}
                loading={planner.tasksLoading}
                cognitiveLoadScore={score}
                onAdd={planner.addTask}
                onUpdate={planner.editTask}
                onDelete={planner.removeTask}
              />
            </div>
          )}

          {tab === 'inference' && (
            <div>
              <FOUVisualizer apiData={apiData} />
            </div>
          )}
          {tab === 'method' && (
            <div>
              <AcademicInspector />
            </div>
          )}
          {tab === 'library' && (
            <div>
              <LiveWellDatabaseViewer userId={planner.profile?.id ?? 'guest'} />
            </div>
          )}

          <footer className="mt-16 pt-6 border-t text-xs text-muted-foreground flex flex-col sm:flex-row justify-between gap-2">
            <span>Fuzzy Sprint Shield · Computing with Words, IT2 fuzzy inference, Karnik-Mendel type-reduction</span>
            <span>Decision support only, not medical advice.</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
