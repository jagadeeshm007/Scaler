'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';

import { applyResolvedThemeClass } from '@/lib/theme';

/**
 * Keeps the dashboard in sync with OS light/dark changes when preference is "system".
 * next-themes listens too, but we apply the class directly so GNOME/KDE toggles are reliable.
 */
export function SystemThemeWatcher() {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (theme !== 'system') return;

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const syncWithSystem = () => {
      applyResolvedThemeClass(media.matches);
      setTheme('system');
    };

    syncWithSystem();
    media.addEventListener('change', syncWithSystem);

    return () => media.removeEventListener('change', syncWithSystem);
  }, [theme, setTheme]);

  return null;
}
