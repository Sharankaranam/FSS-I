'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { EvaluateLoadResponse } from '../utils/api';
import { explainScore } from '../utils/plan';
import {
  CRITICAL_THRESHOLD,
  MODERATE_THRESHOLD,
  scoreLabel,
  scoreTone,
  toneBg,
  toneText,
} from './ui';

interface ScorePanelProps {
  apiData: EvaluateLoadResponse | null;
  loading: boolean;
}

const ACTION_TEXT: Record<string, string> = {
  defer_deep_work: 'Protect your energy: deep-work tasks are deferred to tomorrow. Keep today to routine, low-demand work.',
  limit_deep_work: 'Pace yourself: keep one short deep-work block today and move the rest to tomorrow.',
  normal_schedule: 'You have capacity today. Keep the full schedule, deep work included.',
};

const pct = (v: number) => `${Math.max(0, Math.min(100, v))}%`;

export const ScorePanel: React.FC<ScorePanelProps> = ({ apiData, loading }) => {
  const score = apiData?.cognitive_load_score ?? null;
  const tone = scoreTone(score);

  return (
    <section className="card p-5 sm:p-6" aria-labelledby="score-heading" aria-busy={loading}>
      <div className="flex items-center justify-between gap-3">
        <h2 id="score-heading" className="text-sm font-medium text-muted-foreground">
          Your load right now
        </h2>
        {loading && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground" role="status">
            <Loader2 className="size-3.5 animate-spin" /> Updating
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mt-3" aria-live="polite">
        <span
          className={`font-display num text-[60px] leading-none tracking-[-0.03em] transition-colors duration-300 ${
            score === null ? 'text-faint' : toneText[tone]
          }`}
        >
          {score === null ? '–' : score.toFixed(1)}
        </span>
        <span className="text-sm text-muted-foreground">
          / 100 · {score === null ? 'no reading yet' : scoreLabel(score).toLowerCase()}
        </span>
      </div>

      {/* Scale: zones, the centroid interval [yl, yr] and the crisp score */}
      <div className="mt-6" aria-hidden>
        <div className="relative h-2 rounded-full overflow-hidden flex">
          <div className="bg-ok/25" style={{ width: pct(MODERATE_THRESHOLD) }} />
          <div className="bg-warn/25" style={{ width: pct(CRITICAL_THRESHOLD - MODERATE_THRESHOLD) }} />
          <div className="bg-danger/25 flex-1" />
          {apiData && (
            <div
              className="absolute inset-y-0 bg-foreground/30 transition-[left,width] duration-500 ease-out-expo"
              style={{ left: pct(apiData.y_left), width: pct(apiData.y_right - apiData.y_left) }}
            />
          )}
        </div>
        <div className="relative h-0">
          {score !== null && (
            <div
              className="absolute -top-[13px] -translate-x-1/2 transition-[left] duration-500 ease-out-expo"
              style={{ left: pct(score) }}
            >
              <div className={`w-[3px] h-4 rounded-full ${toneBg[tone]} ring-2 ring-card`} />
            </div>
          )}
        </div>
        <div className="relative mt-2 h-4 text-xs text-muted-foreground num">
          {[0, MODERATE_THRESHOLD, CRITICAL_THRESHOLD, 100].map((t) => (
            <span
              key={t}
              className="absolute -translate-x-1/2 first:translate-x-0 last:-translate-x-full"
              style={{ left: pct(t) }}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {apiData && <Why data={apiData} />}

      {apiData?.recommended_action && (
        <p className="mt-3 text-sm font-medium">
          {ACTION_TEXT[apiData.recommended_action] ?? apiData.recommended_action.replace(/_/g, ' ')}
        </p>
      )}

      {apiData && (
        <dl className="mt-5 pt-4 border-t grid grid-cols-3 gap-4">
          <Stat label="Range" value={`${apiData.y_left.toFixed(0)}–${apiData.y_right.toFixed(0)}`} />
          <Stat label="KM iterations" value={String(apiData.km_iterations)} />
          <Stat label="Rules fired" value={`${apiData.triggered_rules_count} of ${apiData.rule_firings.length}`} />
        </dl>
      )}
    </section>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="num text-[15px] font-medium mt-0.5">{value}</dd>
  </div>
);

const Why = ({ data }: { data: EvaluateLoadResponse }) => {
  const { reason, certainty } = explainScore(data);
  return (
    <div className="mt-5 space-y-1">
      <p className="text-sm leading-relaxed">{reason}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{certainty}</p>
    </div>
  );
};
