import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

import { ENDPOINTS } from '@/lib/constants/api';
import { INTERNAL_API } from '@/lib/constants/internal-api';
import { env } from '@/lib/env';
import { ApiError, parseApiErrorBody } from '@/lib/api/errors';
import { unwrapApiData } from '@/lib/api/parse-response';
import type { RequestOptions } from '@/lib/api/types';
import { useAuthStore } from '@/store/auth.store';

const API_BASE = env.NEXT_PUBLIC_API_URL;

function toAxiosConfig(init?: RequestOptions): Record<string, unknown> | undefined {
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

function attachAuthHeader(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  const token = useAuthStore.getState().accessToken;

  if (!config.headers) {
    config.headers = {} as typeof config.headers;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (!config.headers['Content-Type']) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
}

function unwrapAxiosResponse<T>(response: AxiosResponse): T {
  if (response.status === 204) return undefined as T;
  return unwrapApiData<T>(response.data);
}

type ResponseInterceptor = (response: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>;

let isRefreshing = false;
let pendingQueue: ((token: string) => void)[] = [];

function createClientAxios(): AxiosInstance {
  const instance = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
    timeout: 15_000,
  });

  instance.interceptors.request.use(attachAuthHeader);

  instance.interceptors.response.use(
    ((response) => unwrapAxiosResponse(response)) as ResponseInterceptor,
    async (error: AxiosError<unknown>) => {
      const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const status = error.response?.status;
      const { message, code } = parseApiErrorBody(error.response?.data);

      if (!original || status !== 401 || original._retry) {
        return Promise.reject(new ApiError(message, status ?? 500, code));
      }

      if (
        original.url?.includes(ENDPOINTS.auth.logout) ||
        original.url?.includes(ENDPOINTS.auth.login) ||
        original.url?.includes(ENDPOINTS.auth.refresh)
      ) {
        return Promise.reject(new ApiError(message, 401, code));
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push((token: string) => {
            if (token) {
              original.headers.Authorization = `Bearer ${token}`;
              resolve(instance(original));
            } else {
              reject(new ApiError('Session expired', 401));
            }
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshData = await localApi.post<{ accessToken: string }>(INTERNAL_API.auth.refresh);
        const newToken = refreshData.accessToken;

        useAuthStore.getState().setAccessToken(newToken);
        pendingQueue.forEach((cb) => cb(newToken));
        pendingQueue = [];

        original.headers.Authorization = `Bearer ${newToken}`;
        return instance(original);
      } catch {
        pendingQueue.forEach((cb) => cb(''));
        pendingQueue = [];
        await useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(new ApiError('Session expired', 401));
      } finally {
        isRefreshing = false;
      }
    },
  );

  return instance;
}

function createLocalAxios(): AxiosInstance {
  const instance = axios.create({
    withCredentials: true,
    timeout: 15_000,
    headers: { 'Content-Type': 'application/json' },
  });

  instance.interceptors.response.use(((response) =>
    unwrapAxiosResponse(response)) as ResponseInterceptor);

  return instance;
}

export const localAxios = createLocalAxios();

/** Same-origin Next.js route handlers (auth refresh/logout). */
export const localApi = {
  post: <T>(path: string, body?: unknown) => localAxios.post<unknown, T>(path, body),
};

export const axiosInstance = createClientAxios();

/** Browser-only typed API client backed by axios. */
export const api = {
  get: <T>(path: string, init?: RequestOptions) =>
    axiosInstance.get<unknown, T>(path, toAxiosConfig(init)),
  post: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    axiosInstance.post<unknown, T>(path, body, toAxiosConfig(init)),
  put: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    axiosInstance.put<unknown, T>(path, body, toAxiosConfig(init)),
  patch: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    axiosInstance.patch<unknown, T>(path, body, toAxiosConfig(init)),
  del: <T>(path: string, init?: RequestOptions) =>
    axiosInstance.delete<unknown, T>(path, toAxiosConfig(init)),
};
