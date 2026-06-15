import { PageShell } from '@/components/layout/page-shell';
import { CardListSkeleton } from '@/components/shared/skeletons/card-list-skeleton';

export default function EventTypesLoading() {
  return (
    <PageShell
      title="Event types"
      description="Configure different events for people to book on your calendar."
    >
      <CardListSkeleton count={6} />
    </PageShell>
  );
}
