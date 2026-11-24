'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronsUpDown, Check, Plus, Pencil } from 'lucide-react';
import type { Profile } from '../utils/api';

interface ProfileSwitcherProps {
  profile: Profile | null;
  profiles: Profile[];
  onSwitch: (id: string) => void;
  onCreate: (name: string) => Promise<void>;
  onRename: (name: string) => Promise<void>;
  compact?: boolean;
}

export const ProfileSwitcher: React.FC<ProfileSwitcherProps> = ({
  profile,
  profiles,
  onSwitch,
  onCreate,
  onRename,
  compact = false,
}) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'list' | 'create' | 'rename'>('list');
  const [name, setName] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', esc);
    };
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (mode === 'create') await onCreate(name.trim());
    else await onRename(name.trim());
    setMode('list');
    setOpen(false);
  };

  const initial = profile?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen((o) => !o);
          setMode('list');
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-lg hover:bg-sunken transition-colors ${
          compact ? 'p-1' : 'w-full px-2 py-1.5'
        }`}
      >
        <span className="w-6 h-6 rounded-full bg-accent/15 text-accent text-[12px] font-medium grid place-items-center shrink-0">
          {initial}
        </span>
        {!compact && (
          <>
            <span className="flex-1 text-left text-[13px] truncate">{profile?.name ?? 'Loading…'}</span>
            <ChevronsUpDown className="w-3.5 h-3.5 text-faint" />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-50 w-60 card shadow-pop p-1.5 animate-rise ${
            compact ? 'right-0 top-full mt-1' : 'left-0 bottom-full mb-1'
          }`}
        >
          {mode === 'list' ? (
            <>
              <div className="eyebrow px-2 pt-1 pb-1.5">Profiles</div>
              {profiles.map((p) => (
                <button
                  key={p.id}
                  role="menuitem"
                  onClick={() => {
                    onSwitch(p.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] hover:bg-sunken text-left"
                >
                  <span className="flex-1 truncate">{p.name}</span>
                  {p.id === profile?.id && <Check className="w-3.5 h-3.5 text-accent" />}
                </button>
              ))}
              <div className="h-px bg-line my-1" />
              <button
                role="menuitem"
                onClick={() => {
                  setName(profile?.name ?? '');
                  setMode('rename');
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-muted hover:bg-sunken hover:text-ink"
              >
                <Pencil className="w-3.5 h-3.5" /> Rename profile
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setName('');
                  setMode('create');
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-[13px] text-muted hover:bg-sunken hover:text-ink"
              >
                <Plus className="w-3.5 h-3.5" /> New profile
              </button>
            </>
          ) : (
            <form onSubmit={submit} className="p-1.5 space-y-2">
              <label className="eyebrow block">{mode === 'create' ? 'New profile' : 'Rename profile'}</label>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder="Name"
                className="w-full bg-surface border border-line rounded-lg px-2.5 py-1.5 text-[13px] focus:outline-none focus:border-accent"
              />
              <div className="flex justify-end gap-1">
                <button type="button" onClick={() => setMode('list')} className="btn-ghost !py-1.5">
                  Back
                </button>
                <button type="submit" className="btn-primary !py-1.5">
                  {mode === 'create' ? 'Create' : 'Save'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
