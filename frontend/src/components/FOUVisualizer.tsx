'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { EvaluateLoadResponse } from '../utils/api';
import { LineChart as LineIcon, Code, CheckCircle, Flame, Info, Sparkles } from 'lucide-react';

interface FOUVisualizerProps {
  apiData: EvaluateLoadResponse | null;
}

export const FOUVisualizer: React.FC<FOUVisualizerProps> = ({ apiData }) => {
  if (!apiData) return null;

  const {
    cognitive_load_score,
    y_left,
    y_right,
    top_rule_ids,
    triggered_rules_count,
    rule_firings,
    fou_curves,
  } = apiData;

  // Format chart data for Recharts
  const chartData = fou_curves.domain.map((xVal, idx) => {
    const umfVal = fou_curves.aggregated_umf[idx] || 0;
    const lmfVal = fou_curves.aggregated_lmf[idx] || 0;
    return {
      x: xVal,
      UMF: umfVal,
      LMF: lmfVal,
      FOU: umfVal - lmfVal,
    };
  });

  return (
    <div className="w-full glass-panel rounded-2xl p-6 mb-8 border border-slate-700/60 shadow-xl">
      {/* Top Title & Centroid Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full flex items-center gap-1">
              <Flame className="w-3 h-3 text-amber-400" />
              {triggered_rules_count} Rules Fired &bull; Top: {top_rule_ids.map((id) => `R${id}`).join(', ')}
            </span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <LineIcon className="w-5 h-5 text-cyan-400" />
            IT2 Footprint of Uncertainty (FOU) &amp; Karnik-Mendel Switch Points
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Aggregated UMF vs LMF curves defuzzified via Karnik-Mendel to centroid interval [y_left, y_right].
          </p>
        </div>

        {/* Centroid Metrics Badge Pill */}
        <div className="flex items-center gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-700/80 text-xs shadow-lg">
          <div className="text-right">
            <div className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider">Left Switch (y_left)</div>
            <div className="font-mono font-extrabold text-cyan-400 text-sm">{y_left.toFixed(2)}</div>
          </div>
          <div className="h-7 w-px bg-slate-700" />
          <div className="text-right">
            <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Right Switch (y_right)</div>
            <div className="font-mono font-extrabold text-purple-400 text-sm">{y_right.toFixed(2)}</div>
          </div>
          <div className="h-7 w-px bg-slate-700" />
          <div className="text-right">
            <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Y_crisp Score</div>
            <div className="font-mono font-extrabold text-emerald-400 text-base">{cognitive_load_score.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart showing UMF and LMF */}
      <div className="h-72 w-full mb-6 bg-slate-950/80 p-4 rounded-xl border border-slate-800">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUMF" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorLMF" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="x"
              stroke="#64748b"
              tick={{ fontSize: 11 }}
              unit=" domain"
            />
            <YAxis
              stroke="#64748b"
              domain={[0, 1]}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                fontSize: '12px',
              }}
              formatter={(value: any) => [
                typeof value === 'number' ? value.toFixed(4) : value,
              ]}
            />
            {/* UMF Area */}
            <Area
              type="monotone"
              dataKey="UMF"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorUMF)"
              name="Upper Membership (UMF)"
            />
            {/* LMF Area */}
            <Area
              type="monotone"
              dataKey="LMF"
              stroke="#a855f7"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLMF)"
              name="Lower Membership (LMF)"
            />

            {/* Vertical Reference Lines */}
            <ReferenceLine
              x={y_left}
              stroke="#06b6d4"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: `y_l = ${y_left}`,
                fill: '#06b6d4',
                fontSize: 11,
                position: 'top',
              }}
            />
            <ReferenceLine
              x={y_right}
              stroke="#a855f7"
              strokeDasharray="4 4"
              strokeWidth={2}
              label={{
                value: `y_r = ${y_right}`,
                fill: '#a855f7',
                fontSize: 11,
                position: 'top',
              }}
            />
            <ReferenceLine
              x={cognitive_load_score}
              stroke="#10b981"
              strokeWidth={3}
              label={{
                value: `Y_crisp = ${cognitive_load_score}`,
                fill: '#10b981',
                fontSize: 12,
                fontWeight: 'bold',
                position: 'insideTopRight',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* IT2 Rule Firing Details Table with Top & Triggered Rule Badges */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Code className="w-4 h-4 text-purple-400" />
            Rule Evaluation Matrix (Highlighted Top &amp; Triggered Rules)
          </h3>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-amber-300 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
              <Flame className="w-3 h-3 text-amber-400" /> Top Dominant Rule
            </span>
            <span className="flex items-center gap-1 text-emerald-300 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              <CheckCircle className="w-3 h-3 text-emerald-400" /> Fired Rule
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800 shadow-inner">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3">Rule #</th>
                <th className="p-3">Rule Condition</th>
                <th className="p-3">Consequent</th>
                <th className="p-3 font-mono text-center">Lower Firing</th>
                <th className="p-3 font-mono text-center">Upper Firing</th>
                <th className="p-3 text-center">Rule Status</th>
                <th className="p-3">Psychometric Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
              {rule_firings.map((rf) => {
                const isTop = rf.is_top_rule;
                const isTriggered = rf.is_triggered;

                let rowBg = 'text-slate-500 hover:bg-slate-900/40';
                if (isTop) {
                  rowBg = 'bg-amber-500/15 text-amber-100 font-semibold ring-1 ring-amber-500/40';
                } else if (isTriggered) {
                  rowBg = 'bg-emerald-500/10 text-emerald-100 font-medium';
                }

                return (
                  <tr key={rf.rule_id} className={`transition-all ${rowBg}`}>
                    <td className="p-3 font-mono font-bold">R{rf.rule_id}</td>
                    <td className="p-3 font-mono text-[11px] max-w-xs">{rf.rule_text}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rf.consequent === 'Critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : rf.consequent === 'Moderate'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {rf.consequent}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-center">{rf.f_lower.toFixed(2)}</td>
                    <td className="p-3 font-mono text-center">{rf.f_upper.toFixed(2)}</td>
                    <td className="p-3 text-center">
                      {isTop ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500/25 text-amber-300 border border-amber-400 shadow-sm animate-pulse">
                          <Flame className="w-3 h-3 text-amber-400 shrink-0" />
                          TOP RULE
                        </span>
                      ) : isTriggered ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                          Triggered
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px]">Inactive</span>
                      )}
                    </td>
                    <td className="p-3 text-xs leading-normal text-slate-300 max-w-md">
                      <div className="flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{rf.justification}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
