'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { EvaluateLoadResponse } from '../utils/api';
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
  normal_schedule: 'You have capacity today. Keep the full schedule, deep work included.',
};

const pct = (v: number) => `${Math.max(0, Math.min(100, v))}%`;

export const ScorePanel: React.FC<ScorePanelProps> = ({ apiData, loading }) => {
  const score = apiData?.cognitive_load_score ?? null;
  const tone = scoreTone(score);

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="eyebrow">Cognitive load score</div>
        {loading && (
          <span className="flex items-center gap-1 text-[12px] text-faint">
            <Loader2 className="w-3 h-3 animate-spin" /> Updating
          </span>
        )}
      </div>

      <div className="flex items-end gap-2 mt-2">
        <span
          className={`font-display num text-[64px] leading-[0.9] tracking-tight transition-colors ${
            score === null ? 'text-faint' : toneText[tone]
          }`}
        >
          {score === null ? '—' : score.toFixed(1)}
        </span>
        <span className="text-sm text-faint mb-1.5">/ 100</span>
      </div>
      <div className="mt-1.5 text-sm font-medium">{score === null ? 'No reading yet' : scoreLabel(score)}</div>

      {/* Scale */}
      <div className="mt-6" aria-hidden>
        <div className="relative h-2.5 rounded-full overflow-hidden flex">
          <div className="bg-ok/20" style={{ width: pct(MODERATE_THRESHOLD) }} />
          <div className="bg-warn/20" style={{ width: pct(CRITICAL_THRESHOLD - MODERATE_THRESHOLD) }} />
          <div className="bg-danger/20 flex-1" />
          {apiData && (
            <div
              className="absolute inset-y-0 bg-ink/25 transition-all duration-500"
              style={{ left: pct(apiData.y_left), width: pct(apiData.y_right - apiData.y_left) }}
              title="Centroid interval [y_l, y_r]"
            />
          )}
        </div>
        <div className="relative h-0">
          {score !== null && (
            <div
              className="absolute -top-[14px] -translate-x-1/2 transition-all duration-500"
              style={{ left: pct(score) }}
            >
              <div className={`w-[3px] h-[18px] rounded-full ${toneBg[tone]} ring-2 ring-surface`} />
            </div>
          )}
        </div>
        <div className="relative mt-2 h-4 text-[10.5px] text-faint num">
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

      {apiData?.recommended_action && (
        <p className="mt-4 text-[13.5px] leading-relaxed text-muted border-l-2 border-line pl-3">
          {ACTION_TEXT[apiData.recommended_action] ?? apiData.recommended_action.replace(/_/g, ' ')}
        </p>
      )}

      {apiData && (
        <dl className="mt-5 grid grid-cols-3 gap-px rounded-lg overflow-hidden bg-line border border-line">
          <Stat label="Interval" value={`${apiData.y_left.toFixed(1)}–${apiData.y_right.toFixed(1)}`} />
          <Stat label="KM iterations" value={String(apiData.km_iterations)} />
          <Stat label="Rules fired" value={`${apiData.triggered_rules_count}/${apiData.rule_firings.length}`} />
        </dl>
      )}
    </div>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="bg-surface px-3 py-2.5">
    <dt className="text-[11px] text-faint">{label}</dt>
    <dd className="num font-mono text-[13px] mt-0.5">{value}</dd>
  </div>
);
