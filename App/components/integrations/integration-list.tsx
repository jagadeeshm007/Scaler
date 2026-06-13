'use client';

import { useMemo, useState } from 'react';
import { Plug } from 'lucide-react';

import { IntegrationCard } from '@/components/integrations/integration-card';
import { IntegrationSkeleton } from '@/components/integrations/integration-skeleton';
import { EmptyState } from '@/components/shared/empty-state';
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
    return (
      <p className="py-12 text-center text-sm text-red-500">Failed to load integrations</p>
    );
  }

  if (!integrations?.length) {
    return (
      <EmptyState
        icon={Plug}
        title="No integrations available"
        description="Check back later for available app integrations."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="bg-neutral-900">
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
    </div>
  );
}
