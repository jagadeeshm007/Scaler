import { Skeleton } from '@/components/ui/skeleton';

export function BookingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-4"
        >
          <Skeleton className="hidden h-14 w-14 shrink-0 sm:block" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-9 w-20" />
          <Skeleton className="size-8 rounded-md" />
        </div>
      ))}
    </div>
  );
}
