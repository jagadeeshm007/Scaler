export const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    bypass: '/auth/bypass',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  },
  users: {
    me: '/users/me',
  },
  eventTypes: {
    list: '/event-types',
    create: '/event-types',
    byId: (id: string) => `/event-types/${id}`,
    update: (id: string) => `/event-types/${id}`,
    delete: (id: string) => `/event-types/${id}`,
    reorder: '/event-types/reorder',
    public: (username: string, slug: string) => `/public/${username}/${slug}`,
    publicList: (username: string) => `/public/${username}/event-types`,
    blockedDates: (username: string) => `/public/${username}/blocked-dates`,
  },
  availability: {
    list: '/availability',
    create: '/availability',
    byId: (id: string) => `/availability/${id}`,
    update: (id: string) => `/availability/${id}`,
    delete: (id: string) => `/availability/${id}`,
  },
  slots: '/slots',
  bookings: {
    list: '/bookings',
    create: '/bookings',
    byId: (id: string) => `/bookings/${id}`,
    status: (id: string) => `/bookings/${id}/status`,
  },
  publicBookings: {
    byUid: (uid: string) => `/public/bookings/${uid}`,
    status: (uid: string) => `/public/bookings/${uid}/status`,
  },
  integrations: {
    list: '/integrations',
    connect: (slug: string) => `/integrations/${slug}/connect`,
    delete: (slug: string) => `/integrations/${slug}`,
  },
} as const;
