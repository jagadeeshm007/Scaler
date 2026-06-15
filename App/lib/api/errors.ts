import type { AxiosError } from 'axios';

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

interface ApiErrorBody {
  message?: string;
  code?: string;
  error?: string | { code?: string; errors?: { message: string }[] };
}

export function parseApiErrorBody(body: unknown): { message: string; code?: string } {
  if (!body || typeof body !== 'object') {
    return { message: 'Request failed' };
  }

  const record = body as ApiErrorBody;
  const nestedError = record.error;

  const message =
    record.message ||
    (typeof nestedError === 'object' ? nestedError?.errors?.[0]?.message : undefined) ||
    (typeof nestedError === 'string' ? nestedError : undefined) ||
    'Request failed';

  const code =
    (typeof nestedError === 'object' ? nestedError?.code : undefined) || record.code || undefined;

  return { message, code };
}

export function toApiError(error: unknown, fallback = 'Request failed'): ApiError {
  if (error instanceof ApiError) return error;

  if (isAxiosError(error)) {
    const status = error.response?.status ?? 500;
    const { message, code } = parseApiErrorBody(error.response?.data);
    return new ApiError(message, status, code);
  }

  if (error instanceof Error && error.message) {
    return new ApiError(error.message, 500);
  }

  return new ApiError(fallback, 500);
}

/** Normalize unknown thrown values into a user-facing string. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
}

function isAxiosError(error: unknown): error is AxiosError {
  return typeof error === 'object' && error !== null && 'isAxiosError' in error;
}
