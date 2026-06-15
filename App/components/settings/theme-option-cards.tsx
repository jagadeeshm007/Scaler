'use client';

import { Check } from 'lucide-react';

import type { ThemeOption } from '@/lib/constants/theme';
import { THEME_LABELS } from '@/lib/constants/theme';
import { cn } from '@/lib/utils';

interface ThemeOptionCardsProps {
  value: ThemeOption;
  onChange: (value: ThemeOption) => void;
}

function ThemePreview({ option }: { option: ThemeOption }) {
  if (option === 'system') {
    return (
      <div className="flex h-20 overflow-hidden rounded-md border border-border">
        <div className="flex-1 bg-background p-2">
          <div className="h-2 w-8 rounded bg-foreground/20" />
          <div className="mt-2 h-2 w-12 rounded bg-foreground/10" />
        </div>
        <div className="flex-1 bg-card p-2">
          <div className="h-2 w-8 rounded bg-foreground/70" />
          <div className="mt-2 h-2 w-12 rounded bg-foreground/40" />
        </div>
      </div>
    );
  }

  const isDark = option === 'dark';

  return (
    <div
      className={cn(
        'h-20 rounded-md border border-border p-2',
        isDark ? 'bg-card' : 'bg-background',
      )}
    >
      <div className={cn('h-2 w-8 rounded', isDark ? 'bg-foreground/70' : 'bg-foreground/20')} />
      <div
        className={cn('mt-2 h-2 w-12 rounded', isDark ? 'bg-foreground/40' : 'bg-foreground/10')}
      />
    </div>
  );
}

export function ThemeOptionCards({ value, onChange }: ThemeOptionCardsProps) {
  const options: ThemeOption[] = ['system', 'light', 'dark'];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((option) => {
        const selected = value === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              'rounded-xl border p-3 text-left transition-colors',
              selected
                ? 'border-primary bg-primary/10'
                : 'border-border bg-card hover:border-primary/40 hover:bg-primary/5',
            )}
          >
            <ThemePreview option={option} />
            <div className="mt-3 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground">{THEME_LABELS[option]}</span>
              <span
                className={cn(
                  'flex size-4 items-center justify-center rounded-full border',
                  selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
                )}
              >
                {selected ? <Check className="size-2.5" /> : null}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
