import { Prisma } from '@prisma/client';

export class OverlapUtils {
  /**
   * Generates a raw SQL query to check for overlapping bookings using row-level locking
   * Returns a raw query array that can be executed via prisma.$queryRaw
   */
  static getOverlapQuery(hostId: string, startTime: Date, endTime: Date): Prisma.Sql {
    return Prisma.sql`
      SELECT id 
      FROM "bookings" 
      WHERE host_id = ${hostId} 
        AND status IN ('PENDING', 'CONFIRMED')
        AND start_time < ${endTime} 
        AND end_time > ${startTime}
      FOR UPDATE
    `;
  }
}
