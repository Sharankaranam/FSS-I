'use client';

import React, { useState } from 'react';
import { SectionHeader, ToneTag, Tone, useTokenColors } from './ui';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

type Trap = [number, number, number, number];
type SetDef = { name: string; level: string; umf: Trap; lmf: Trap; text: string };
type Driver = { name: string; source: string; sets: SetDef[] };

const DRIVERS: Driver[] = [
  {
    name: 'Fatigue',
    source: 'Samn-Perelli & Stanford Sleepiness Scale',
    sets: [
      { name: 'Energized', level: 'Low', umf: [0, 0, 30, 50], lmf: [0, 0, 20, 40], text: 'Samn-Perelli 1–2 (alert, active). LMF core [0, 20] guarantees full membership for optimal vigor; UMF to 50 captures people who feel functional despite minor fatigue.' },
      { name: 'Drained', level: 'Moderate', umf: [30, 45, 55, 70], lmf: [40, 50, 50, 60], text: 'Samn-Perelli 3–4 (somewhat tired). Processing speed decelerates by 15–25%. LMF peak centers on the scale midpoint.' },
      { name: 'Exhausted', level: 'Critical', umf: [55, 75, 100, 100], lmf: [65, 85, 100, 100], text: 'Samn-Perelli 5–7 (impairment). Working memory degrades sharply beyond 75%; LMF core [85, 100] forces critical load.' },
    ],
  },
  {
    name: 'Stress',
    source: 'Cohen PSS & Yerkes-Dodson',
    sets: [
      { name: 'Relaxed', level: 'Low', umf: [0, 0, 35, 55], lmf: [0, 0, 25, 45], text: 'Parasympathetic dominance (PSS < 10). UMF extends to 55 to allow mild positive eustress.' },
      { name: 'Pressured', level: 'Moderate', umf: [35, 50, 60, 80], lmf: [45, 55, 55, 70], text: 'Yerkes-Dodson optimal zone. UMF span [35, 80] covers deadline urgency without emotional breakdown.' },
      { name: 'Overwhelmed', level: 'Critical', umf: [60, 80, 100, 100], lmf: [75, 90, 100, 100], text: 'Acute distress; cortisol impairs prefrontal executive control. LMF core [90, 100] assigns critical load.' },
    ],
  },
  {
    name: 'Sleep quality',
    source: 'PSQI & Dawson-Reid circadian debt',
    sets: [
      { name: 'Restful', level: 'Low', umf: [0, 0, 30, 50], lmf: [0, 0, 20, 40], text: 'Full REM and slow-wave recovery (PSQI < 5). Maximum synaptic homeostasis and memory consolidation.' },
      { name: 'Restless', level: 'Moderate', umf: [30, 45, 55, 70], lmf: [40, 50, 50, 60], text: 'Partial fragmentation (PSQI 5–10). Attentional lapses increase by ~30%.' },
      { name: 'Deprived', level: 'Critical', umf: [55, 75, 100, 100], lmf: [65, 85, 100, 100], text: 'Severe sleep debt (> 24h awake or PSQI > 10). Deficit comparable to 0.10% BAC (Dawson & Reid).' },
    ],
  },
  {
    name: 'Task complexity',
    source: 'NASA-TLX & Cowan working memory',
    sets: [
      { name: 'Routine', level: 'Low', umf: [0, 0, 35, 55], lmf: [0, 0, 25, 45], text: '1–2 items in Cowan’s 4-chunk model. Admin, repetitive sorting, simple replies.' },
      { name: 'Challenging', level: 'Moderate', umf: [35, 50, 60, 80], lmf: [45, 55, 55, 70], text: '3–4 items. Code review, analytical writing, structured problem solving.' },
      { name: 'Intense', level: 'Critical', umf: [60, 80, 100, 100], lmf: [75, 90, 100, 100], text: '5+ items, at capacity. System architecture, complex proofs.' },
    ],
  },
];

const RULES: { id: number; condition: string; consequent: string; rationale: string }[] = [
  { id: 1, condition: 'Fatigue is Energized AND Stress is Relaxed AND Sleep is Restful', consequent: 'Low', rationale: 'Homeostatic balance across physiological, emotional and circadian drivers. Peak executive capacity.' },
  { id: 2, condition: 'Fatigue is Energized AND Stress is Relaxed', consequent: 'Low', rationale: 'Baseline calm with optimal vigor preserves high cognitive reserve.' },
  { id: 3, condition: 'Fatigue is Energized AND Stress is Pressured AND Task is Routine', consequent: 'Moderate', rationale: 'Vigor offsets deadline pressure for routine work (Yerkes-Dodson optimal arousal).' },
  { id: 4, condition: 'Fatigue is Energized AND Sleep is Restful AND Task is Intense', consequent: 'Moderate', rationale: 'Peak energy and full sleep recovery buffer complex working-memory demand.' },
  { id: 5, condition: 'Fatigue is Drained AND Stress is Relaxed', consequent: 'Moderate', rationale: 'Mild tiredness slows processing 15–25%, but low stress keeps load manageable.' },
  { id: 6, condition: 'Sleep is Restless AND Task is Routine', consequent: 'Moderate', rationale: 'Fragmented sleep causes minor lapses; low task demand prevents overload.' },
  { id: 7, condition: 'Fatigue is Drained AND Stress is Pressured', consequent: 'Critical', rationale: 'Dual strain of tiredness and urgency triggers prefrontal hypofunction.' },
  { id: 8, condition: 'Fatigue is Exhausted OR Stress is Overwhelmed', consequent: 'Critical', rationale: 'Single-point failure: either severe exhaustion or acute distress incapacitates executive control.' },
  { id: 9, condition: 'Sleep is Deprived OR (Task is Intense AND Fatigue is Drained)', consequent: 'Critical', rationale: 'Severe sleep debt, or intense work while drained, forces executive breakdown.' },
  { id: 10, condition: 'Fatigue is Drained AND Sleep is Restless AND Task is Challenging', consequent: 'Critical', rationale: 'Triple sub-threshold debt overwhelms the remaining cognitive reserve.' },
  { id: 11, condition: 'Stress is Pressured AND Task is Intense', consequent: 'Critical', rationale: 'Cortisol-driven attentional narrowing plus maximal working-memory demand.' },
  { id: 12, condition: 'Sleep is Deprived', consequent: 'Critical', rationale: 'Prolonged sleep debt (> 24h awake) alone causes a 0.10% BAC-equivalent deficit.' },
];

const LEVEL_TONE: Record<string, Tone> = { Low: 'ok', Moderate: 'warn', Critical: 'danger' };

export const AcademicInspector: React.FC = () => {
  const [tab, setTab] = useState<string>('drivers');

  return (
    <div>
      <SectionHeader
        title="How the engine reasons"
        description="Each word is an interval type-2 fuzzy set: an upper and a lower membership function. The gap between them, the footprint of uncertainty, captures how differently people use that word."
      />

      <Tabs value={tab} onValueChange={setTab} className="gap-6">
        <TabsList aria-label="Method sections" className="h-10">
          <TabsTrigger value="drivers" className="px-4">
            Membership sets
          </TabsTrigger>
          <TabsTrigger value="rules" className="px-4">
            Rule base
          </TabsTrigger>
        </TabsList>

        {tab === 'drivers' ? (
          <div className="space-y-4" role="tabpanel">
            {DRIVERS.map((d) => (
              <section key={d.name} className="card overflow-hidden" aria-labelledby={`driver-${d.name}`}>
                <div className="grid lg:grid-cols-[340px_1fr]">
                  <div className="p-5 border-b lg:border-b-0 lg:border-r bg-sunken">
                    <h2 id={`driver-${d.name}`} className="font-display text-xl tracking-[-0.01em]">
                      {d.name}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{d.source}</p>
                    <MFPlot sets={d.sets} />
                    <p className="text-xs text-muted-foreground mt-2">
                      Solid line: upper MF. Dashed: lower MF. Shaded: footprint of uncertainty.
                    </p>
                  </div>
                  <div className="divide-y">
                    {d.sets.map((s) => (
                      <div key={s.name} className="p-4 sm:px-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-medium text-sm">{s.name}</h3>
                          <ToneTag word={s.level}>{s.level}</ToneTag>
                          <span className="ml-auto font-mono text-xs text-muted-foreground">
                            UMF [{s.umf.join(', ')}] · LMF [{s.lmf.join(', ')}]
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed max-w-[65ch]">{s.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="space-y-4" role="tabpanel">
            <div className="card p-5 text-sm text-muted-foreground leading-relaxed space-y-2">
              <p className="max-w-[70ch]">
                When you pick a word, the engine compares that word&apos;s fuzzy set with every set of the same driver.
                It matches itself fully and its neighbours partly, so the uncertainty in the words carries through to
                the result.
              </p>
              <p className="max-w-[70ch]">
                Antecedents then combine with <strong className="font-medium text-foreground">min</strong> for AND
                and <strong className="font-medium text-foreground">max</strong> for OR, separately for the upper and
                lower memberships. Each rule&apos;s firing interval scales its output set; the outputs are aggregated
                and reduced to a range [yₗ, yᵣ] with Karnik-Mendel.
              </p>
            </div>
            <ol className="card divide-y" aria-label="Rules">
              {RULES.map((r) => (
                <li key={r.id} className="px-5 py-3.5 grid sm:grid-cols-[52px_1fr] gap-x-4 gap-y-1">
                  <span className="text-sm font-semibold num">R{r.id}</span>
                  <div>
                    <div className="text-sm">
                      {r.condition.split(/\b(AND|OR)\b/).map((p, i) =>
                        p === 'AND' || p === 'OR' ? (
                          <span key={i} className="text-xs font-medium text-muted-foreground">{` ${p} `}</span>
                        ) : (
                          <span key={i}>{p}</span>
                        )
                      )}{' '}
                      <span className="text-muted-foreground" aria-label="then">
                        →
                      </span>{' '}
                      <ToneTag word={r.consequent}>{r.consequent} load</ToneTag>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{r.rationale}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        )}
      </Tabs>
    </div>
  );
};

/** Small SVG plot of the three IT2 trapezoids for one driver. */
const MFPlot = ({ sets }: { sets: SetDef[] }) => {
  const colors = useTokenColors();
  if (!colors) return null;
  const W = 300;
  const H = 110;
  const pad = { l: 4, r: 4, t: 8, b: 18 };
  const x = (v: number) => pad.l + (v / 100) * (W - pad.l - pad.r);
  const y = (m: number) => pad.t + (1 - m) * (H - pad.t - pad.b);
  const trap = (t: Trap) => `${x(t[0])},${y(0)} ${x(t[1])},${y(1)} ${x(t[2])},${y(1)} ${x(t[3])},${y(0)}`;
  const toneColor = (lvl: string) => colors[LEVEL_TONE[lvl]];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-4" role="img" aria-label="Membership functions">
      <line x1={pad.l} x2={W - pad.r} y1={y(0)} y2={y(0)} stroke={colors.line} />
      {sets.map((s) => {
        const c = toneColor(s.level);
        // FOU polygon: UMF outline then LMF reversed
        const fou = `${trap(s.umf)} ${trap(s.lmf).split(' ').reverse().join(' ')}`;
        return (
          <g key={s.name}>
            <polygon points={fou} fill={c} fillOpacity={0.16} />
            <polyline points={trap(s.umf)} fill="none" stroke={c} strokeWidth={1.5} />
            <polyline points={trap(s.lmf)} fill="none" stroke={c} strokeWidth={1} strokeDasharray="3 2" />
          </g>
        );
      })}
      {[0, 50, 100].map((t) => (
        <text
          key={t}
          x={x(t)}
          y={H - 4}
          fontSize={11}
          fill={colors.faint}
          textAnchor={t === 0 ? 'start' : t === 100 ? 'end' : 'middle'}
        >
          {t}
        </text>
      ))}
    </svg>
  );
};
