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
    <div className="w-8 h-8 rounded-lg bg-foreground text-background grid place-items-center">
      <Shield className="w-4 h-4" strokeWidth={2.25} />
    </div>
    <div className="leading-tight">
      <div className="font-display text-[17px] tracking-tight">Sprint Shield</div>
      <div className="text-xs text-muted-foreground">IT2 fuzzy load manager</div>
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
      <aside className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0 border-r bg-card px-4 py-5">
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
                  active ? 'bg-sunken text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-sunken/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-primary' : ''}`} />
                <span className="flex-1 text-sm font-medium">{t.label}</span>
                {t.id === 'today' && deferredCount > 0 && (
                  <span className="num text-xs px-1.5 rounded-md bg-warn/15 text-warn" aria-label={`${deferredCount} deferred`}>
                    {deferredCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          {profileControl && <div className="-mx-1">{profileControl(false)}</div>}
          <div className="border-t pt-4 px-1">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-muted-foreground">Load</span>
              <span className="text-xs text-muted-foreground">
                {score === null ? 'waiting for engine' : scoreLabel(score).toLowerCase()}
              </span>
            </div>
            <div className={`font-display text-[28px] leading-tight num ${score === null ? 'text-faint' : toneText[tone]}`}>
              {score === null ? '–' : score.toFixed(1)}
            </div>
            <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full ${toneBg[tone]} transition-[width] duration-500 ease-out-expo`}
                style={{ width: `${score ?? 0}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
      <header className="lg:hidden sticky top-0 z-30 bg-background/90 backdrop-blur border-b">
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
              className={`shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium ${
                activeTab === t.id ? 'bg-foreground text-background' : 'text-muted-foreground'
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
