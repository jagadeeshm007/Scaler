'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

interface AvailabilityErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AvailabilityError({ error, reset }: AvailabilityErrorProps) {
  useEffect(() => {
    console.error('[availability]', error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We couldn&apos;t load your availability schedules. Please try again.
      </p>
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </main>
  );
}
