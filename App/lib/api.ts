import { ENDPOINTS } from '@/lib/endpoints';
import { useAuthStore } from '@/store/auth.store';
import type { ApiErrorBody, ApiResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
const TIMEOUT_MS = 15_000;

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

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  idempotencyKey?: string;
}

async function parseError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return new ApiError(body.error ?? 'Request failed', response.status, body.code);
  } catch {
    return new ApiError(response.statusText || 'Request failed', response.status);
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, idempotencyKey, headers: customHeaders, ...rest } = options;
  const token = useAuthStore.getState().accessToken;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    ...customHeaders,
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const execute = async (retry = true): Promise<T> => {
    const response = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal: controller.signal,
    });

    if (response.status === 401 && retry && token) {
      try {
        const refreshRes = await fetch(`${API_BASE}${ENDPOINTS.auth.refresh}`, {
          method: 'POST',
          credentials: 'include',
        });
        if (refreshRes.ok) {
          const refreshData = (await refreshRes.json()) as ApiResponse<{ accessToken: string }>;
          useAuthStore.getState().setToken(refreshData.data.accessToken);
          return execute(false);
        }
      } catch {
        // fall through to logout
      }
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') window.location.href = '/login';
      throw new ApiError('Session expired', 401);
    }

    if (!response.ok) throw await parseError(response);

    if (response.status === 204) return undefined as T;

    const json = (await response.json()) as ApiResponse<T>;
    return json.data;
  };

  try {
    return await execute();
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'GET' }),
  post: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, init?: RequestOptions) =>
    request<T>(path, { ...init, method: 'PATCH', body }),
  del: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: 'DELETE' }),
};

export async function getServerAccessToken(): Promise<string> {
  const response = await fetch(`${API_BASE}${ENDPOINTS.auth.bypass}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
    cache: 'no-store',
  });
  if (!response.ok) throw await parseError(response);
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
  if (!response.ok) throw await parseError(response);
  const json = (await response.json()) as ApiResponse<T>;
  return json.data;
}
