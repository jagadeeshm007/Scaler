'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

import { useUserProfile } from '@/hooks/queries/use-user-profile';
import { applyBrandColors } from '@/lib/brand-color';
import type { ThemeOption } from '@/lib/constants/theme';
import { useUIStore } from '@/store/ui.store';

export function BrandColorProvider() {
  const { data: user } = useUserProfile();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    applyBrandColors(document.documentElement, user?.settings ?? null, resolvedTheme);
  }, [user?.settings, resolvedTheme]);

  return null;
}

interface ThemeHydratorProps {
  initialTheme?: ThemeOption;
}

export function ThemeHydrator({ initialTheme = 'system' }: ThemeHydratorProps) {
  const { data: user } = useUserProfile();
  const { setTheme } = useTheme();
  const setUITheme = useUIStore((state) => state.setTheme);

  const theme = user?.settings?.theme ?? initialTheme;

  useEffect(() => {
    setTheme(theme);
    setUITheme(theme);
  }, [theme, setTheme, setUITheme]);

  return null;
}
