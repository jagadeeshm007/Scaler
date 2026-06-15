import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/constants/api';
import { integrationSchema, type Integration } from '@bolt/types';
import { z } from 'zod';

export async function fetchIntegrations() {
  return api
    .get<Integration[]>(ENDPOINTS.integrations.list)
    .then((res) => z.array(integrationSchema).parse(res));
}

export async function connectIntegration(slug: string) {
  return api
    .get<{ authUrl: string }>(ENDPOINTS.integrations.connect(slug))
    .then((res) => z.object({ authUrl: z.string() }).parse(res));
}

export async function disconnectIntegration(slug: string) {
  return api.del<void>(ENDPOINTS.integrations.delete(slug));
}
