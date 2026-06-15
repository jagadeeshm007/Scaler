import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/constants/api';
import {
  authUserSchema,
  userProfileSchema,
  type AuthUser,
  type UpdateUserInput,
  type UpdateUserSettingsInput,
  type UserProfile,
} from '@bolt/types';

export async function fetchUserProfile() {
  return api.get<UserProfile>(ENDPOINTS.users.me).then((res) => userProfileSchema.parse(res));
}

export async function updateUserProfile(data: UpdateUserInput) {
  return api.patch<AuthUser>(ENDPOINTS.users.me, data).then((res) => authUserSchema.parse(res));
}

export async function updateUserSettings(data: UpdateUserSettingsInput) {
  return api
    .patch<UserProfile>(ENDPOINTS.users.settings, data)
    .then((res) => userProfileSchema.parse(res));
}
