import type { PrismaClient } from '@prisma/client';
import { vi } from 'vitest';

import { prisma } from '../../src/lib/prisma';

export const MOCK_USER_ID = '550e8400-e29b-41d4-a716-446655440000';
export const MOCK_EVENT_TYPE_ID = '660e8400-e29b-41d4-a716-446655440001';

/** Mock prisma.user.findUnique for requireAuth middleware */
export function mockAuthenticatedUser(userId = MOCK_USER_ID): void {
  vi.mocked(prisma.user.findUnique).mockResolvedValue({
    id: userId,
    email: 'test@example.com',
    deleted_at: null,
  } as Awaited<ReturnType<PrismaClient['user']['findUnique']>>);
}

export const validBookingPayload = {
  event_type_id: MOCK_EVENT_TYPE_ID,
  host_id: MOCK_USER_ID,
  guest_name: 'Guest',
  guest_email: 'guest@example.com',
  guest_notes: 'Looking forward to it',
  start_time: '2026-06-15T10:00:00.000Z',
  end_time: '2026-06-15T10:30:00.000Z',
  timezone: 'America/New_York',
};

export const IDEMPOTENCY_HEADER = { 'X-Idempotency-Key': 'test-idempotency-key-001' };
