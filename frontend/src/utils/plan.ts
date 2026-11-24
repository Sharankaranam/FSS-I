import type { EvaluateLoadResponse, PlannerTask } from './api';

export const CRITICAL_THRESHOLD = 65;
export const MODERATE_THRESHOLD = 35;

export type PlanMode = 'unknown' | 'full' | 'limited' | 'shielded';

export function planMode(score: number | null): PlanMode {
  if (score === null) return 'unknown';
  if (score > CRITICAL_THRESHOLD) return 'shielded';
  if (score > MODERATE_THRESHOLD) return 'limited';
  return 'full';
}

/**
 * Graded reprioritization:
 *  - shielded (> 65): every open deep-work (High) task moves to tomorrow
 *  - limited (35–65): keep the shortest open High task, move the other High tasks
 *  - full (≤ 35) or no score: nothing moves
 * Completed tasks always stay in today's list (after the open ones).
 */
export function splitTasks(tasks: PlannerTask[], score: number | null) {
  const mode = planMode(score);
  const openHigh = tasks.filter((t) => !t.done && t.load_type === 'High');
  let keepHighId: number | null = null;
  if (mode === 'limited' && openHigh.length) {
    keepHighId = [...openHigh].sort((a, b) => a.estimated_mins - b.estimated_mins || a.id - b.id)[0].id;
  }
  const isDeferred = (t: PlannerTask) =>
    !t.done && t.load_type === 'High' && (mode === 'shielded' || (mode === 'limited' && t.id !== keepHighId));

  const deferred = tasks.filter(isDeferred);
  const open = tasks.filter((t) => !t.done && !isDeferred(t));
  const done = tasks.filter((t) => t.done);
  return { mode, today: [...open, ...done], open, done, deferred };
}

const PHRASES: Record<string, string> = {
  Energized: 'energized',
  Drained: 'drained',
  Exhausted: 'exhausted',
  Relaxed: 'relaxed',
  Pressured: 'under pressure',
  Overwhelmed: 'overwhelmed',
  Restful: 'well rested',
  Restless: 'short on sleep',
  Deprived: 'sleep-deprived',
  Routine: 'facing routine work',
  Challenging: 'facing challenging work',
  Intense: 'facing intense work',
};

function joinWords(parts: string[]) {
  if (parts.length <= 1) return parts.join('');
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/** One plain-language sentence explaining the score, built from the dominant rule(s). */
export function explainScore(data: EvaluateLoadResponse): { reason: string; certainty: string } {
  const selected = new Set([data.fatigue_state, data.stress_state, data.sleep_state, data.task_complexity_state]);
  const top = data.rule_firings.filter((r) => r.is_top_rule);
  const termsAll: string[] = [];
  for (const r of top) {
    const antecedent = r.rule_text.split(' THEN ')[0];
    const re = /\b\w+ is (\w+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(antecedent))) termsAll.push(m[1]);
  }
  let terms = Array.from(new Set(termsAll.filter((t) => selected.has(t))));
  if (!terms.length) terms = Array.from(new Set(termsAll));
  const phrases = terms.map((t) => PHRASES[t] ?? t.toLowerCase());

  const consequent = top[0]?.consequent?.toLowerCase();
  const reason = phrases.length
    ? `Mostly because you're ${joinWords(phrases)}${consequent ? `, which points to ${consequent} load` : ''}.`
    : 'No rule fired strongly for this combination.';

  const width = data.y_right - data.y_left;
  const range = `${data.y_left.toFixed(0)}–${data.y_right.toFixed(0)}`;
  const certainty =
    width < 10
      ? `The engine is confident (range ${range}).`
      : width < 30
      ? `Some uncertainty: the true load is likely between ${range}.`
      : `Wide uncertainty: your words overlap neighbouring states, so the load could be anywhere from ${range}.`;

  return { reason, certainty };
}
