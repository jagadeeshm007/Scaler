import { Skeleton } from '@/components/ui/skeleton';

export default function AvailabilityEditLoading() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-6 h-8 w-64" />
      <Skeleton className="mb-8 h-32 w-full rounded-lg" />
      <div className="space-y-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    </main>
  );
}
