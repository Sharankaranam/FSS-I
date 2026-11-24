'use client';

import React, { useMemo } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { Checkin } from '../utils/api';
import { CRITICAL_THRESHOLD, MODERATE_THRESHOLD, scoreTone, toneText, useTokenColors } from './ui';

const DAY_MS = 24 * 60 * 60 * 1000;

export const TrendCard: React.FC<{ checkins: Checkin[] }> = ({ checkins }) => {
  const colors = useTokenColors();

  const data = useMemo(
    () =>
      checkins.map((c) => ({
        t: new Date(c.created_at).getTime(),
        score: c.score,
        band: [c.y_left, c.y_right] as [number, number],
        words: `${c.fatigue_state}, ${c.stress_state}, ${c.sleep_state}, ${c.task_complexity_state}`,
      })),
    [checkins]
  );

  const avg = checkins.length ? checkins.reduce((a, c) => a + c.score, 0) / checkins.length : null;
  const heavyDays = new Set(
    checkins.filter((c) => c.score > CRITICAL_THRESHOLD).map((c) => new Date(c.created_at).toDateString())
  ).size;
  const now = Date.now();

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between">
        <div className="eyebrow">Last 7 days</div>
        <span className="text-[12px] text-faint num">{checkins.length} check-ins</span>
      </div>

      {checkins.length === 0 ? (
        <p className="text-[13px] text-muted mt-3 leading-relaxed">
          Your check-ins will appear here. Each one is saved automatically; changes within 10 minutes count as a
          single check-in.
        </p>
      ) : (
        <>
          <div className="flex gap-6 mt-2">
            <div>
              <div className={`font-display text-2xl num ${toneText[scoreTone(avg)]}`}>{avg!.toFixed(0)}</div>
              <div className="text-[11.5px] text-faint">average load</div>
            </div>
            <div>
              <div className="font-display text-2xl num">{heavyDays}</div>
              <div className="text-[11.5px] text-faint">{heavyDays === 1 ? 'critical day' : 'critical days'}</div>
            </div>
          </div>
          {colors && (
            <div className="h-28 mt-3 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                  <XAxis
                    dataKey="t"
                    type="number"
                    scale="time"
                    domain={[now - 7 * DAY_MS, now]}
                    ticks={[now - 6 * DAY_MS, now - 3 * DAY_MS, now]}
                    tickFormatter={(v) =>
                      Math.abs(v - now) < DAY_MS / 2
                        ? 'Today'
                        : new Date(v).toLocaleDateString(undefined, { weekday: 'short' })
                    }
                    tick={{ fontSize: 10, fill: colors.faint }}
                    tickLine={false}
                    axisLine={{ stroke: colors.line }}
                  />
                  <YAxis domain={[0, 100]} hide />
                  <ReferenceLine y={CRITICAL_THRESHOLD} stroke={colors.danger} strokeOpacity={0.4} strokeDasharray="3 3" />
                  <ReferenceLine y={MODERATE_THRESHOLD} stroke={colors.warn} strokeOpacity={0.4} strokeDasharray="3 3" />
                  <Tooltip
                    contentStyle={{
                      background: colors.surface,
                      border: `1px solid ${colors.line}`,
                      borderRadius: 10,
                      fontSize: 12,
                      color: colors.ink,
                    }}
                    labelFormatter={(v) =>
                      new Date(v as number).toLocaleString(undefined, {
                        weekday: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    }
                    formatter={(v: any, name: string) =>
                      name === 'band'
                        ? [`${v[0].toFixed(0)}–${v[1].toFixed(0)}`, 'Range']
                        : [typeof v === 'number' ? v.toFixed(1) : v, 'Load']
                    }
                  />
                  <Area dataKey="band" stroke="none" fill={colors.accent} fillOpacity={0.12} isAnimationActive={false} />
                  <Line
                    dataKey="score"
                    stroke={colors.accent}
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: colors.accent, strokeWidth: 0 }}
                    isAnimationActive={false}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};
