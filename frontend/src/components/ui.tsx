'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export const CRITICAL_THRESHOLD = 65;
export const MODERATE_THRESHOLD = 35;

export type Tone = 'ok' | 'warn' | 'danger';

export function scoreTone(score: number | null): Tone {
  if (score === null) return 'ok';
  if (score > CRITICAL_THRESHOLD) return 'danger';
  if (score > MODERATE_THRESHOLD) return 'warn';
  return 'ok';
}

export function scoreLabel(score: number | null): string {
  const t = scoreTone(score);
  return t === 'danger' ? 'Critical load' : t === 'warn' ? 'Moderate load' : 'Low load';
}

export const toneText: Record<Tone, string> = {
  ok: 'text-ok',
  warn: 'text-warn',
  danger: 'text-danger',
};
export const toneBg: Record<Tone, string> = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
};
export const toneSoft: Record<Tone, string> = {
  ok: 'bg-ok/10 text-ok',
  warn: 'bg-warn/10 text-warn',
  danger: 'bg-danger/10 text-danger',
};

/** Maps a consequent / risk word ("Low", "Moderate", "Critical", "High", "Severe") to a tone. */
export function wordTone(word: string): Tone {
  const w = word.toLowerCase();
  if (w.includes('critical') || w.includes('high') || w.includes('severe')) return 'danger';
  if (w.includes('moderate')) return 'warn';
  return 'ok';
}

export const ToneTag: React.FC<{ word: string; children?: React.ReactNode }> = ({ word, children }) => (
  <span className={`tag ${toneSoft[wordTone(word)]}`}>{children ?? word}</span>
);

/** Reads token colors from CSS so canvas/SVG libraries (Recharts) follow the theme. */
export function useTokenColors() {
  const read = () => {
    if (typeof window === 'undefined') return null;
    const s = getComputedStyle(document.documentElement);
    const c = (n: string) => `rgb(${s.getPropertyValue(`--${n}`).trim().split(' ').join(',')})`;
    return {
      accent: c('accent'),
      lmf: c('lmf'),
      ok: c('ok'),
      warn: c('warn'),
      danger: c('danger'),
      line: c('line'),
      muted: c('muted'),
      faint: c('faint'),
      surface: c('surface'),
      ink: c('ink'),
    };
  };
  const [colors, setColors] = useState(read);
  useEffect(() => {
    setColors(read());
    const obs = new MutationObserver(() => setColors(read()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return colors;
}

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains('dark')), []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('fss-theme', next ? 'dark' : 'light');
    } catch {}
  };
  return (
    <button
      onClick={toggle}
      className={`btn-ghost !px-2 ${className}`}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
    >
      {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
};

export const SectionHeader: React.FC<{
  eyebrow?: string;
  title: string;
  description?: string;
  right?: React.ReactNode;
}> = ({ eyebrow, title, description, right }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
    <div>
      {eyebrow && <div className="eyebrow mb-1">{eyebrow}</div>}
      <h2 className="font-display text-[26px] leading-tight tracking-tight">{title}</h2>
      {description && <p className="text-sm text-muted mt-1 max-w-2xl">{description}</p>}
    </div>
    {right}
  </div>
);

export function formatMinutes(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}
