'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

interface BookingsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function BookingsError({ error, reset }: BookingsErrorProps) {
  useEffect(() => {
    console.error('[bookings]', error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6">
      <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        We couldn&apos;t load your bookings. Please try again.
      </p>
      <Button onClick={reset} className="mt-6">
        Try again
      </Button>
    </main>
  );
}
