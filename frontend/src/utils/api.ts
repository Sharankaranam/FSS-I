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
