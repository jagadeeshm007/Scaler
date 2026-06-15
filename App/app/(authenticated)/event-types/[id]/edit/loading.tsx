import { PageShell } from '@/components/layout/page-shell';

export default function EditEventTypeLoading() {
  return (
    <PageShell title="Edit event type">
      <div className="mx-4 mb-4 md:mx-6 md:mb-6 h-64 rounded-xl border border-border bg-muted/50 animate-pulse" />
    </PageShell>
  );
}
