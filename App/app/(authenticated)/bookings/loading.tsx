import { PageShell } from '@/components/layout/page-shell';
import { TableSkeleton } from '@/components/shared/skeletons/table-skeleton';

export default function BookingsLoading() {
  return (
    <PageShell
      title="Bookings"
      description="See upcoming and past events booked through your event types."
    >
      <div className="mx-4 mb-4 md:mx-6 md:mb-6">
        <TableSkeleton rows={6} />
      </div>
    </PageShell>
  );
}
