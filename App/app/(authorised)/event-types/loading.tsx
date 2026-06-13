import { PageSection } from '@/components/shared/page-section';
import { Skeleton } from '@/components/ui/skeleton';

export default function EventTypesLoading() {
  return (
    <PageSection className="flex min-h-full flex-1 flex-col pb-24 md:pb-6">
      <div className="hidden shrink-0 items-start justify-between gap-4 px-6 pt-6 pb-5 md:flex">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-36 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
      <Skeleton className="mx-4 mt-0 h-10 shrink-0 rounded-md md:hidden" />
      <Skeleton className="mx-4 mt-4 mb-4 h-72 shrink-0 rounded-xl md:mx-6 md:mt-5 md:mb-6" />
    </PageSection>
  );
}
