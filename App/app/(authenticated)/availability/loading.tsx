import { PageShell } from '@/components/layout/page-shell';
import { CardListSkeleton } from '@/components/shared/skeletons/card-list-skeleton';

export default function AvailabilityLoading() {
  return (
    <PageShell
      title="Availability"
      description="Configure times when you are available for bookings."
    >
      <CardListSkeleton count={3} />
    </PageShell>
  );
}
