export interface EvaluateLoadRequest {
  user_id?: string;
  fatigue_state: string;
  stress_state: string;
  sleep_state?: string;
  task_complexity_state?: string;
  fatigue_numeric?: number;
  stress_numeric?: number;
  sleep_numeric?: number;
  task_complexity_numeric?: number;
}

export interface RuleFiringDetail {
  rule_id: number;
  rule_text: string;
  justification: string;
  consequent: string;
  operator: string;
  f_lower: number;
  f_upper: number;
  is_triggered: boolean;
  is_top_rule: boolean;
}

export interface FOUCurves {
  domain: number[];
  aggregated_umf: number[];
  aggregated_lmf: number[];
}

export interface EvaluateLoadResponse {
  user_id: string;
  fatigue_state: string;
  stress_state: string;
  sleep_state: string;
  task_complexity_state: string;
  cognitive_load_score: number;
  recommended_action: string;
  km_iterations: number;
  km_iterations_left: number;
  km_iterations_right: number;
  y_left: number;
  y_right: number;
  top_rule_ids: number[];
  triggered_rules_count: number;
  rule_firings: RuleFiringDetail[];
  fou_curves: FOUCurves;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function evaluateLoad(
  payload: EvaluateLoadRequest
): Promise<EvaluateLoadResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/evaluate_load`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: payload.user_id || 'u_12345',
      fatigue_state: payload.fatigue_state,
      stress_state: payload.stress_state,
      sleep_state: payload.sleep_state || 'Restless',
      task_complexity_state: payload.task_complexity_state || 'Challenging',
      fatigue_numeric: payload.fatigue_numeric,
      stress_numeric: payload.stress_numeric,
      sleep_numeric: payload.sleep_numeric,
      task_complexity_numeric: payload.task_complexity_numeric,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Server returned error status ${response.status}`
    );
  }

  return response.json();
}

// LiveWell Clinical Database Interfaces
export interface LiveWellHabit {
  id: number;
  habit_number: number;
  superhero_name: string;
  domain: string;
  tagline: string;
  description: string;
  superpower_check_questions: string;
  morning_routine?: string;
  meal_guidance?: string;
  evening_wind_down?: string;
  synergistic_helpers?: string;
}

export interface LiveWellQuizQuestion {
  id: number;
  question_number: number;
  question_text: string;
  points_weight: number;
  options: Array<{ label: string; points: number }>;
  category: string;
}

export interface LiveWellScoringRule {
  risk_level: string;
  min_score: number;
  max_score: number;
  label: string;
  clinical_interpretation: string;
  recommended_actions: string;
}

export interface LiveWellQuizDetail {
  id: number;
  quiz_code: string;
  title: string;
  chapter_source: string;
  target_condition: string;
  instructions: string;
  scoring_scale_type: string;
  max_possible_score: number;
  questions: LiveWellQuizQuestion[];
  scoring_rules: LiveWellScoringRule[];
}

export interface LiveWellQuizEvaluationResult {
  assessment_id: number;
  user_id: string;
  quiz_code: string;
  quiz_title: string;
  total_score: number;
  max_possible_score: number;
  risk_level: string;
  label: string;
  clinical_interpretation: string;
  recommended_actions: string;
  detailed_answers: Array<{
    question_id: number;
    question_number: number;
    question_text: string;
    category: string;
    answer_value: string;
    points_awarded: number;
  }>;
}

export async function fetchLiveWellOverview(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/v1/livewell/overview`);
  if (!res.ok) throw new Error('Failed to load LiveWell overview');
  return res.json();
}

export async function fetchLiveWellHabits(): Promise<LiveWellHabit[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/livewell/habits`);
  if (!res.ok) throw new Error('Failed to load LiveWell habits');
  return res.json();
}

export async function fetchLiveWellQuizzes(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/livewell/quizzes`);
  if (!res.ok) throw new Error('Failed to load LiveWell quizzes');
  return res.json();
}

export async function fetchLiveWellQuiz(quizCode: string): Promise<LiveWellQuizDetail> {
  const res = await fetch(`${API_BASE_URL}/api/v1/livewell/quizzes/${quizCode}`);
  if (!res.ok) throw new Error(`Failed to load quiz ${quizCode}`);
  return res.json();
}

export async function evaluateLiveWellQuiz(
  quizCode: string,
  answers: Record<string, any>,
  userId: string = 'guest'
): Promise<LiveWellQuizEvaluationResult> {
  const res = await fetch(`${API_BASE_URL}/api/v1/livewell/quizzes/${quizCode}/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, answers }),
  });
  if (!res.ok) throw new Error('Failed to evaluate quiz');
  return res.json();
}

export async function fetchLiveWellMicrohabits(driverName?: string): Promise<any[]> {
  const url = driverName
    ? `${API_BASE_URL}/api/v1/livewell/microhabits?driver_name=${encodeURIComponent(driverName)}`
    : `${API_BASE_URL}/api/v1/livewell/microhabits`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to load microhabits');
  return res.json();
}

export async function fetchLiveWellSupplements(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/livewell/supplements`);
  if (!res.ok) throw new Error('Failed to load supplements');
  return res.json();
}

export async function fetchLiveWellLabs(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/livewell/labs`);
  if (!res.ok) throw new Error('Failed to load labs');
  return res.json();
}

// ---------------------------------------------------------------------------
// Planner: profiles, tasks, check-in history
// ---------------------------------------------------------------------------
export type LoadType = 'High' | 'Moderate' | 'Low';

export interface Profile {
  id: string;
  name: string;
  created_at: string;
}

export interface PlannerTask {
  id: number;
  user_id: string;
  title: string;
  category: string;
  load_type: LoadType;
  estimated_mins: number;
  done: boolean;
  created_at: string;
}

export interface Checkin {
  id: number;
  user_id: string;
  created_at: string;
  fatigue_state: string;
  stress_state: string;
  sleep_state: string;
  task_complexity_state: string;
  score: number;
  y_left: number;
  y_right: number;
}

export class NotFoundError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  if (res.status === 404) throw new NotFoundError(`Not found: ${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = typeof body.detail === 'string' ? body.detail : `Request failed (${res.status})`;
    throw new Error(detail);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const listProfiles = () => request<Profile[]>('/api/v1/profiles');
export const getProfile = (id: string) => request<Profile>(`/api/v1/profiles/${id}`);
export const createProfile = (name: string) =>
  request<Profile>('/api/v1/profiles', { method: 'POST', body: JSON.stringify({ name }) });
export const renameProfile = (id: string, name: string) =>
  request<Profile>(`/api/v1/profiles/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) });

export const listTasks = (uid: string) => request<PlannerTask[]>(`/api/v1/users/${uid}/tasks`);
export const createTask = (
  uid: string,
  task: { title: string; category?: string; load_type: LoadType; estimated_mins: number }
) => request<PlannerTask>(`/api/v1/users/${uid}/tasks`, { method: 'POST', body: JSON.stringify(task) });
export const updateTask = (uid: string, id: number, patch: Partial<Omit<PlannerTask, 'id' | 'user_id'>>) =>
  request<PlannerTask>(`/api/v1/users/${uid}/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
export const deleteTask = (uid: string, id: number) =>
  request<void>(`/api/v1/users/${uid}/tasks/${id}`, { method: 'DELETE' });

export const listCheckins = (uid: string, days = 7) =>
  request<Checkin[]>(`/api/v1/users/${uid}/checkins?days=${days}`);
export const recordCheckin = (
  uid: string,
  c: Pick<Checkin, 'fatigue_state' | 'stress_state' | 'sleep_state' | 'task_complexity_state' | 'score' | 'y_left' | 'y_right'>
) => request<Checkin>(`/api/v1/users/${uid}/checkins`, { method: 'POST', body: JSON.stringify(c) });
