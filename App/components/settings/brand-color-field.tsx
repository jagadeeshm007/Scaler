'use client';

import { RotateCcw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { normalizeHexColor } from '@/lib/brand-color';
import { cn } from '@/lib/utils';

interface BrandColorFieldProps {
  id: string;
  label: string;
  value: string;
  defaultValue: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function BrandColorField({
  id,
  label,
  value,
  defaultValue,
  onChange,
  disabled = false,
}: BrandColorFieldProps) {
  const normalized = normalizeHexColor(value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <label
          htmlFor={`${id}-picker`}
          className={cn(
            'relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-md border border-border',
            disabled && 'pointer-events-none opacity-50',
          )}
        >
          <span className="absolute inset-0" style={{ backgroundColor: normalized }} aria-hidden />
          <input
            id={`${id}-picker`}
            type="color"
            value={normalized}
            disabled={disabled}
            onChange={(event) => onChange(normalizeHexColor(event.target.value))}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </label>
        <Input
          id={id}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="font-mono uppercase"
          spellCheck={false}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          aria-label={`Reset ${label}`}
          onClick={() => onChange(defaultValue)}
        >
          <RotateCcw className="size-4" />
        </Button>
      </div>
    </div>
  );
}
