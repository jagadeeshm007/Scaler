import 'server-only';

import type { AxiosRequestConfig } from 'axios';

import { serverAxios } from '@/lib/api/axios.server';
import { unwrapApiData } from '@/lib/api/parse-response';
import type { RequestOptions } from '@/lib/api/types';

function toAxiosConfig(init?: RequestOptions): AxiosRequestConfig | undefined {
  if (!init) return undefined;

  const { idempotencyKey, headers, ...rest } = init;

  return {
    ...rest,
    headers: {
      ...headers,
      ...(idempotencyKey ? { 'X-Idempotency-Key': idempotencyKey } : {}),
    },
  };
}

async function request<T>(
  method: 'get' | 'post' | 'put' | 'patch' | 'delete',
  path: string,
  body?: unknown,
  init?: RequestOptions & { token?: string },
): Promise<T> {
  const config: AxiosRequestConfig = {
    ...toAxiosConfig(init),
    headers: {
      ...toAxiosConfig(init)?.headers,
      ...(init?.token ? { Authorization: `Bearer ${init.token}` } : {}),
    },
  };

  const response = await serverAxios.request({
    url: path,
    method,
    data: body,
    ...config,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  return unwrapApiData<T>(response.data);
}

/** Server-only typed API client for RSC, Server Actions, and Route Handlers. */
export const serverApi = {
  get: <T>(path: string, init?: RequestOptions & { token?: string }) =>
    request<T>('get', path, undefined, init),
  post: <T>(path: string, body?: unknown, init?: RequestOptions & { token?: string }) =>
    request<T>('post', path, body, init),
  put: <T>(path: string, body?: unknown, init?: RequestOptions & { token?: string }) =>
    request<T>('put', path, body, init),
  patch: <T>(path: string, body?: unknown, init?: RequestOptions & { token?: string }) =>
    request<T>('patch', path, body, init),
  del: <T>(path: string, init?: RequestOptions & { token?: string }) =>
    request<T>('delete', path, undefined, init),
};
