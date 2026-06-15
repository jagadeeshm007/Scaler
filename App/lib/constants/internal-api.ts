/** Same-origin Next.js route handlers used by the browser client. */
export const INTERNAL_API = {
  auth: {
    refresh: '/api/auth/refresh',
    logout: '/api/auth/logout',
  },
} as const;
