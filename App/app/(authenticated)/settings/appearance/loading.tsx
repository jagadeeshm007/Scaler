import { PageShell } from '@/components/layout/page-shell';

export default function AppearanceSettingsLoading() {
  return (
    <PageShell title="Appearance">
      <div className="mx-4 mb-4 h-72 animate-pulse rounded-xl border border-border bg-muted/50 md:mx-6 md:mb-6" />
    </PageShell>
  );
}
