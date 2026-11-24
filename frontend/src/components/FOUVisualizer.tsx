'use client';

import React, { useMemo, useState } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { EvaluateLoadResponse, RuleFiringDetail } from '../utils/api';
import { SectionHeader, ToneTag, useTokenColors } from './ui';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface FOUVisualizerProps {
  apiData: EvaluateLoadResponse | null;
}

export const FOUVisualizer: React.FC<FOUVisualizerProps> = ({ apiData }) => {
  const colors = useTokenColors();
  const [showInactive, setShowInactive] = useState(false);

  const chartData = useMemo(
    () =>
      apiData
        ? apiData.fou_curves.domain.map((x, i) => {
            const u = apiData.fou_curves.aggregated_umf[i] || 0;
            const l = apiData.fou_curves.aggregated_lmf[i] || 0;
            return { x, UMF: u, LMF: l, band: [l, u] as [number, number] };
          })
        : [],
    [apiData]
  );

  if (!apiData || !colors) {
    return (
      <div>
        <SectionHeader title="Footprint of uncertainty" />
        <div className="card p-10 text-center text-sm text-muted-foreground">Run a check-in to see the inference trace.</div>
      </div>
    );
  }

  const { cognitive_load_score: y, y_left, y_right, rule_firings } = apiData;
  const sorted = [...rule_firings].sort((a, b) => b.f_upper - a.f_upper || a.rule_id - b.rule_id);
  const visible = showInactive ? sorted : sorted.filter((r) => r.is_triggered);
  const inactiveCount = rule_firings.length - rule_firings.filter((r) => r.is_triggered).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Footprint of uncertainty"
        description="Aggregated upper and lower membership functions, type-reduced with Karnik-Mendel to the centroid interval [yₗ, yᵣ]. The crisp score is its midpoint."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-card overflow-hidden bg-border border">
        <Metric label="Left switch point yₗ" value={y_left.toFixed(2)} sub={`${apiData.km_iterations_left} KM iterations`} />
        <Metric label="Right switch point yᵣ" value={y_right.toFixed(2)} sub={`${apiData.km_iterations_right} KM iterations`} />
        <Metric label="Crisp score (yₗ + yᵣ) / 2" value={y.toFixed(2)} emphasis />
        <Metric
          label="Rules fired"
          value={`${apiData.triggered_rules_count} of ${rule_firings.length}`}
          sub={`Dominant: ${apiData.top_rule_ids.map((id) => `R${id}`).join(', ') || '—'}`}
        />
      </div>

      <div className="card p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mb-3 text-xs text-muted-foreground">
          <Legend swatch={<span className="w-3 h-0.5 rounded" style={{ background: colors.accent }} />}>Upper MF</Legend>
          <Legend swatch={<span className="w-3 h-0.5 rounded" style={{ background: colors.lmf }} />}>Lower MF</Legend>
          <Legend swatch={<span className="w-3 h-2.5 rounded-sm" style={{ background: colors.accent, opacity: 0.18 }} />}>
            FOU
          </Legend>
          <Legend swatch={<span className="w-3 h-2.5 rounded-sm" style={{ background: colors.ink, opacity: 0.1 }} />}>
            Centroid interval
          </Legend>
        </div>
        <div className="h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 22, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke={colors.line} strokeDasharray="2 4" vertical={false} />
              <XAxis
                dataKey="x"
                type="number"
                domain={[0, 100]}
                ticks={[0, 20, 40, 60, 80, 100]}
                stroke={colors.faint}
                tick={{ fontSize: 12, fill: colors.faint }}
                tickLine={false}
                axisLine={{ stroke: colors.line }}
              />
              <YAxis
                domain={[0, 1]}
                ticks={[0, 0.25, 0.5, 0.75, 1]}
                stroke={colors.faint}
                tick={{ fontSize: 12, fill: colors.faint }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ stroke: colors.faint, strokeDasharray: '3 3' }}
                contentStyle={{
                  background: colors.surface,
                  border: `1px solid ${colors.line}`,
                  borderRadius: 10,
                  fontSize: 12,
                  color: colors.ink,
                }}
                labelFormatter={(v) => `x = ${v}`}
                formatter={(v: any, name: string) =>
                  name === 'band' ? [null, null] : [typeof v === 'number' ? v.toFixed(3) : v, name]
                }
              />
              <ReferenceArea x1={y_left} x2={y_right} fill={colors.ink} fillOpacity={0.06} />
              <Area
                type="monotone"
                dataKey="band"
                stroke="none"
                fill={colors.accent}
                fillOpacity={0.16}
                isAnimationActive={false}
                activeDot={false}
                legendType="none"
              />
              <Line type="monotone" dataKey="UMF" stroke={colors.accent} strokeWidth={2} dot={false} animationDuration={350} />
              <Line type="monotone" dataKey="LMF" stroke={colors.lmf} strokeWidth={2} dot={false} animationDuration={350} />
              <ReferenceLine
                x={y_left}
                stroke={colors.muted}
                strokeDasharray="3 3"
                label={{ value: 'yₗ', fill: colors.muted, fontSize: 12, position: 'top' }}
              />
              <ReferenceLine
                x={y_right}
                stroke={colors.muted}
                strokeDasharray="3 3"
                label={{ value: 'yᵣ', fill: colors.muted, fontSize: 12, position: 'top' }}
              />
              <ReferenceLine
                x={y}
                stroke={colors.ink}
                strokeWidth={1.5}
                label={{ value: y.toFixed(1), fill: colors.ink, fontSize: 12, fontWeight: 600, position: 'top' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 pt-4 pb-3 border-b">
          <div>
            <h2 className="text-base font-semibold">Rule firings</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Firing interval [lower, upper] for each rule, strongest first.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInactive((s) => !s)}
            aria-pressed={showInactive}
            className="self-start sm:self-auto"
          >
            {showInactive ? 'Hide inactive' : `Show ${inactiveCount} inactive`}
          </Button>
        </div>
        <ul className="divide-y divide-border">
          {visible.map((r) => (
            <RuleRow key={r.rule_id} rule={r} accent={colors.accent} />
          ))}
          {visible.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted-foreground">No rules fired for this combination.</li>}
        </ul>
      </div>
    </div>
  );
};

const Metric = ({ label, value, sub, emphasis }: { label: string; value: string; sub?: string; emphasis?: boolean }) => (
  <div className="bg-surface px-4 py-3.5">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className={`num mt-1 ${emphasis ? 'font-display text-[28px] leading-none' : 'text-xl font-medium'}`}>
      {value}
    </div>
    {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
  </div>
);

const Legend = ({ swatch, children }: { swatch: React.ReactNode; children: React.ReactNode }) => (
  <span className="flex items-center gap-1.5">
    {swatch}
    {children}
  </span>
);

/** Renders "A is X AND B is Y" with the operators de-emphasized. */
const Condition = ({ text }: { text: string }) => (
  <>
    {text.split(/\b(AND|OR|IF|THEN)\b/).map((part, i) =>
      /^(AND|OR|IF|THEN)$/.test(part) ? (
        <span key={i} className="text-muted-foreground text-xs font-medium">
          {` ${part} `}
        </span>
      ) : (
        <span key={i}>{part}</span>
      )
    )}
  </>
);

const RuleRow = ({ rule, accent }: { rule: RuleFiringDetail; accent: string }) => {
  const active = rule.is_triggered;
  return (
    <li className={`px-5 py-3.5 grid md:grid-cols-[52px_1fr_200px] gap-x-4 gap-y-2 ${active ? '' : 'opacity-55'}`}>
      <div className="flex md:block items-center gap-2">
        <span className="text-sm font-semibold num">R{rule.rule_id}</span>
        {rule.is_top_rule && (
          <Badge className="md:mt-1 rounded-md" title="Strongest firing rule">
            Top
          </Badge>
        )}
      </div>
      <div className="min-w-0">
        <div className="text-sm leading-snug">
          <Condition text={rule.rule_text} /> <span className="text-muted-foreground" aria-label="then">→</span>{' '}
          <ToneTag word={rule.consequent} />
        </div>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{rule.justification}</p>
      </div>
      <div className="md:pt-0.5">
        <div className="relative h-1.5 rounded-full bg-sunken">
          <div
            className="absolute inset-y-0 rounded-full"
            style={{
              left: `${rule.f_lower * 100}%`,
              width: `${Math.max(rule.f_upper - rule.f_lower, 0.01) * 100}%`,
              background: accent,
              opacity: 0.35,
            }}
          />
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${rule.f_lower * 100}%`, background: accent }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-muted-foreground num" aria-label={`Firing interval ${rule.f_lower.toFixed(2)} to ${rule.f_upper.toFixed(2)}`}>
          <span>{rule.f_lower.toFixed(2)}</span>
          <span>{rule.f_upper.toFixed(2)}</span>
        </div>
      </div>
    </li>
  );
};
