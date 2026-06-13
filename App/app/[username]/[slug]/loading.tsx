import { Skeleton } from '@/components/ui/skeleton';

export default function BookingPageLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Skeleton className="h-[480px] w-full rounded-xl" />
    </div>
  );
}
