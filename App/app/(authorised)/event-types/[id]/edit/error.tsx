'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/button';

interface EditEventTypeErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function EditEventTypeError({ error, reset }: EditEventTypeErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
      <p className="mt-2 max-w-md text-sm text-neutral-400">
        We could not load this event type. It may have been deleted or you may not have access.
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
