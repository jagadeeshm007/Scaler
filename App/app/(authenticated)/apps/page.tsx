import { IntegrationList } from '@/components/integrations/integration-list';

export default function AppsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-white">Apps</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Connect your calendar and conferencing accounts
        </p>
      </div>
      <IntegrationList />
    </div>
  );
}
