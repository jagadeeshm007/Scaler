'use client';

import { useMemo, useState } from 'react';
import { Plug } from 'lucide-react';

import { IntegrationCard } from '@/components/integrations/integration-card';
import { IntegrationSkeleton } from '@/components/integrations/integration-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
import { PageSection } from '@/components/shared/page-section';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useIntegrations } from '@/hooks/queries/use-integrations';

export function IntegrationList() {
  const { data: integrations, isLoading, isError } = useIntegrations();
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(() => {
    if (!integrations) return ['all'];
    const unique = [...new Set(integrations.map((i) => i.category))];
    return ['all', ...unique];
  }, [integrations]);

  const filtered = useMemo(() => {
    if (!integrations) return [];
    if (category === 'all') return integrations;
    return integrations.filter((i) => i.category === category);
  }, [integrations, category]);

  if (isLoading) return <IntegrationSkeleton />;

  if (isError) {
    return <p className="py-12 text-center text-sm text-red-500">Failed to load integrations</p>;
  }

  return (
    <PageSection className="flex min-h-full flex-1 flex-col pb-24 md:pb-6">
      <div className="hidden shrink-0 items-start justify-between gap-4 px-6 pt-6 pb-5 md:flex">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Apps</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Connect your calendar and conferencing accounts
          </p>
        </div>
      </div>

      {/* Mobile Title */}
      <div className="shrink-0 px-4 pt-4 pb-3 md:hidden">
        <h1 className="text-xl font-semibold text-foreground">Apps</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Connect your calendar and conferencing accounts
        </p>
      </div>

      <div className="flex flex-col gap-6 px-4 pb-4 md:px-6 md:pb-6">
        {integrations?.length ? (
          <>
            <Tabs value={category} onValueChange={setCategory}>
              <TabsList className="bg-card">
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="capitalize">
                    {cat === 'all' ? 'All' : cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((integration) => (
                <IntegrationCard key={integration.id} integration={integration} />
              ))}
            </div>
          </>
        ) : (
          <EmptyState
            icon={Plug}
            title="No integrations available"
            description="Check back later for available app integrations."
          />
        )}
      </div>
    </PageSection>
  );
}
