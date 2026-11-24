'use client';

import React, { useState, useEffect } from 'react';
import { Sunrise, Utensils, MoonStar, RotateCcw, ArrowRight, Loader2, Info } from 'lucide-react';
import {
  fetchLiveWellHabits,
  fetchLiveWellQuizzes,
  fetchLiveWellQuiz,
  evaluateLiveWellQuiz,
  fetchLiveWellMicrohabits,
  fetchLiveWellSupplements,
  fetchLiveWellLabs,
  LiveWellHabit,
  LiveWellQuizDetail,
  LiveWellQuizEvaluationResult,
} from '../utils/api';
import { SectionHeader, toneSoft, wordTone } from './ui';

type Tab = 'habits' | 'quizzes' | 'microhabits' | 'supplements';

const TABS: { id: Tab; label: string }[] = [
  { id: 'habits', label: '8 habits' },
  { id: 'quizzes', label: 'Screening' },
  { id: 'microhabits', label: 'Microhabits' },
  { id: 'supplements', label: 'Supplements & labs' },
];

const DRIVERS = ['Gut Health', 'Inflammation', 'Insulin Resistance', 'Toxins'];

export const LiveWellDatabaseViewer: React.FC<{ userId?: string }> = ({ userId = 'guest' }) => {
  const [activeTab, setActiveTab] = useState<Tab>('habits');
  const [loadError, setLoadError] = useState<string | null>(null);

  const [habits, setHabits] = useState<LiveWellHabit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<LiveWellHabit | null>(null);

  const [quizList, setQuizList] = useState<any[]>([]);
  const [selectedQuizCode, setSelectedQuizCode] = useState<string>('INSULIN_RESISTANCE');
  const [activeQuiz, setActiveQuiz] = useState<LiveWellQuizDetail | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [evalResult, setEvalResult] = useState<LiveWellQuizEvaluationResult | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  const [microhabits, setMicrohabits] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('Gut Health');

  const [supplements, setSupplements] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);

  const fail = (e: any) => {
    console.error(e);
    setLoadError('Could not reach the LiveWell database. Make sure the backend is running on port 8000.');
  };

  useEffect(() => {
    fetchLiveWellHabits()
      .then((data) => {
        setHabits(data);
        if (data.length > 0) setSelectedHabit(data[0]);
      })
      .catch(fail);
    fetchLiveWellQuizzes().then(setQuizList).catch(fail);
  }, []);

  useEffect(() => {
    if (activeTab === 'quizzes' && selectedQuizCode) {
      setEvalResult(null);
      setUserAnswers({});
      setQuizError(null);
      fetchLiveWellQuiz(selectedQuizCode).then(setActiveQuiz).catch(fail);
    }
  }, [activeTab, selectedQuizCode]);

  useEffect(() => {
    if (activeTab === 'microhabits') {
      fetchLiveWellMicrohabits(selectedDriver).then(setMicrohabits).catch(fail);
    }
  }, [activeTab, selectedDriver]);

  useEffect(() => {
    if (activeTab === 'supplements') {
      fetchLiveWellSupplements().then(setSupplements).catch(fail);
      fetchLiveWellLabs().then(setLabs).catch(fail);
    }
  }, [activeTab]);

  const handleQuizSubmit = async () => {
    if (!selectedQuizCode) return;
    setQuizSubmitting(true);
    setQuizError(null);
    try {
      setEvalResult(await evaluateLiveWellQuiz(selectedQuizCode, userAnswers, userId));
    } catch (e: any) {
      setQuizError(e.message || 'Evaluation failed.');
    } finally {
      setQuizSubmitting(false);
    }
  };

  const answered = activeQuiz ? activeQuiz.questions.filter((q) => userAnswers[q.question_number] !== undefined).length : 0;

  return (
    <div>
      <SectionHeader
        eyebrow="LiveWell library"
        title="Habits & clinical screening"
        description="Eight habits, seven screening instruments, MY GOAL DO IT microhabits and therapeutic protocols from the LiveWell longevity framework."
      />
      <div className="segmented overflow-x-auto no-scrollbar max-w-full mb-5 -mt-1" role="tablist">
        {TABS.map((t) => (
          <button key={t.id} aria-pressed={activeTab === t.id} onClick={() => setActiveTab(t.id)} className="shrink-0">
            {t.label}
          </button>
        ))}
      </div>

      {loadError && (
        <div className="card p-4 mb-4 text-[13px] text-danger border-danger/30 bg-danger/5">{loadError}</div>
      )}

      {/* HABITS: master-detail */}
      {activeTab === 'habits' && (
        <div className="grid lg:grid-cols-[280px_1fr] gap-4">
          <ul className="card p-1.5 h-fit">
            {habits.map((h) => {
              const sel = selectedHabit?.id === h.id;
              return (
                <li key={h.id}>
                  <button
                    onClick={() => setSelectedHabit(h)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      sel ? 'bg-sunken' : 'hover:bg-sunken/60'
                    }`}
                  >
                    <span
                      className={`num font-mono text-[12px] w-6 h-6 rounded-md grid place-items-center shrink-0 ${
                        sel ? 'bg-accent text-accent-ink' : 'bg-sunken text-muted'
                      }`}
                    >
                      {h.habit_number}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-medium truncate">{h.superhero_name}</span>
                      <span className="block text-[12px] text-faint truncate">{h.domain}</span>
                    </span>
                  </button>
                </li>
              );
            })}
            {habits.length === 0 && !loadError && <li className="p-4 text-[13px] text-faint">Loading…</li>}
          </ul>

          {selectedHabit && (
            <article key={selectedHabit.id} className="card p-5 sm:p-6 animate-rise">
              <div className="eyebrow">
                Habit {selectedHabit.habit_number} · {selectedHabit.domain}
              </div>
              <h3 className="font-display text-[28px] leading-tight mt-1">{selectedHabit.superhero_name}</h3>
              <p className="text-[14px] text-muted italic mt-1">{selectedHabit.tagline}</p>
              <p className="text-[14px] leading-relaxed mt-4">{selectedHabit.description}</p>

              <div className="mt-5 rounded-lg bg-accent/[0.07] border border-accent/20 p-4">
                <div className="text-[12px] font-medium text-accent mb-1">Superpower check</div>
                <p className="text-[13.5px] leading-relaxed">{selectedHabit.superpower_check_questions}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-px mt-5 rounded-lg overflow-hidden bg-line border border-line">
                <Routine icon={Sunrise} title="Morning" text={selectedHabit.morning_routine} />
                <Routine icon={Utensils} title="Meals" text={selectedHabit.meal_guidance} />
                <Routine icon={MoonStar} title="Evening" text={selectedHabit.evening_wind_down} />
              </div>

              {selectedHabit.synergistic_helpers && (
                <p className="text-[13px] text-muted mt-5">
                  <span className="text-ink font-medium">Works well with: </span>
                  {selectedHabit.synergistic_helpers}
                </p>
              )}
            </article>
          )}
        </div>
      )}

      {/* QUIZZES */}
      {activeTab === 'quizzes' && (
        <div className="space-y-4">
          <MedicalNotice />
          <div className="flex flex-wrap gap-1.5">
            {quizList.map((q) => (
              <button
                key={q.quiz_code}
                onClick={() => setSelectedQuizCode(q.quiz_code)}
                className={`px-3 py-1.5 rounded-full text-[12.5px] border transition-colors ${
                  selectedQuizCode === q.quiz_code
                    ? 'border-ink bg-ink text-bg'
                    : 'border-line text-muted hover:text-ink hover:border-faint'
                }`}
              >
                {q.title.split('(')[0].trim()}
              </button>
            ))}
          </div>

          {activeQuiz && (
            <div className="card">
              <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-line">
                <div className="eyebrow">{activeQuiz.chapter_source}</div>
                <h3 className="font-display text-xl mt-1">{activeQuiz.title}</h3>
                <p className="text-[13.5px] text-muted mt-1">{activeQuiz.instructions}</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="flex-1 h-1 rounded-full bg-sunken overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: `${(answered / Math.max(activeQuiz.questions.length, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="num text-[12px] text-faint">
                    {answered}/{activeQuiz.questions.length} answered
                  </span>
                </div>
              </div>

              <ol className="divide-y divide-line">
                {activeQuiz.questions.map((q) => (
                  <li
                    key={q.id}
                    className="px-5 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center gap-3 justify-between"
                  >
                    <div className="flex gap-3 min-w-0">
                      <span className="num font-mono text-[12px] text-faint w-6 shrink-0 pt-0.5">{q.question_number}</span>
                      <div>
                        <p className="text-[13.5px] leading-relaxed">{q.question_text}</p>
                        {q.category && <span className="text-[11.5px] text-faint">{q.category}</span>}
                      </div>
                    </div>
                    <div className="segmented shrink-0 self-start md:self-auto ml-9 md:ml-0">
                      {q.options.map((opt, i) => (
                        <button
                          key={i}
                          aria-pressed={userAnswers[q.question_number] === opt.points}
                          onClick={() => setUserAnswers((p) => ({ ...p, [q.question_number]: opt.points }))}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>

              <div className="px-5 sm:px-6 py-3.5 border-t border-line flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setUserAnswers({});
                    setEvalResult(null);
                  }}
                  className="btn-ghost"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
                <button onClick={handleQuizSubmit} disabled={quizSubmitting} className="btn-primary">
                  {quizSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Evaluate risk
                  {!quizSubmitting && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>

              {quizError && <div className="px-6 pb-4 text-[13px] text-danger">{quizError}</div>}

              {evalResult && (
                <div className="m-4 sm:m-5 mt-0 sm:mt-0 rounded-lg border border-line overflow-hidden animate-rise">
                  <div className={`px-4 py-3 flex flex-wrap items-center justify-between gap-2 ${toneSoft[wordTone(evalResult.risk_level)]}`}>
                    <span className="font-medium text-[14px]">{evalResult.label}</span>
                    <span className="num text-[13px]">
                      {evalResult.total_score} / {evalResult.max_possible_score} pts · {evalResult.risk_level} risk
                    </span>
                  </div>
                  <div className="p-4 grid md:grid-cols-2 gap-4 text-[13.5px] leading-relaxed">
                    <div>
                      <div className="eyebrow mb-1">Interpretation</div>
                      <p>{evalResult.clinical_interpretation}</p>
                    </div>
                    <div>
                      <div className="eyebrow mb-1">Recommended actions</div>
                      <p>{evalResult.recommended_actions}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MICROHABITS */}
      {activeTab === 'microhabits' && (
        <div className="space-y-4">
          <div className="segmented overflow-x-auto no-scrollbar max-w-full">
            {DRIVERS.map((d) => (
              <button key={d} aria-pressed={selectedDriver === d} onClick={() => setSelectedDriver(d)} className="shrink-0">
                {d}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {microhabits.map((mh) => (
              <div key={mh.id} className="card p-4 flex gap-3.5">
                <span className="font-display text-2xl leading-none text-accent w-6 shrink-0">{mh.letter}</span>
                <div className="min-w-0">
                  <div className="text-[12px] text-faint">{mh.step_name}</div>
                  <p className="text-[14px] mt-0.5">{mh.microhabit_text}</p>
                  {mh.implementation_tip && (
                    <p className="text-[12.5px] text-muted mt-1.5">Tip: {mh.implementation_tip}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUPPLEMENTS & LABS */}
      {activeTab === 'supplements' && (
        <div className="space-y-6">
          <MedicalNotice />
          <DataTable
            title="Therapeutic supplements"
            headers={['Supplement', 'Mechanism & evidence', 'Typical dosage', 'Indications']}
            rows={supplements.map((s) => [
              <span key="n" className="font-medium whitespace-nowrap">{s.name}</span>,
              s.mechanism_and_evidence,
              <span key="d" className="font-mono text-[12px]">{s.typical_dosage_and_notes}</span>,
              <span key="i" className="text-muted">{s.primary_indications}</span>,
            ])}
            keys={supplements.map((s) => s.id)}
          />
          <DataTable
            title="Lab biomarkers"
            headers={['Test', 'Coverage', 'Target system', 'Clinical significance']}
            rows={labs.map((l) => [
              <span key="n" className="font-medium whitespace-nowrap">{l.test_name}</span>,
              <span
                key="c"
                className={`tag whitespace-nowrap ${
                  l.coverage_category.includes('Insurance') ? 'bg-ok/10 text-ok' : 'bg-lmf/10 text-lmf'
                }`}
              >
                {l.coverage_category}
              </span>,
              l.target_system,
              <span key="s" className="text-muted">{l.clinical_significance}</span>,
            ])}
            keys={labs.map((l) => l.id)}
          />
        </div>
      )}
    </div>
  );
};

const MedicalNotice = () => (
  <div role="note" className="flex gap-3 rounded-lg border border-warn/30 bg-warn/[0.06] px-4 py-3 text-[13px] leading-relaxed">
    <Info className="w-4 h-4 text-warn shrink-0 mt-0.5" />
    <p>
      <span className="font-medium">Educational screening, not medical advice.</span>{' '}
      <span className="text-muted">
        These questionnaires and protocols come from the LiveWell framework and cannot diagnose any condition. Talk
        to a qualified clinician before acting on a result, starting a supplement or ordering lab tests, and seek
        urgent care for severe or sudden symptoms.
      </span>
    </p>
  </div>
);

const Routine = ({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text?: string }) => (
  <div className="bg-surface p-4">
    <div className="flex items-center gap-1.5 text-[12px] font-medium text-muted mb-1.5">
      <Icon className="w-3.5 h-3.5" /> {title}
    </div>
    <p className="text-[13px] leading-relaxed">{text || '—'}</p>
  </div>
);

const DataTable = ({
  title,
  headers,
  rows,
  keys,
}: {
  title: string;
  headers: string[];
  rows: React.ReactNode[][];
  keys: (string | number)[];
}) => (
  <div className="card overflow-hidden">
    <div className="px-5 py-3.5 border-b border-line font-medium">{title}</div>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="text-[11.5px] text-faint border-b border-line">
            {headers.map((h) => (
              <th key={h} className="px-5 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r, i) => (
            <tr key={keys[i]} className="align-top hover:bg-sunken/50">
              {r.map((c, j) => (
                <td key={j} className="px-5 py-3 leading-relaxed">
                  {c}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="px-5 py-8 text-center text-faint">
                Loading…
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
