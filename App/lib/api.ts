import axios, { type AxiosError } from 'axios';
import { env } from '@/lib/env';
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { ENDPOINTS } from '@/lib/constants/api';
import { useAuthStore } from '@/store/auth.store';
import type { ApiResponse } from '@/types';

const API_BASE = env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

/** Normalize unknown thrown values into a user-facing string. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
}

export const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 15_000,
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  // Ensure headers object exists
  if (!config.headers) {
    config.headers = {} as typeof config.headers;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Set default JSON content type
  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

let isRefreshing = false;
let pendingQueue: ((token: string) => void)[] = [];

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status === 204) return undefined;
    return response.data?.data ?? response.data;
  },
  async (error: AxiosError<unknown>) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      idempotencyKey?: string;
    };

    // Extract error nicely
    let message = 'Request failed';
    let code: string | undefined;

    if (error.response?.data) {
      const body = error.response.data as Record<string, unknown>;
      message =
        (body.message as string) ||
        (body.error as { errors?: { message: string }[] })?.errors?.[0]?.message ||
        (body.error as string) ||
        message;
      code = (body.error as { code?: string })?.code || (body.code as string);
    }

    if (error.response?.status === 401 && !original._retry) {
      if (
        original.url?.includes('/auth/logout') ||
        original.url?.includes('/auth/login') ||
        original.url?.includes('/auth/refresh')
      ) {
        return Promise.reject(new ApiError(message, 401, code));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((token: string) => {
            if (token) {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(original));
            } else {
              reject(new ApiError('Session expired', 401));
            }
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        let refreshData;
        let attempts = 0;
        let success = false;

        while (attempts < 3 && !success) {
          try {
            const response = await axios.post(
              `${API_BASE}${ENDPOINTS.auth.refresh}`,
              {},
              {
                withCredentials: true,
              },
            );
            refreshData = response.data;
            success = true;
          } catch (err) {
            attempts++;
            if (attempts >= 3) {
              throw err;
            }
          }
        }

        const newToken = refreshData.data.accessToken;

        useAuthStore.getState().setToken(newToken);

        pendingQueue.forEach((cb) => cb(newToken));
        pendingQueue = [];

        original.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(original);
      } catch (refreshError) {
        pendingQueue.forEach((cb) => cb(''));
        pendingQueue = [];
        void useAuthStore.getState().logout();
        if (typeof window !== 'undefined') window.location.href = '/login';
        throw new ApiError('Session expired', 401);
        console.error(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    throw new ApiError(message, error.response?.status || 500, code);
  },
);

interface RequestOptions {
  idempotencyKey?: string;
  headers?: Record<string, string>;
  [key: string]: unknown;
}

function convertInitToAxiosConfig(init?: RequestOptions): Record<string, unknown> | undefined {
  if (!init) return undefined;
  const { idempotencyKey, ...rest } = init;
  if (idempotencyKey) {
    return {
      ...rest,
      headers: { ...rest.headers, 'X-Idempotency-Key': idempotencyKey },
    };
  }
  return rest;
}

export const api = {
  get: <T>(path: string, init?: RequestOptions) =>
    axiosInstance.get<unknown, T>(path, convertInitToAxiosConfig(init)),
  post: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    axiosInstance.post<unknown, T>(path, body, convertInitToAxiosConfig(init)),
  put: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    axiosInstance.put<unknown, T>(path, body, convertInitToAxiosConfig(init)),
  patch: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    axiosInstance.patch<unknown, T>(path, body, convertInitToAxiosConfig(init)),
  del: <T>(path: string, init?: RequestOptions) =>
    axiosInstance.delete<unknown, T>(path, convertInitToAxiosConfig(init)),
};

export async function getServerAccessToken(): Promise<string> {
  const response = await fetch(`${API_BASE}${ENDPOINTS.auth.bypass}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
    cache: 'no-store',
  });
  if (!response.ok) throw new ApiError('Bypass failed', response.status);
  const json = (await response.json()) as ApiResponse<{ accessToken: string }>;
  return json.data.accessToken;
}

export async function serverFetch<T>(path: string, token?: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });
  if (!response.ok) throw new ApiError('Server fetch failed', response.status);
  const json = (await response.json()) as ApiResponse<T>;
  return json.data;
}
