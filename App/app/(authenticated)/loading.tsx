import { PageShell } from '@/components/layout/page-shell';
import { CardListSkeleton } from '@/components/shared/skeletons/card-list-skeleton';

export default function AuthenticatedLoading() {
  return (
    <PageShell title="Loading...">
      <CardListSkeleton count={3} />
    </PageShell>
  );
}
