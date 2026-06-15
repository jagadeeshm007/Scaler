export interface RequestOptions {
  idempotencyKey?: string;
  headers?: Record<string, string>;
  [key: string]: unknown;
}
