import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/constants/api';
import { scheduleSchema, type Schedule } from '@scaler/types';
import { z } from 'zod';

export async function fetchAvailabilityList() {
  return api
    .get<Schedule[]>(ENDPOINTS.availability.list)
    .then((res) => z.array(scheduleSchema).parse(res));
}

export async function fetchAvailability(id: string) {
  return api
    .get<Schedule>(ENDPOINTS.availability.byId(id))
    .then((res) => scheduleSchema.parse(res));
}

export async function createAvailability(data: unknown) {
  return api
    .post<Schedule>(ENDPOINTS.availability.create, data)
    .then((res) => scheduleSchema.parse(res));
}

export async function updateAvailability(id: string, data: unknown) {
  return api
    .patch<Schedule>(ENDPOINTS.availability.update(id), data)
    .then((res) => scheduleSchema.parse(res));
}

export async function deleteAvailability(id: string) {
  return api.del<Schedule>(ENDPOINTS.availability.delete(id));
}
