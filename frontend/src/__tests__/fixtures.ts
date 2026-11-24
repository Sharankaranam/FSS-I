import type { EvaluateLoadResponse, PlannerTask, RuleFiringDetail } from '../utils/api';

let nextId = 1;
export function task(partial: Partial<PlannerTask> = {}): PlannerTask {
  return {
    id: nextId++,
    user_id: 'u1',
    title: 'Task',
    category: 'General',
    load_type: 'Moderate',
    estimated_mins: 30,
    done: false,
    created_at: '2026-11-24T08:00:00Z',
    ...partial,
  };
}

export function rule(partial: Partial<RuleFiringDetail>): RuleFiringDetail {
  return {
    rule_id: 1,
    rule_text: '',
    justification: '',
    consequent: 'Low',
    operator: 'AND',
    f_lower: 0,
    f_upper: 0,
    is_triggered: false,
    is_top_rule: false,
    ...partial,
  };
}

export function evaluation(partial: Partial<EvaluateLoadResponse> = {}): EvaluateLoadResponse {
  return {
    user_id: 'u1',
    fatigue_state: 'Drained',
    stress_state: 'Pressured',
    sleep_state: 'Restless',
    task_complexity_state: 'Challenging',
    cognitive_load_score: 69.5,
    recommended_action: 'defer_deep_work',
    km_iterations: 4,
    km_iterations_left: 3,
    km_iterations_right: 4,
    y_left: 49.1,
    y_right: 90.0,
    top_rule_ids: [7, 10],
    triggered_rules_count: 12,
    rule_firings: [
      rule({
        rule_id: 7,
        rule_text: 'IF Fatigue is Drained AND Stress is Pressured THEN Load is Critical',
        consequent: 'Critical',
        f_lower: 1,
        f_upper: 1,
        is_triggered: true,
        is_top_rule: true,
      }),
      rule({
        rule_id: 10,
        rule_text: 'IF Fatigue is Drained AND Sleep is Restless AND Task is Challenging THEN Load is Critical',
        consequent: 'Critical',
        f_lower: 1,
        f_upper: 1,
        is_triggered: true,
        is_top_rule: true,
      }),
    ],
    fou_curves: { domain: [0, 100], aggregated_umf: [0, 1], aggregated_lmf: [0, 1] },
    ...partial,
  };
}
