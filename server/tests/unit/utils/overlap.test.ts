import { describe, it, expect } from 'vitest';
import { OverlapUtils } from '../../../src/utils/overlap';

describe('OverlapUtils', () => {
  it('should generate a valid raw SQL query for overlap checking', () => {
    const hostId = 'user-123';
    const startTime = new Date('2026-06-15T09:00:00Z');
    const endTime = new Date('2026-06-15T10:00:00Z');

    const query = OverlapUtils.getOverlapQuery(hostId, startTime, endTime);

    // Prisma.sql returns an object with strings and values arrays
    expect(query).toHaveProperty('strings');
    expect(query).toHaveProperty('values');

    // The SQL query should contain the relevant columns and FOR UPDATE
    expect(query.strings.join('')).toContain('SELECT id');
    expect(query.strings.join('')).toContain('FROM "bookings"');
    expect(query.strings.join('')).toContain('FOR UPDATE');

    // The values should contain the parameters
    expect(query.values).toContain(hostId);
    expect(query.values).toContain(startTime);
    expect(query.values).toContain(endTime);
  });
});
