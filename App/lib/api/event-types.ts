import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/constants/api';
import {
  eventTypeSchema,
  publicEventTypeSchema,
  blockedDatesDataSchema,
  slotSchema,
  type EventType,
  type PublicEventType,
  type BlockedDatesData,
  type Slot,
} from '@bolt/types';
import { z } from 'zod';

export async function fetchEventTypes() {
  return api
    .get<EventType[]>(ENDPOINTS.eventTypes.list)
    .then((res) => z.array(eventTypeSchema).parse(res));
}

export async function fetchEventType(id: string) {
  return api
    .get<EventType>(ENDPOINTS.eventTypes.byId(id))
    .then((res) => eventTypeSchema.parse(res));
}

export async function fetchPublicEventType(username: string, slug: string) {
  return api
    .get<PublicEventType>(ENDPOINTS.eventTypes.public(username, slug))
    .then((res) => publicEventTypeSchema.parse(res));
}

export async function fetchBlockedDates(username: string, month: string) {
  return api
    .get<BlockedDatesData>(`${ENDPOINTS.eventTypes.blockedDates(username)}?month=${month}`)
    .then((res) => blockedDatesDataSchema.parse(res));
}

export async function fetchSlots(eventTypeId: string, date: string, timezone: string) {
  return api
    .get<
      Slot[]
    >(`${ENDPOINTS.slots}?eventTypeId=${eventTypeId}&date=${date}&timezone=${encodeURIComponent(timezone)}`)
    .then((res) => z.array(slotSchema).parse(res));
}

export async function fetchWeekSlots(
  eventTypeId: string,
  startDate: string,
  endDate: string,
  timezone: string,
) {
  return api
    .get<
      Slot[]
    >(`${ENDPOINTS.slots}?eventTypeId=${eventTypeId}&startDate=${startDate}&endDate=${endDate}&timezone=${encodeURIComponent(timezone)}`)
    .then((res) => z.array(slotSchema).parse(res));
}

export async function createEventType(data: unknown) {
  return api
    .post<EventType>(ENDPOINTS.eventTypes.create, data)
    .then((res) => eventTypeSchema.parse(res));
}

export async function updateEventType(id: string, data: unknown) {
  return api
    .patch<EventType>(ENDPOINTS.eventTypes.update(id), data)
    .then((res) => eventTypeSchema.parse(res));
}

export async function deleteEventType(id: string) {
  return api.del<EventType>(ENDPOINTS.eventTypes.delete(id));
}

export async function reorderEventTypes(data: unknown) {
  return api
    .patch<EventType[]>(ENDPOINTS.eventTypes.reorder, data)
    .then((res) => z.array(eventTypeSchema).parse(res));
}
