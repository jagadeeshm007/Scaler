'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { Button } from '@/components/ui/button';

interface AsyncBoundaryProps {
  children: React.ReactNode;
  skeleton: React.ReactNode;
  fallback?: React.ReactNode;
}

function DefaultErrorFallback({
  error,
  resetErrorBoundary,
}: {
  error: Error;
  resetErrorBoundary: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <p className="text-sm text-red-400">{error.message || 'Something went wrong'}</p>
      <Button variant="outline" size="sm" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
}

export function AsyncBoundary({ children, skeleton, fallback }: AsyncBoundaryProps) {
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) =>
        fallback ?? <DefaultErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />
      }
    >
      <Suspense fallback={skeleton}>{children}</Suspense>
    </ErrorBoundary>
  );
}
