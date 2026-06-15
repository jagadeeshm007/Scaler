import { PageShell } from '@/components/layout/page-shell';
import { CardListSkeleton } from '@/components/shared/skeletons/card-list-skeleton';

export default function AppsLoading() {
  return (
    <PageShell title="Apps" description="Connect your calendar and conferencing accounts">
      <CardListSkeleton count={4} />
    </PageShell>
  );
}
