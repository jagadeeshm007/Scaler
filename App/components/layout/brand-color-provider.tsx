'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/auth.store';

export function BrandColorProvider() {
  const user = useAuthStore((s) => s.user);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // We expect user settings to be attached via the relation query
    const settings = (user as any)?.settings;
    if (!settings) return;

    const root = document.documentElement;
    const brandColorLight = settings.brand_color_light || '#111111';
    const brandColorDark = settings.brand_color_dark || '#eeeeee';

    // Apply the correct color based on the resolved theme
    if (resolvedTheme === 'dark') {
      root.style.setProperty('--primary', brandColorDark);
    } else {
      root.style.setProperty('--primary', brandColorLight);
    }
  }, [user, resolvedTheme]);

  return null;
}
