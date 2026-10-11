'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  Brain,
  ShieldCheck,
  Layers,
  Info,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const AcademicInspector: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'drivers' | 'rules'>('drivers');

  return (
    <div className="w-full glass-panel rounded-2xl p-6 mb-8 border border-slate-800 shadow-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full">
              Master&apos;s Thesis Documentation
            </span>
            <span className="text-xs text-slate-400">&bull; Univ. of Neuchâtel / LiveWell</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-400" />
            Psychometric Data Foundations &amp; IT2 Rule Rationale
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Formal academic justifications for membership parameters, footprints of uncertainty (FOU), and cognitive rule interactions.
          </p>
        </div>

        {/* Sub-tab Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveSubTab('drivers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'drivers'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            4 Driver Membership Sets
          </button>
          <button
            onClick={() => setActiveSubTab('rules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeSubTab === 'rules'
                ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            9 IT2 Rule Rationales
          </button>
        </div>
      </div>

      {activeSubTab === 'drivers' ? (
        <div className="space-y-6">
          {/* Driver 1 Card */}
          <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                Driver 1: Fatigue Level (Physical &amp; Mental Exhaustion)
              </h3>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Samn-Perelli &amp; Stanford Sleepiness Scale
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-emerald-400 mb-1">Energized (Low Fatigue)</div>
                <div className="font-mono text-[11px] text-slate-400 mb-2">
                  UMF: [0, 0, 30, 50] | LMF: [0, 0, 20, 40]
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Corresponds to Samn-Perelli levels 1–2 (alert, active). LMF core [0, 20] guarantees 1.0 membership for optimal vigor. UMF upper bound 50 captures subjects who feel fully functional despite minor fatigue.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-amber-400 mb-1">Drained (Moderate Fatigue)</div>
                <div className="font-mono text-[11px] text-slate-400 mb-2">
                  UMF: [30, 45, 55, 70] | LMF: [40, 50, 50, 60]
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Corresponds to Samn-Perelli levels 3–4 (okay, somewhat tired). Cognitive processing speed decelerates by 15–25%. LMF core [50, 50] centers on the scale midpoint.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-rose-400 mb-1">Exhausted (Severe Fatigue)</div>
                <div className="font-mono text-[11px] text-slate-400 mb-2">
                  UMF: [55, 75, 100, 100] | LMF: [65, 85, 100, 100]
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Corresponds to Samn-Perelli levels 5–7 (extremely tired, impairment). Working memory capacity degrades exponentially beyond 75%. LMF core [85, 100] forces critical load.
                </p>
              </div>
            </div>
          </div>

          {/* Driver 2 Card */}
          <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Driver 2: Stress Level (Perceived Psychological Pressure)
              </h3>
              <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Cohen PSS &amp; Yerkes-Dodson Law of Arousal
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-emerald-400 mb-1">Relaxed (Low Stress)</div>
                <div className="font-mono text-[11px] text-slate-400 mb-2">
                  UMF: [0, 0, 35, 55] | LMF: [0, 0, 25, 45]
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Parasympathetic dominance (PSS &lt; 10). LMF core [0, 25] represents baseline calm. UMF extends to 55 to allow mild positive eustress.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-amber-400 mb-1">Pressured (Moderate Stress)</div>
                <div className="font-mono text-[11px] text-slate-400 mb-2">
                  UMF: [35, 50, 60, 80] | LMF: [45, 55, 55, 70]
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Optimal performance zone under Yerkes-Dodson. UMF span [35, 80] captures subjective range where users feel deadline urgency without emotional breakdown.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-rose-400 mb-1">Overwhelmed (Acute Distress)</div>
                <div className="font-mono text-[11px] text-slate-400 mb-2">
                  UMF: [60, 80, 100, 100] | LMF: [75, 90, 100, 100]
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Acute distress where cortisol impairs prefrontal cortex executive control. LMF core [90, 100] ensures immediate critical load assignment.
                </p>
              </div>
            </div>
          </div>

          {/* Driver 3 Card */}
          <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Driver 3: Sleep Quality (Restorative Sleep Deficit)
              </h3>
              <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                PSQI Index &amp; Dawson-Reid Circadian Debt Model
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-emerald-400 mb-1">Restful (Full Recovery)</div>
                <div className="font-mono text-[11px] text-slate-400 mb-2">
                  UMF: [0, 0, 30, 50] | LMF: [0, 0, 20, 40]
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Full REM &amp; slow-wave sleep recovery (PSQI &lt; 5). Maximum synaptic homeostasis and memory consolidation.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-amber-400 mb-1">Restless (Partial Deficit)</div>
                <div className="font-mono text-[11px] text-slate-400 mb-2">
                  UMF: [30, 45, 55, 70] | LMF: [40, 50, 50, 60]
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Partial sleep fragmentation (PSQI 5–10). Attentional lapses increase by 30%.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-rose-400 mb-1">Deprived (Severe Sleep Debt)</div>
                <div className="font-mono text-[11px] text-slate-400 mb-2">
                  UMF: [55, 75, 100, 100] | LMF: [65, 85, 100, 100]
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Severe sleep debt (&gt; 24h wakefulness or PSQI &gt; 10). Cognitive deficit equivalent to 0.10% BAC (Dawson &amp; Reid).
                </p>
              </div>
            </div>
          </div>

          {/* Driver 4 Card */}
          <div className="bg-slate-900/60 rounded-xl p-5 border border-slate-800">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Driver 4: Task Complexity (External Mental Demand)
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                NASA Task Load Index (NASA-TLX) &amp; Cowan Working Memory Model
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-emerald-400 mb-1">Routine (Low Demand)</div>
                <div className="font-mono text-[11px] text-slate-400 mb-2">
                  UMF: [0, 0, 35, 55] | LMF: [0, 0, 25, 45]
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Minimal working memory load (1–2 items in Cowan&apos;s 4-chunk model). Admin, repetitive sorting, simple email replies.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-amber-400 mb-1">Challenging (Moderate Demand)</div>
                <div className="font-mono text-[11px] text-slate-400 mb-2">
                  UMF: [35, 50, 60, 80] | LMF: [45, 55, 55, 70]
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  Moderate working memory load (3–4 items). Code review, analytical writing, structured problem solving.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
                <div className="font-bold text-rose-400 mb-1">Intense (High Demand)</div>
                <div className="font-mono text-[11px] text-slate-400 mb-2">
                  UMF: [60, 80, 100, 100] | LMF: [75, 90, 100, 100]
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  High working memory load (5+ items, operating at capacity limit). System architecture design, complex mathematical proofs.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300 mb-4">
            <strong className="text-white block mb-1">Formal Rule Base Rationale in Interval Type-2 Systems:</strong>
            Rules evaluate antecedent set intervals using Minimum for <code className="text-cyan-400 font-mono">AND</code> intersections and Maximum for <code className="text-amber-400 font-mono">OR</code> unions. The resulting firing interval [Lower, Upper] scales the consequent fuzzy set, which is then aggregated across rules and defuzzified via Karnik-Mendel type-reduction.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <RuleCard
              id={1}
              condition="Fatigue is Energized AND Stress is Relaxed AND Sleep is Restful"
              consequent="Low Load"
              rationale="Physiological, emotional, and circadian drivers are all in homeostatic balance. Cognitive capacity is at peak, resulting in minimal cognitive load."
            />
            <RuleCard
              id={2}
              condition="Fatigue is Energized AND Stress is Pressured AND Task is Routine"
              consequent="Moderate Load"
              rationale="Vigor offsets deadline pressure when executing low-complexity tasks. Per Yerkes-Dodson law, mild arousal enhances throughput without causing cognitive overload."
            />
            <RuleCard
              id={3}
              condition="Fatigue is Drained AND Stress is Relaxed AND Task is Routine"
              consequent="Moderate Load"
              rationale="Moderate fatigue reduces processing speed, but low stress and routine task demands prevent working memory bottlenecking."
            />
            <RuleCard
              id={4}
              condition="Fatigue is Drained AND Stress is Pressured"
              consequent="Critical Load"
              rationale="Dual strain: physical tiredness combined with emotional pressure creates a compounding cognitive tax, straining prefrontal cortex resources."
            />
            <RuleCard
              id={5}
              condition="Fatigue is Exhausted OR Stress is Overwhelmed"
              consequent="Critical Load"
              rationale="Single-point failure rule. Severe exhaustion (Samn-Perelli > 5) or acute emotional distress independently incapacitates executive functioning."
            />
            <RuleCard
              id={6}
              condition="Sleep is Deprived AND Task is Intense"
              consequent="Critical Load"
              rationale="Sleep deprivation severely impairs synaptic plasticity and attentional control (Dawson & Reid). Attempting complex tasks under severe sleep debt guarantees error escalation."
            />
            <RuleCard
              id={7}
              condition="Stress is Overwhelmed AND Task is Challenging"
              consequent="Critical Load"
              rationale="High stress induces attentional tunnel vision. Paired with a challenging task, total mental demand far exceeds available working memory chunks."
            />
            <RuleCard
              id={8}
              condition="Fatigue is Drained AND Sleep is Restless AND Task is Challenging"
              consequent="Critical Load"
              rationale="Chronic sub-threshold fatigue and fragmented sleep erode mental resilience. A challenging task tips total cognitive workload past the breakdown threshold."
            />
            <RuleCard
              id={9}
              condition="Fatigue is Energized AND Sleep is Restful AND Task is Intense"
              consequent="Moderate Load"
              rationale="High physiological energy and full sleep recovery provide maximum cognitive buffer, enabling the user to handle intense tasks without entering burnout territory."
            />
          </div>
        </div>
      )}
    </div>
  );
};

const RuleCard = ({
  id,
  condition,
  consequent,
  rationale,
}: {
  id: number;
  condition: string;
  consequent: string;
  rationale: string;
}) => (
  <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-col justify-between gap-2">
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono font-bold text-teal-400">Rule R{id}</span>
        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
            consequent.includes('Critical')
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}
        >
          {consequent}
        </span>
      </div>
      <div className="font-mono text-[11px] text-slate-300 mb-2">{condition}</div>
      <p className="text-[11px] text-slate-400 leading-relaxed">{rationale}</p>
    </div>
  </div>
);
