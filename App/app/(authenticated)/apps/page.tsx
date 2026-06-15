import { verifySession } from '@/lib/dal';
import { IntegrationList } from '@/components/integrations/integration-list';

export default async function AppsPage() {
  await verifySession();
  return <IntegrationList />;
}
