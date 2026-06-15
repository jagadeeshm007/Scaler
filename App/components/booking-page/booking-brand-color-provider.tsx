'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

import { applyBrandColors, clearBrandColors } from '@/lib/brand-color';
import type { PublicEventType } from '@/types';

interface BookingBrandColorProviderProps {
  eventType: PublicEventType;
}

export function BookingBrandColorProvider({ eventType }: BookingBrandColorProviderProps) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    applyBrandColors(document.documentElement, eventType.user.settings ?? null, resolvedTheme);
    return () => {
      clearBrandColors(document.documentElement);
    };
  }, [eventType.user.settings, resolvedTheme]);

  return null;
}
