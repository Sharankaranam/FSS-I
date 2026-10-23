'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  HeartPulse,
  Dna,
  ShieldAlert,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Pill,
  TestTube,
  BookMarked,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
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

export const LiveWellDatabaseViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'habits' | 'quizzes' | 'microhabits' | 'supplements'>('habits');
  
  // Habits state
  const [habits, setHabits] = useState<LiveWellHabit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<LiveWellHabit | null>(null);

  // Quizzes state
  const [quizList, setQuizList] = useState<any[]>([]);
  const [selectedQuizCode, setSelectedQuizCode] = useState<string>('INSULIN_RESISTANCE');
  const [activeQuiz, setActiveQuiz] = useState<LiveWellQuizDetail | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [evalResult, setEvalResult] = useState<LiveWellQuizEvaluationResult | null>(null);
  const [quizSubmitting, setQuizSubmitting] = useState<boolean>(false);

  // Microhabits state
  const [microhabits, setMicrohabits] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<string>('Gut Health');

  // Supplements & Labs state
  const [supplements, setSupplements] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);

  useEffect(() => {
    // Initial fetch of habits and quiz list
    fetchLiveWellHabits().then((data) => {
      setHabits(data);
      if (data.length > 0) setSelectedHabit(data[0]);
    }).catch((e) => console.error(e));

    fetchLiveWellQuizzes().then((data) => {
      setQuizList(data);
    }).catch((e) => console.error(e));
  }, []);

  // When selectedQuizCode changes, fetch its full details
  useEffect(() => {
    if (activeTab === 'quizzes' && selectedQuizCode) {
      setEvalResult(null);
      setUserAnswers({});
      fetchLiveWellQuiz(selectedQuizCode).then((q) => {
        setActiveQuiz(q);
      }).catch((e) => console.error(e));
    }
  }, [activeTab, selectedQuizCode]);

  // When microhabits tab activated
  useEffect(() => {
    if (activeTab === 'microhabits') {
      fetchLiveWellMicrohabits(selectedDriver).then(setMicrohabits).catch(console.error);
    }
  }, [activeTab, selectedDriver]);

  // When supplements tab activated
  useEffect(() => {
    if (activeTab === 'supplements') {
      fetchLiveWellSupplements().then(setSupplements).catch(console.error);
      fetchLiveWellLabs().then(setLabs).catch(console.error);
    }
  }, [activeTab]);

  const handleAnswerChange = (qNum: number, value: any) => {
    setUserAnswers((prev) => ({
      ...prev,
      [qNum]: value,
    }));
  };

  const handleQuizSubmit = async () => {
    if (!selectedQuizCode) return;
    setQuizSubmitting(true);
    try {
      const res = await evaluateLiveWellQuiz(selectedQuizCode, userAnswers);
      setEvalResult(res);
    } catch (e: any) {
      console.error(e);
      alert('Error evaluating quiz: ' + e.message);
    } finally {
      setQuizSubmitting(false);
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-6 mb-8 border border-teal-500/30 shadow-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/95">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
              <HeartPulse className="w-3.5 h-3.5 text-emerald-400" />
              Dr. Murthy Gokula Clinical Database
            </span>
            <span className="text-xs text-slate-400">&bull; LiveWell Longevity Framework</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-emerald-400" />
            LIVE WELL: 8 Habits &amp; Clinical Knowledge Engine
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Database of 8 Habits (Superheroes), 7 Clinical Risk Quizzes, MY GOAL DO IT Microhabits, and Therapeutic Protocols.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-950/90 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('habits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'habits'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            8 Superheroes / Habits
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'quizzes'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Clinical Quizzes (7)
          </button>
          <button
            onClick={() => setActiveTab('microhabits')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'microhabits'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MY GOAL DO IT Habits
          </button>
          <button
            onClick={() => setActiveTab('supplements')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'supplements'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Supplements &amp; Labs
          </button>
        </div>
      </div>

      {/* TAB 1: 8 HABITS / SUPERHEROES */}
      {activeTab === 'habits' && (
        <div className="space-y-6">
          {/* Superhero Selector Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {habits.map((h) => {
              const isSelected = selectedHabit?.id === h.id;
              return (
                <button
                  key={h.id}
                  onClick={() => setSelectedHabit(h)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-emerald-400 font-bold">
                      Habit #{h.habit_number}
                    </span>
                    <Flame className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`} />
                  </div>
                  <div className="font-bold text-xs text-white line-clamp-1">{h.superhero_name}</div>
                  <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{h.domain}</div>
                </button>
              );
            })}
          </div>

          {/* Selected Superhero Detailed Card */}
          {selectedHabit && (
            <div className="bg-slate-900/70 rounded-xl p-5 border border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="text-xs font-mono text-emerald-400 font-semibold uppercase tracking-wider">
                    Habit #{selectedHabit.habit_number} &bull; {selectedHabit.domain}
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                    {selectedHabit.superhero_name}
                  </h3>
                  <p className="text-xs text-slate-300 italic mt-0.5">&ldquo;{selectedHabit.tagline}&rdquo;</p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{selectedHabit.description}</p>

              {/* Superpower Check */}
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 text-xs">
                <div className="font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Your Super Power Check:
                </div>
                <p className="text-emerald-100/90 leading-relaxed">{selectedHabit.superpower_check_questions}</p>
              </div>

              {/* Daily Super Hero Routine */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="font-bold text-cyan-400 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Morning Routine
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedHabit.morning_routine}</p>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> Meals &amp; Nutrition
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedHabit.meal_guidance}</p>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800">
                  <div className="font-bold text-purple-400 mb-1 flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5" /> Evening Wind-Down
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{selectedHabit.evening_wind_down}</p>
                </div>
              </div>

              {/* Synergy */}
              {selectedHabit.synergistic_helpers && (
                <div className="text-[11px] text-slate-400 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80">
                  <strong className="text-slate-300">Team Synergy: </strong>
                  {selectedHabit.synergistic_helpers}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CLINICAL SCREENING QUIZZES */}
      {activeTab === 'quizzes' && (
        <div className="space-y-6">
          {/* Quiz Selector Dropdown / Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {quizList.map((q) => (
              <button
                key={q.quiz_code}
                onClick={() => setSelectedQuizCode(q.quiz_code)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left flex items-center gap-2 ${
                  selectedQuizCode === q.quiz_code
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                <Dna className="w-3.5 h-3.5 text-cyan-400" />
                <span>{q.title.split('(')[0]}</span>
              </button>
            ))}
          </div>

          {activeQuiz && (
            <div className="bg-slate-900/70 rounded-xl p-5 border border-slate-800 space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <div className="text-xs font-mono text-cyan-400">{activeQuiz.chapter_source}</div>
                <h3 className="text-base font-bold text-white mt-0.5">{activeQuiz.title}</h3>
                <p className="text-xs text-slate-300 mt-1">{activeQuiz.instructions}</p>
              </div>

              {/* Quiz Questions List */}
              <div className="space-y-3">
                {activeQuiz.questions.map((q) => {
                  const currentValue = userAnswers[q.question_number];
                  return (
                    <div
                      key={q.id}
                      className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-cyan-400">Q{q.question_number}</span>
                          {q.category && (
                            <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                              {q.category}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-200 leading-relaxed">{q.question_text}</p>
                      </div>

                      {/* Options Radio / Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {q.options.map((opt, oIdx) => {
                          const isChecked = currentValue === opt.points;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleAnswerChange(q.question_number, opt.points)}
                              className={`px-3 py-1.5 rounded-lg font-medium text-xs border transition-all ${
                                isChecked
                                  ? 'bg-cyan-500/25 text-cyan-200 border-cyan-500/60 font-bold'
                                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                            >
                              {opt.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => {
                    setUserAnswers({});
                    setEvalResult(null);
                  }}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset Answers
                </button>

                <button
                  onClick={handleQuizSubmit}
                  disabled={quizSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                >
                  {quizSubmitting ? 'Evaluating...' : 'Evaluate Clinical Risk Score'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Evaluated Result Card */}
              {evalResult && (
                <div
                  className={`mt-4 p-5 rounded-xl border text-xs space-y-3 ${
                    evalResult.risk_level === 'High' || evalResult.risk_level === 'Severe'
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                      : evalResult.risk_level === 'Moderate'
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                      : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span className="font-bold text-sm">
                        Clinical Evaluation Result: {evalResult.label} ({evalResult.total_score} / {evalResult.max_possible_score} pts)
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10">
                      {evalResult.risk_level} Risk
                    </span>
                  </div>

                  <div>
                    <strong className="block mb-0.5 text-white">Clinical Interpretation:</strong>
                    <p className="leading-relaxed opacity-90">{evalResult.clinical_interpretation}</p>
                  </div>

                  <div>
                    <strong className="block mb-0.5 text-white">Recommended Medical &amp; Lifestyle Actions:</strong>
                    <p className="leading-relaxed opacity-90">{evalResult.recommended_actions}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MY GOAL DO IT MICROHABITS */}
      {activeTab === 'microhabits' && (
        <div className="space-y-5">
          {/* Driver Filter */}
          <div className="flex flex-wrap items-center gap-2">
            {['Gut Health', 'Inflammation', 'Insulin Resistance', 'Toxins'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDriver(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  selectedDriver === d
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {microhabits.map((mh) => (
              <div key={mh.id} className="p-3.5 bg-slate-900/70 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-purple-400">
                    Step {mh.letter}: {mh.step_name}
                  </span>
                  <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-950">
                    {mh.driver_name}
                  </span>
                </div>
                <p className="text-slate-200 font-medium">{mh.microhabit_text}</p>
                {mh.implementation_tip && (
                  <p className="text-[11px] text-slate-400 italic">Tip: {mh.implementation_tip}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SUPPLEMENTS & LABS */}
      {activeTab === 'supplements' && (
        <div className="space-y-6 text-xs">
          {/* Supplements Table */}
          <div>
            <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-sm">
              <Pill className="w-4 h-4 text-amber-400" />
              Evidence-Based Therapeutic Supplements (Table 5 &amp; Fullscript Protocols)
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Supplement</th>
                    <th className="p-3">Mechanism &amp; Clinical Evidence</th>
                    <th className="p-3">Typical Dosage &amp; Notes</th>
                    <th className="p-3">Primary Indications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
                  {supplements.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-amber-300 whitespace-nowrap">{s.name}</td>
                      <td className="p-3 text-[11px] leading-relaxed">{s.mechanism_and_evidence}</td>
                      <td className="p-3 text-[11px] font-mono text-slate-300">{s.typical_dosage_and_notes}</td>
                      <td className="p-3 text-[11px] text-slate-400">{s.primary_indications}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Labs Table */}
          <div className="mt-6">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-sm">
              <TestTube className="w-4 h-4 text-cyan-400" />
              Clinical Laboratory Biomarkers Directory
            </h3>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3">Laboratory Test</th>
                    <th className="p-3">Coverage Category</th>
                    <th className="p-3">Target Biological System</th>
                    <th className="p-3">Clinical Significance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 text-slate-300">
                  {labs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-900/40">
                      <td className="p-3 font-bold text-cyan-300 whitespace-nowrap">{l.test_name}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            l.coverage_category.includes('Insurance')
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {l.coverage_category}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-300">{l.target_system}</td>
                      <td className="p-3 text-[11px] text-slate-400 leading-relaxed">{l.clinical_significance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
