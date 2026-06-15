import 'server-only';
import type { AuthUser } from '@scaler/types';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  timezone: string;
}

export interface HostPublicDTO {
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
}

export function toUserDTO(user: AuthUser): UserDTO {
  return {
    id: user.id,
    name: user.full_name,
    email: user.email,
    username: user.username,
    avatarUrl: user.avatar_url ?? null,
    timezone: user.timezone,
  };
}

export function toHostPublicDTO(user: AuthUser): HostPublicDTO {
  return {
    name: user.full_name,
    username: user.username,
    avatarUrl: user.avatar_url ?? null,
    bio: null, // bio is not in AuthUser, could fetch from profile if needed
  };
}
