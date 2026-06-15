'use client';

import { Button } from '@/components/ui/button';

export default function AppsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <p className="text-sm text-red-400">Failed to load integrations</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
