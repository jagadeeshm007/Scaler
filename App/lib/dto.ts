import 'server-only';
import type { AuthUser, UserSettings } from '@bolt/types';

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  timezone: string;
  settings?: UserSettings;
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
    settings: (user as unknown as UserDTO).settings,
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
