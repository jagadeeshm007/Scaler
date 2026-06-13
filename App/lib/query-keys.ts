export const queryKeys = {
  eventTypes: {
    all: () => ['event-types'] as const,
    list: () => ['event-types', 'list'] as const,
    byId: (id: string) => ['event-types', id] as const,
    public: (username: string, slug: string) => ['event-types', 'public', username, slug] as const,
  },
  bookings: {
    all: () => ['bookings'] as const,
    list: (filters: Record<string, unknown> = {}) => ['bookings', 'list', filters] as const,
    byId: (id: string) => ['bookings', id] as const,
  },
  availability: {
    all: () => ['availability'] as const,
    list: () => ['availability', 'list'] as const,
    byId: (id: string) => ['availability', id] as const,
  },
  slots: {
    byDate: (eventTypeId: string, date: string, timezone: string) =>
      ['slots', eventTypeId, date, timezone] as const,
  },
  integrations: {
    all: () => ['integrations'] as const,
    list: () => ['integrations', 'list'] as const,
  },
  user: {
    me: () => ['user', 'me'] as const,
  },
} as const;
