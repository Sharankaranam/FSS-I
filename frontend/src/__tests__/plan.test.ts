import { describe, expect, it } from 'vitest';
import { explainScore, planMode, splitTasks } from '../utils/plan';
import { evaluation, task } from './fixtures';

describe('planMode', () => {
  it('maps scores to bands', () => {
    expect(planMode(null)).toBe('unknown');
    expect(planMode(20)).toBe('full');
    expect(planMode(35)).toBe('full');
    expect(planMode(50)).toBe('limited');
    expect(planMode(65)).toBe('limited');
    expect(planMode(65.1)).toBe('shielded');
  });
});

describe('splitTasks', () => {
  const longHigh = task({ title: 'Long deep work', load_type: 'High', estimated_mins: 120 });
  const shortHigh = task({ title: 'Short deep work', load_type: 'High', estimated_mins: 45 });
  const low = task({ title: 'Email', load_type: 'Low', estimated_mins: 15 });
  const doneHigh = task({ title: 'Finished design', load_type: 'High', done: true });
  const all = [longHigh, shortHigh, low, doneHigh];

  it('keeps everything today when load is low', () => {
    const r = splitTasks(all, 20);
    expect(r.deferred).toEqual([]);
    expect(r.today).toHaveLength(4);
  });

  it('keeps only the shortest open deep-work task in the moderate band', () => {
    const r = splitTasks(all, 50);
    expect(r.deferred.map((t) => t.title)).toEqual(['Long deep work']);
    expect(r.open.map((t) => t.title)).toEqual(['Short deep work', 'Email']);
  });

  it('defers every open deep-work task when load is critical', () => {
    const r = splitTasks(all, 80);
    expect(r.deferred.map((t) => t.title)).toEqual(['Long deep work', 'Short deep work']);
  });

  it('never defers completed tasks and lists them after open ones', () => {
    const r = splitTasks(all, 80);
    expect(r.today[r.today.length - 1].title).toBe('Finished design');
    expect(r.deferred).not.toContain(doneHigh);
  });
});

describe('explainScore', () => {
  it('names the user’s states from the dominant rules, in plain words', () => {
    const { reason } = explainScore(evaluation());
    expect(reason).toBe(
      "Mostly because you're drained, under pressure, short on sleep and facing challenging work, which points to critical load."
    );
  });

  it('describes how wide the centroid interval is', () => {
    expect(explainScore(evaluation({ y_left: 60, y_right: 64 })).certainty).toMatch(/confident/);
    expect(explainScore(evaluation({ y_left: 50, y_right: 70 })).certainty).toMatch(/Some uncertainty/);
    expect(explainScore(evaluation({ y_left: 49, y_right: 90 })).certainty).toMatch(/Wide uncertainty.*49–90/);
  });

  it('only mentions the states the user actually picked for OR rules', () => {
    const data = evaluation({
      sleep_state: 'Deprived',
      rule_firings: [
        {
          ...evaluation().rule_firings[0],
          rule_text: 'IF Sleep is Deprived OR (Task is Intense AND Fatigue is Drained) THEN Load is Critical',
        },
      ],
    });
    expect(explainScore(data).reason).toContain('sleep-deprived');
    expect(explainScore(data).reason).not.toContain('intense');
  });
});
