'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

interface AvailabilityEditErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AvailabilityEditError({ error, reset }: AvailabilityEditErrorProps) {
  useEffect(() => {
    console.error('[availability/[id]]', error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We couldn&apos;t load this schedule. It may have been deleted or you don&apos;t have access.
      </p>
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </main>
  );
}
