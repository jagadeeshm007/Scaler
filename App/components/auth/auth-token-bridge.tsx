'use client';

import { useLayoutEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';

interface AuthTokenBridgeProps {
  accessToken: string;
}

export function AuthTokenBridge({ accessToken }: AuthTokenBridgeProps) {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  useLayoutEffect(() => {
    setAccessToken(accessToken);
  }, [accessToken, setAccessToken]);

  return null;
}
