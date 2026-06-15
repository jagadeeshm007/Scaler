export * from '@scaler/types';

// We also need ApiResponse because it's a generic type. The generic Zod schema apiResponseSchema was exported.
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
