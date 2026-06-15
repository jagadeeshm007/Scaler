'use client';

import { useLayoutEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

export function AuthHydration() {
  const hydrate = useAuthStore((s) => s.hydrate);

  useLayoutEffect(() => {
    void hydrate();
  }, [hydrate]);

  return null;
}
