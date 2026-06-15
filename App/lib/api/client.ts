/** Browser-only API surface. Import from `@/lib/api` in client code. */
export { api, axiosInstance, localApi, localAxios } from '@/lib/api/axios.client';
export { ApiError, getErrorMessage } from '@/lib/api/errors';
export type { RequestOptions } from '@/lib/api/types';
