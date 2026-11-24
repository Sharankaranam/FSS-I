'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { cn } from '../lib/utils';

import { CRITICAL_THRESHOLD, MODERATE_THRESHOLD } from '../utils/plan';
export { CRITICAL_THRESHOLD, MODERATE_THRESHOLD };

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

/** Watermelon Badge tinted by load/risk tone. */
export const ToneBadge: React.FC<{ tone: Tone; className?: string; children: React.ReactNode }> = ({
  tone,
  className,
  children,
}) => (
  <Badge variant="outline" className={cn('border-transparent rounded-md font-medium', toneSoft[tone], className)}>
    {children}
  </Badge>
);

export const ToneTag: React.FC<{ word: string; children?: React.ReactNode }> = ({ word, children }) => (
  <ToneBadge tone={wordTone(word)}>{children ?? word}</ToneBadge>
);

/** Reads token colors from CSS so canvas/SVG libraries (Recharts) follow the theme. */
export function useTokenColors() {
  const read = () => {
    if (typeof window === 'undefined') return null;
    const s = getComputedStyle(document.documentElement);
    const c = (n: string) => `oklch(${s.getPropertyValue(`--${n}`).trim()})`;
    return {
      accent: c('primary'),
      lmf: c('lmf'),
      ok: c('ok'),
      warn: c('warn'),
      danger: c('danger'),
      line: c('border'),
      muted: c('muted-foreground'),
      faint: c('faint'),
      surface: c('card'),
      ink: c('foreground'),
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
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={toggle}
      className={cn('text-muted-foreground', className)}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={dark ? 'Light theme' : 'Dark theme'}
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  );
};

/** Page-level heading for each view. Renders the view's h1; no kicker label above it. */
export const SectionHeader: React.FC<{
  title: string;
  description?: string;
  right?: React.ReactNode;
}> = ({ title, description, right }) => (
  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
    <div>
      <h1 className="font-display text-[32px] leading-[1.1] tracking-[-0.02em]">{title}</h1>
      {description && <p className="text-[15px] text-muted-foreground mt-2 max-w-[65ch]">{description}</p>}
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
