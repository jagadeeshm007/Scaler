'use client';

import { useCallback, useEffect, useState } from 'react';

function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

export function useTimezone(defaultTimezone?: string) {
  const [timezone, setTimezone] = useState(defaultTimezone ?? 'UTC');
  const [isDetected, setIsDetected] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setTimezone(defaultTimezone ?? detectTimezone());
      setIsDetected(true);
    });
  }, [defaultTimezone]);

  const resetTimezone = useCallback(() => {
    setTimezone(detectTimezone());
  }, []);

  return { timezone, setTimezone, resetTimezone, isDetected };
}
