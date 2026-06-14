import { Skeleton } from '@/components/ui/skeleton';

export default function EditEventTypeLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-6 py-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48 bg-neutral-800" />
        <Skeleton className="h-4 w-72 bg-neutral-800" />
      </div>
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24 bg-neutral-800" />
          <Skeleton className="h-10 w-full bg-neutral-800" />
        </div>
      ))}
      <Skeleton className="h-10 w-32 bg-neutral-800" />
    </div>
  );
}
