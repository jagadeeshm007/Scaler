import { LoadingSkeleton } from '@/components/shared/loading-skeleton';

export default function EventTypesLoading() {
  return (
    <div className="space-y-4 px-4 pt-4 md:px-8 md:pt-8">
      <LoadingSkeleton count={1} className="hidden h-8 md:block" />
      <LoadingSkeleton count={1} className="h-10 rounded-xl" />
      <LoadingSkeleton count={4} className="rounded-2xl" />
    </div>
  );
}
