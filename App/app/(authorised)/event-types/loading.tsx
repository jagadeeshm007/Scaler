import { Skeleton } from '@/components/ui/skeleton';

export default function EventTypesLoading() {
  return (
    <div className="flex flex-col gap-3 md:gap-5">
      {/* desktop header skeleton */}
      <div className="hidden items-start justify-between gap-4 md:flex">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-36 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
      {/* mobile search skeleton */}
      <Skeleton className="h-10 w-full rounded-md md:hidden" />
      {/* list card skeleton */}
      <Skeleton className="h-[320px] w-full rounded-xl" />
    </div>
  );
}
