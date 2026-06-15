import 'server-only';

import { userProfileSchema, type UserProfile } from '@scaler/types';

import { serverApi } from '@/lib/api/server';
import { ENDPOINTS } from '@/lib/constants/api';

export async function fetchUserProfileServer(token: string): Promise<UserProfile> {
  const data = await serverApi.get(ENDPOINTS.users.me, { token });
  return userProfileSchema.parse(data);
}
