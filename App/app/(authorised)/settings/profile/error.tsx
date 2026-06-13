'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

interface ProfileSettingsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ProfileSettingsError({ error, reset }: ProfileSettingsErrorProps) {
  useEffect(() => {
    void error;
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-16 text-center">
      <h1 className="text-lg font-semibold text-white">Failed to load profile</h1>
      <p className="text-sm text-neutral-400">Something went wrong while loading your profile.</p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          Try again
        </Button>
        <Button asChild variant="ghost">
          <Link href={ROUTES.settings}>Back to settings</Link>
        </Button>
      </div>
    </div>
  );
}
