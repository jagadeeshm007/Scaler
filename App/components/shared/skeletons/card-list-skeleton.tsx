import { Skeleton } from '@/components/ui/skeleton';
import { SURFACE } from '@/components/shared/page-section';
import { cn } from '@/lib/utils';

export function CardListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div
      className={cn(
        'mx-4 mb-4 shrink-0 overflow-hidden rounded-xl border md:mx-6 md:mb-6',
        SURFACE.sectionBorder,
        SURFACE.innerList,
      )}
    >
      <div className="divide-y divide-border">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4 sm:mt-0">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
