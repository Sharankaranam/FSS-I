'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Checkin,
  createProfile,
  createTask,
  deleteTask,
  EvaluateLoadResponse,
  getProfile,
  listCheckins,
  listProfiles,
  listTasks,
  NotFoundError,
  PlannerTask,
  Profile,
  recordCheckin,
  renameProfile,
  updateTask,
} from './api';

const STORAGE_KEY = 'fss-profile';

function readStoredId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}
function storeId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {}
}

/** Owns the active profile plus its tasks and check-in history. */
export function usePlanner() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const checkinTimer = useRef<ReturnType<typeof setTimeout>>();

  const loadProfileData = useCallback(async (p: Profile) => {
    setTasksLoading(true);
    try {
      const [t, c] = await Promise.all([listTasks(p.id), listCheckins(p.id)]);
      setTasks(t);
      setCheckins(c);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const activate = useCallback(
    async (p: Profile) => {
      setProfile(p);
      storeId(p.id);
      await loadProfileData(p);
    },
    [loadProfileData]
  );

  // Resolve the profile on first load: stored id → first existing → create one.
  const init = useCallback(async () => {
    setError(null);
    try {
      const all = await listProfiles();
      const stored = readStoredId();
      let p: Profile | undefined;
      if (stored) {
        p = all.find((x) => x.id === stored) ?? (await getProfile(stored).catch(() => undefined));
      }
      if (!p) p = all[0];
      if (!p) p = await createProfile('You');
      setProfiles(all.some((x) => x.id === p!.id) ? all : [...all, p]);
      await activate(p);
    } catch (e: any) {
      setTasksLoading(false);
      setError(e.message || 'Could not load your planner.');
    }
  }, [activate]);

  useEffect(() => {
    init();
    return () => clearTimeout(checkinTimer.current);
  }, [init]);

  const switchProfile = useCallback(
    async (id: string) => {
      const p = profiles.find((x) => x.id === id);
      if (p) await activate(p);
    },
    [profiles, activate]
  );

  const newProfile = useCallback(
    async (name: string) => {
      const p = await createProfile(name);
      setProfiles((ps) => [...ps, p]);
      await activate(p);
    },
    [activate]
  );

  const rename = useCallback(
    async (name: string) => {
      if (!profile) return;
      const p = await renameProfile(profile.id, name);
      setProfile(p);
      setProfiles((ps) => ps.map((x) => (x.id === p.id ? p : x)));
    },
    [profile]
  );

  // ---- tasks (optimistic where it is safe) ----
  const handleMissingProfile = useCallback(
    (e: unknown) => {
      if (e instanceof NotFoundError) init();
      throw e;
    },
    [init]
  );

  const addTask = useCallback(
    async (draft: Parameters<typeof createTask>[1]) => {
      if (!profile) return;
      const t = await createTask(profile.id, draft).catch(handleMissingProfile);
      setTasks((ts) => [...ts, t]);
    },
    [profile, handleMissingProfile]
  );

  const editTask = useCallback(
    async (id: number, patch: Partial<PlannerTask>) => {
      if (!profile) return;
      const prev = tasks;
      setTasks((ts) => ts.map((t) => (t.id === id ? { ...t, ...patch } : t)));
      try {
        const t = await updateTask(profile.id, id, patch);
        setTasks((ts) => ts.map((x) => (x.id === id ? t : x)));
      } catch (e) {
        setTasks(prev);
        handleMissingProfile(e);
      }
    },
    [profile, tasks, handleMissingProfile]
  );

  const removeTask = useCallback(
    async (id: number) => {
      if (!profile) return;
      const prev = tasks;
      setTasks((ts) => ts.filter((t) => t.id !== id));
      try {
        await deleteTask(profile.id, id);
      } catch (e) {
        setTasks(prev);
        handleMissingProfile(e);
      }
    },
    [profile, tasks, handleMissingProfile]
  );

  /** Saves a check-in shortly after the inputs settle; the server merges ones within 10 minutes. */
  const scheduleCheckin = useCallback(
    (data: EvaluateLoadResponse) => {
      if (!profile) return;
      clearTimeout(checkinTimer.current);
      const pid = profile.id;
      checkinTimer.current = setTimeout(async () => {
        try {
          await recordCheckin(pid, {
            fatigue_state: data.fatigue_state,
            stress_state: data.stress_state,
            sleep_state: data.sleep_state,
            task_complexity_state: data.task_complexity_state,
            score: data.cognitive_load_score,
            y_left: data.y_left,
            y_right: data.y_right,
          });
          setCheckins(await listCheckins(pid));
        } catch {
          /* history is best-effort; the score itself is already shown */
        }
      }, 1500);
    },
    [profile]
  );

  return {
    profile,
    profiles,
    tasks,
    checkins,
    tasksLoading,
    error,
    retry: init,
    switchProfile,
    newProfile,
    rename,
    addTask,
    editTask,
    removeTask,
    scheduleCheckin,
  };
}
