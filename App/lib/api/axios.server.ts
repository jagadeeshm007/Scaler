import 'server-only';

import axios, { type AxiosInstance } from 'axios';

import { env } from '@/lib/env';
import { toApiError } from '@/lib/api/errors';

export function createServerAxios(): AxiosInstance {
  const instance = axios.create({
    baseURL: env.NEXT_PUBLIC_API_URL,
    timeout: 15_000,
    headers: { 'Content-Type': 'application/json' },
    // Never cache authenticated or session-sensitive backend calls.
    transitional: { clarifyTimeoutError: true },
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(toApiError(error)),
  );

  return instance;
}

export const serverAxios = createServerAxios();
