'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChevronsUpDown, Check, Plus, Pencil } from 'lucide-react';
import type { Profile } from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

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
        aria-label={compact ? `Profile: ${profile?.name ?? 'loading'}` : undefined}
        className={`flex items-center gap-2 rounded-lg hover:bg-sunken transition-colors ${
          compact ? 'p-1' : 'w-full px-2 py-1.5'
        }`}
      >
        <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-medium grid place-items-center shrink-0">
          {initial}
        </span>
        {!compact && (
          <>
            <span className="flex-1 text-left text-sm truncate">{profile?.name ?? 'Loading…'}</span>
            <ChevronsUpDown className="size-3.5 text-muted-foreground" />
          </>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute z-50 w-60 card shadow-pop p-1.5 ${
            compact ? 'right-0 top-full mt-1' : 'left-0 bottom-full mb-1'
          }`}
        >
          {mode === 'list' ? (
            <>
              <div className="label px-2 pt-1 pb-1.5" id="profiles-heading">Profiles</div>
              {profiles.map((p) => (
                <button
                  key={p.id}
                  role="menuitem"
                  onClick={() => {
                    onSwitch(p.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm hover:bg-sunken text-left"
                >
                  <span className="flex-1 truncate">{p.name}</span>
                  {p.id === profile?.id && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
              <div className="h-px bg-border my-1" />
              <button
                role="menuitem"
                onClick={() => {
                  setName(profile?.name ?? '');
                  setMode('rename');
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-sunken hover:text-foreground"
              >
                <Pencil className="w-3.5 h-3.5" /> Rename profile
              </button>
              <button
                role="menuitem"
                onClick={() => {
                  setName('');
                  setMode('create');
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-sunken hover:text-foreground"
              >
                <Plus className="w-3.5 h-3.5" /> New profile
              </button>
            </>
          ) : (
            <form onSubmit={submit} className="p-1.5 space-y-2">
              <Label htmlFor="profile-name">{mode === 'create' ? 'New profile name' : 'Profile name'}</Label>
              <Input
                id="profile-name"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder="e.g. Sam"
              />
              <div className="flex justify-end gap-1 pt-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => setMode('list')}>
                  Back
                </Button>
                <Button type="submit" size="sm" disabled={!name.trim()}>
                  {mode === 'create' ? 'Create profile' : 'Save name'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
