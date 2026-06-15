import { EventTypeList } from '@/components/event-types/event-type-list';
import { api } from '@/lib/api.server';
import { verifySession } from '@/lib/dal';
import type { EventType } from '@bolt/types';

export default async function EventTypesPage() {
  const { accessToken } = await verifySession();

  let initialData: EventType[] = [];
  try {
    initialData = await api.get<EventType[]>('/event-types', { token: accessToken });
  } catch {
    initialData = [];
  }

  return <EventTypeList initialData={initialData} />;
}
