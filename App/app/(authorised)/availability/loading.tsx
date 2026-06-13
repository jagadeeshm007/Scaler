import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

export default function AvailabilityLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-36 animate-pulse rounded-md bg-neutral-800" />
        <div className="h-4 w-72 animate-pulse rounded-md bg-neutral-800" />
      </div>
      <LoadingSkeleton count={3} className="h-20" />
    </main>
  );
}
