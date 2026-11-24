'use client';

import React from 'react';
import { CalendarCheck, LineChart, BookOpen, Library, Shield } from 'lucide-react';
import { ThemeToggle, scoreTone, scoreLabel, toneText, toneBg } from './ui';

export type TabType = 'today' | 'inference' | 'method' | 'library';

const TABS: { id: TabType; label: string; icon: React.ElementType; hint: string }[] = [
  { id: 'today', label: 'Today', icon: CalendarCheck, hint: 'Check-in & plan' },
  { id: 'inference', label: 'Inference', icon: LineChart, hint: 'FOU & rule firings' },
  { id: 'method', label: 'Method', icon: BookOpen, hint: 'Sets & rationale' },
  { id: 'library', label: 'LiveWell library', icon: Library, hint: 'Habits & screening' },
];

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  deferredCount: number;
  score: number | null;
  online: boolean | null;
  /** Renders the profile switcher; `compact` is used in the mobile top bar. */
  profileControl?: (compact: boolean) => React.ReactNode;
}

const Brand = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-lg bg-ink text-bg grid place-items-center">
      <Shield className="w-4 h-4" strokeWidth={2.25} />
    </div>
    <div className="leading-tight">
      <div className="font-display text-[17px] tracking-tight">Sprint Shield</div>
      <div className="text-[11px] text-faint">IT2 fuzzy load manager</div>
    </div>
  </div>
);

export const SidebarNav: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  deferredCount,
  score,
  online,
  profileControl,
}) => {
  const tone = scoreTone(score);
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r border-line bg-surface/60 px-4 py-5">
        <Brand />

        <nav className="mt-8 space-y-0.5" aria-label="Sections">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                aria-current={active ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors ${
                  active ? 'bg-sunken text-ink' : 'text-muted hover:text-ink hover:bg-sunken/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-accent' : ''}`} />
                <span className="flex-1 text-[13.5px] font-medium">{t.label}</span>
                {t.id === 'today' && deferredCount > 0 && (
                  <span className="num text-[11px] px-1.5 rounded bg-warn/15 text-warn">{deferredCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          {profileControl && <div className="-mx-1">{profileControl(false)}</div>}
          <div className="rounded-xl border border-line bg-surface p-3.5">
            <div className="eyebrow">Cognitive load</div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`font-display text-3xl num ${score === null ? 'text-faint' : toneText[tone]}`}>
                {score === null ? '—' : score.toFixed(1)}
              </span>
              <span className="text-xs text-faint">/100</span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-sunken overflow-hidden">
              <div
                className={`h-full ${toneBg[tone]} transition-all duration-500`}
                style={{ width: `${score ?? 0}%` }}
              />
            </div>
            <div className="text-[12px] text-muted mt-2">{score === null ? 'Waiting for engine' : scoreLabel(score)}</div>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5 text-[12px] text-muted">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  online === null ? 'bg-faint' : online ? 'bg-ok' : 'bg-danger'
                }`}
              />
              {online === null ? 'Connecting…' : online ? 'Engine online' : 'Engine offline'}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-30 bg-bg/90 backdrop-blur border-b border-line">
        <div className="flex items-center justify-between px-4 h-14">
          <Brand />
          <div className="flex items-center gap-2">
            {score !== null && (
              <span className={`num font-display text-xl ${toneText[tone]}`}>{score.toFixed(0)}</span>
            )}
            <ThemeToggle />
            {profileControl?.(true)}
          </div>
        </div>
        <nav className="flex gap-1 px-3 pb-2 overflow-x-auto no-scrollbar" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              aria-current={activeTab === t.id ? 'page' : undefined}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[13px] font-medium ${
                activeTab === t.id ? 'bg-ink text-bg' : 'text-muted'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>
    </>
  );
};
