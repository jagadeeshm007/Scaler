import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/constants/api';
import {
  authPayloadSchema,
  type AuthPayload,
  type SessionResponse,
  sessionResponseSchema,
} from '@bolt/types';
import { z } from 'zod';

export async function login(data: unknown) {
  return api
    .post<AuthPayload>(ENDPOINTS.auth.login, data)
    .then((res) => authPayloadSchema.parse(res));
}

export async function signup(data: unknown) {
  return api
    .post<AuthPayload>(ENDPOINTS.auth.register, data)
    .then((res) => authPayloadSchema.parse(res));
}

export async function bypassLogin() {
  return api
    .post<AuthPayload>(ENDPOINTS.auth.bypass, {})
    .then((res) => authPayloadSchema.parse(res));
}

export async function logoutUser() {
  return api.post<void>(ENDPOINTS.auth.logout, {});
}

export async function refreshSession() {
  return api
    .post<{ accessToken: string }>(ENDPOINTS.auth.refresh, {})
    .then((res) => z.object({ accessToken: z.string() }).parse(res));
}

export async function getSession() {
  return api
    .get<SessionResponse>(ENDPOINTS.auth.session)
    .then((res) => sessionResponseSchema.parse(res));
}
