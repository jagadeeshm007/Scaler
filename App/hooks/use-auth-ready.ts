'use client';

import { useAuthStore } from '@/store/auth.store';

export function useAuthReady() {
  return useAuthStore((s) => s.accessToken !== null);
}
