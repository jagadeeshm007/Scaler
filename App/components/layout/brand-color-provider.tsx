'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useUserProfile } from '@/hooks/queries/use-user-profile';

export function BrandColorProvider() {
  const { data: user } = useUserProfile();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // We expect user settings to be attached via the relation query
    const settings = (user as unknown as { settings?: Record<string, string> })?.settings;
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
