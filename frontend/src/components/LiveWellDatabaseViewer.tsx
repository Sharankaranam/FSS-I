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
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';

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
        title="Habits & clinical screening"
        description="Eight habits, seven screening instruments, MY GOAL DO IT microhabits and therapeutic protocols from the LiveWell longevity framework."
      />
      <div className="overflow-x-auto no-scrollbar -mx-1 px-1 mb-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Tab)}>
          <TabsList aria-label="Library sections" className="h-10">
            {TABS.map((t) => (
              <TabsTrigger key={t.id} value={t.id} className="px-4">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loadError && (
        <div role="alert" className="card p-4 mb-4 text-sm text-danger border-danger/30 bg-danger/5">{loadError}</div>
      )}

      {/* HABITS: master-detail */}
      {activeTab === 'habits' && (
        <div className="grid lg:grid-cols-[280px_1fr] gap-4">
          <ul className="card p-1.5 h-fit" aria-label="Habits">
            {habits.map((h) => {
              const sel = selectedHabit?.id === h.id;
              return (
                <li key={h.id}>
                  <button
                    onClick={() => setSelectedHabit(h)}
                    aria-current={sel ? 'true' : undefined}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      sel ? 'bg-sunken' : 'hover:bg-sunken/60'
                    }`}
                  >
                    <span
                      className={`num text-xs font-medium size-6 rounded-md grid place-items-center shrink-0 ${
                        sel ? 'bg-primary text-primary-foreground' : 'bg-sunken text-muted-foreground'
                      }`}
                    >
                      {h.habit_number}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium truncate">{h.superhero_name}</span>
                      <span className="block text-xs text-muted-foreground truncate">{h.domain}</span>
                    </span>
                  </button>
                </li>
              );
            })}
            {habits.length === 0 && !loadError && <li className="p-4 text-sm text-faint">Loading…</li>}
          </ul>

          {selectedHabit && (
            <article key={selectedHabit.id} className="card p-5 sm:p-6">
              <h2 className="font-display text-[28px] leading-tight tracking-[-0.02em]">{selectedHabit.superhero_name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Habit {selectedHabit.habit_number} · {selectedHabit.domain}
              </p>
              <p className="text-[15px] mt-4 max-w-[65ch]">{selectedHabit.tagline}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-[65ch]">{selectedHabit.description}</p>

              <div className="mt-6 pt-5 border-t">
                <h3 className="text-sm font-medium text-primary">Superpower check</h3>
                <p className="text-sm leading-relaxed mt-1 max-w-[65ch]">{selectedHabit.superpower_check_questions}</p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mt-6 pt-5 border-t">
                <Routine icon={Sunrise} title="Morning" text={selectedHabit.morning_routine} />
                <Routine icon={Utensils} title="Meals" text={selectedHabit.meal_guidance} />
                <Routine icon={MoonStar} title="Evening" text={selectedHabit.evening_wind_down} />
              </div>

              {selectedHabit.synergistic_helpers && (
                <p className="text-sm text-muted-foreground mt-5">
                  <span className="text-foreground font-medium">Works well with: </span>
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
                aria-pressed={selectedQuizCode === q.quiz_code}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  selectedQuizCode === q.quiz_code
                    ? 'border-foreground bg-foreground text-background'
                    : 'text-muted-foreground hover:text-foreground hover:border-faint'
                }`}
              >
                {q.title.split('(')[0].trim()}
              </button>
            ))}
          </div>

          {activeQuiz && (
            <div className="card">
              <div className="px-5 sm:px-6 pt-5 pb-4 border-b">
                <h2 className="font-display text-xl tracking-[-0.01em]">{activeQuiz.title}</h2>
                <p className="text-sm text-muted-foreground mt-1 max-w-[65ch]">
                  {activeQuiz.instructions} <span className="text-faint">· {activeQuiz.chapter_source}</span>
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div
                    className="flex-1 h-1 rounded-full bg-muted overflow-hidden"
                    role="progressbar"
                    aria-label="Questions answered"
                    aria-valuemin={0}
                    aria-valuemax={activeQuiz.questions.length}
                    aria-valuenow={answered}
                  >
                    <div
                      className="h-full bg-primary transition-[width] duration-300 ease-out-expo"
                      style={{ width: `${(answered / Math.max(activeQuiz.questions.length, 1)) * 100}%` }}
                    />
                  </div>
                  <span className="num text-xs text-muted-foreground">
                    {answered} of {activeQuiz.questions.length} answered
                  </span>
                </div>
              </div>

              <ol className="divide-y divide-border">
                {activeQuiz.questions.map((q) => (
                  <li
                    key={q.id}
                    className="px-5 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center gap-3 justify-between"
                  >
                    <div className="flex gap-3 min-w-0">
                      <span className="num text-xs text-muted-foreground w-6 shrink-0 pt-0.5">{q.question_number}</span>
                      <div>
                        <p className="text-sm leading-relaxed">{q.question_text}</p>
                        {q.category && <span className="text-xs text-muted-foreground">{q.category}</span>}
                      </div>
                    </div>
                    <div
                      className="segmented shrink-0 self-start md:self-auto ml-9 md:ml-0"
                      role="radiogroup"
                      aria-label={`Answer to question ${q.question_number}`}
                    >
                      {q.options.map((opt, i) => (
                        <button
                          key={i}
                          role="radio"
                          aria-checked={userAnswers[q.question_number] === opt.points}
                          onClick={() => setUserAnswers((p) => ({ ...p, [q.question_number]: opt.points }))}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </li>
                ))}
              </ol>

              <div className="px-5 sm:px-6 py-3.5 border-t flex items-center justify-between gap-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setUserAnswers({});
                    setEvalResult(null);
                  }}
                  disabled={answered === 0 && !evalResult}
                >
                  <RotateCcw /> Clear answers
                </Button>
                <Button onClick={handleQuizSubmit} disabled={quizSubmitting || answered === 0}>
                  {quizSubmitting && <Loader2 className="animate-spin" />}
                  Score my answers
                  {!quizSubmitting && <ArrowRight />}
                </Button>
              </div>

              {quizError && (
                <div role="alert" className="px-6 pb-4 text-sm text-danger">
                  {quizError} Check the backend is running, then try again.
                </div>
              )}

              {evalResult && (
                <section className="border-t" aria-live="polite" aria-label="Result">
                  <div className={`px-5 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-2 ${toneSoft[wordTone(evalResult.risk_level)]}`}>
                    <h3 className="font-medium text-sm">{evalResult.label}</h3>
                    <span className="num text-sm">
                      {evalResult.total_score} / {evalResult.max_possible_score} pts · {evalResult.risk_level} risk
                    </span>
                  </div>
                  <div className="px-5 sm:px-6 py-4 grid md:grid-cols-2 gap-6 text-sm leading-relaxed">
                    <div>
                      <h4 className="text-sm font-medium mb-1">What it means</h4>
                      <p className="text-muted-foreground">{evalResult.clinical_interpretation}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">What to do next</h4>
                      <p className="text-muted-foreground">{evalResult.recommended_actions}</p>
                    </div>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      )}

      {/* MICROHABITS */}
      {activeTab === 'microhabits' && (
        <div className="space-y-4">
          <div className="segmented overflow-x-auto no-scrollbar max-w-full" role="radiogroup" aria-label="Health driver">
            {DRIVERS.map((d) => (
              <button
                key={d}
                role="radio"
                aria-checked={selectedDriver === d}
                onClick={() => setSelectedDriver(d)}
                className="shrink-0"
              >
                {d}
              </button>
            ))}
          </div>
          <ol className="card divide-y" aria-label={`MY GOAL DO IT steps for ${selectedDriver}`}>
            {microhabits.map((mh) => (
              <li key={mh.id} className="px-5 py-4 grid grid-cols-[2rem_1fr] gap-x-3">
                <span className="font-display text-2xl leading-none text-primary" aria-hidden>
                  {mh.letter}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium">
                    <span className="sr-only">{mh.letter}: </span>
                    {mh.microhabit_text}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{mh.step_name}</p>
                  {mh.implementation_tip && (
                    <p className="text-sm text-muted-foreground mt-1.5 max-w-[65ch]">Tip: {mh.implementation_tip}</p>
                  )}
                </div>
              </li>
            ))}
            {microhabits.length === 0 && !loadError && (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">Loading microhabits…</li>
            )}
          </ol>
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
              <span key="d" className="text-sm">{s.typical_dosage_and_notes}</span>,
              <span key="i" className="text-muted-foreground">{s.primary_indications}</span>,
            ])}
            keys={supplements.map((s) => s.id)}
          />
          <DataTable
            title="Lab biomarkers"
            headers={['Test', 'Coverage', 'Target system', 'Clinical significance']}
            rows={labs.map((l) => [
              <span key="n" className="font-medium whitespace-nowrap">{l.test_name}</span>,
              <Badge
                key="c"
                variant="outline"
                className={`rounded-md border-transparent ${
                  l.coverage_category.includes('Insurance') ? 'bg-ok/10 text-ok' : 'bg-lmf/10 text-lmf'
                }`}
              >
                {l.coverage_category}
              </Badge>,
              l.target_system,
              <span key="s" className="text-muted-foreground">{l.clinical_significance}</span>,
            ])}
            keys={labs.map((l) => l.id)}
          />
        </div>
      )}
    </div>
  );
};

const MedicalNotice = () => (
  <div role="note" className="flex gap-3 rounded-lg border border-warn/30 bg-warn/[0.06] px-4 py-3 text-sm leading-relaxed">
    <Info className="w-4 h-4 text-warn shrink-0 mt-0.5" />
    <p>
      <span className="font-medium">Educational screening, not medical advice.</span>{' '}
      <span className="text-muted-foreground">
        These questionnaires and protocols come from the LiveWell framework and cannot diagnose any condition. Talk
        to a qualified clinician before acting on a result, starting a supplement or ordering lab tests, and seek
        urgent care for severe or sudden symptoms.
      </span>
    </p>
  </div>
);

const Routine = ({ icon: Icon, title, text }: { icon: React.ElementType; title: string; text?: string }) => (
  <div>
    <h3 className="flex items-center gap-1.5 text-sm font-medium mb-1.5">
      <Icon className="size-4 text-muted-foreground" aria-hidden /> {title}
    </h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{text || 'No guidance listed.'}</p>
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
    <h2 className="px-5 py-3.5 border-b text-base font-semibold">{title}</h2>
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs text-muted-foreground border-b">
            {headers.map((h) => (
              <th key={h} className="px-5 py-2.5 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
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
              <td colSpan={headers.length} className="px-5 py-8 text-center text-muted-foreground">
                Loading…
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
