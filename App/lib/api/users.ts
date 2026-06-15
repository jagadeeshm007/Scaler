import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/constants/api';
import { authUserSchema, type AuthUser, type UpdateUserInput } from '@scaler/types';

export async function fetchUserProfile() {
  return api.get<AuthUser>(ENDPOINTS.users.me).then((res) => authUserSchema.parse(res));
}

export async function updateUserProfile(data: UpdateUserInput) {
  return api.patch<AuthUser>(ENDPOINTS.users.me, data).then((res) => authUserSchema.parse(res));
}

export async function updateUserSettings(data: unknown) {
  return api
    .patch<AuthUser>(ENDPOINTS.users.settings, data)
    .then((res) => authUserSchema.parse(res));
}
