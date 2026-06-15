import { updateBookingStatusSchema } from '@bolt/types';
import { Router } from 'express';

import { BookingController } from '../controllers/booking.controller';
import type { Request, Response } from 'express';
import { HTTP_STATUS, ERROR_CODE } from '../config/constants';
import { prisma } from '../lib/prisma';
import { validate } from '../middleware/validate';
import { ApiResponse } from '../utils/api-response';
import { AppError } from '../utils/app-error';
import { asyncHandler } from '../utils/async-handler';
import { SlotCalculator } from '../utils/slot-calculator';

const router = Router();

/**
 * GET /api/v1/public/bookings/:uid
 * Public booking lookup for confirmation / cancel / reschedule pages
 */
router.get('/bookings/:uid', BookingController.getPublicBookingByUid);

/**
 * PATCH /api/v1/public/bookings/:uid/status?timezone=...
 * Guest-initiated cancel or reschedule (no auth required)
 */
router.patch(
  '/bookings/:uid/status',
  validate(updateBookingStatusSchema),
  BookingController.updatePublicBookingStatus,
);

/**
 * GET /api/v1/slots
 * Query: ?eventTypeId=...&date=YYYY-MM-DD&timezone=Asia/Kolkata
 */
router.get(
  '/slots',
  asyncHandler(async (req: Request, res: Response) => {
    const { eventTypeId, date, timezone } = req.query;

    if (!eventTypeId || !date || !timezone) {
      throw new AppError(
        'Missing required query parameters (eventTypeId, date, timezone)',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
      );
    }

    const slots = await SlotCalculator.getAvailableSlots(
      eventTypeId as string,
      date as string,
      timezone as string,
    );

    return ApiResponse.success(res, 'Slots retrieved successfully', slots);
  }),
);

/**
 * GET /api/v1/public/:username/blocked-dates?month=YYYY-MM
 * Returns dates where the host is fully unavailable (DateOverride with is_available=false),
 * along with any configured emoji, for display in the public booking calendar.
 */
router.get(
  '/:username/blocked-dates',
  asyncHandler(async (req: Request, res: Response) => {
    const { month } = req.query;

    if (!month || !/^\d{4}-\d{2}$/.test(month as string)) {
      throw new AppError(
        'Missing or invalid query parameter: month (expected YYYY-MM)',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
      );
    }

    const user = await prisma.user.findUnique({
      where: { username: req.params.username as string },
    });

    if (!user || user.deleted_at) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
    }

    const monthStr = month as string;
    const year = parseInt(monthStr.slice(0, 4), 10);
    const monthNum = parseInt(monthStr.slice(5, 7), 10);
    const monthStart = new Date(Date.UTC(year, monthNum - 1, 1));
    const monthEnd = new Date(Date.UTC(year, monthNum, 0, 23, 59, 59, 999));

    // Use raw query to avoid stale Prisma generated-type issues with the emoji column
    interface RawOverride {
      date: Date;
      emoji: string | null;
      is_available: boolean;
    }
    const rows = await prisma.$queryRaw<RawOverride[]>`
      SELECT d.date, d.emoji, d.is_available
      FROM date_overrides d
      JOIN schedules s ON s.id = d.schedule_id
      WHERE s.user_id = ${user.id}
        AND d.date >= ${monthStart}
        AND d.date <= ${monthEnd}
    `;

    // Deduplicate by date (take first occurrence across multiple schedules)
    const seenBlocked = new Set<string>();
    const seenAvailable = new Set<string>();
    const blocked: { date: string; emoji: string }[] = [];
    const availableOverrides: string[] = [];

    for (const r of rows) {
      const dateStr = r.date.toISOString().slice(0, 10);
      if (r.is_available) {
        if (!seenAvailable.has(dateStr)) {
          seenAvailable.add(dateStr);
          availableOverrides.push(dateStr);
        }
      } else {
        if (!seenBlocked.has(dateStr)) {
          seenBlocked.add(dateStr);
          blocked.push({ date: dateStr, emoji: r.emoji ?? '🔒' });
        }
      }
    }

    // Determine non-working weekdays from the user's default schedule
    const defaultSchedule = await prisma.schedule.findFirst({
      where: { user_id: user.id, is_default: true },
      include: { availability: true },
    });
    const workingDaySet = new Set(
      (defaultSchedule?.availability ?? []).filter((a) => a.is_active).map((a) => a.day_of_week),
    );
    const nonWorkingDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => !workingDaySet.has(d));

    return ApiResponse.success(res, 'Blocked dates retrieved successfully', {
      blocked,
      nonWorkingDays,
      availableOverrides,
    });
  }),
);

/**
 * GET /api/v1/public/:username/event-types
 * Returns public active event types for a host
 */
router.get(
  '/:username/event-types',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username as string },
    });

    if (!user || user.deleted_at) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
    }

    const eventTypes = await prisma.eventType.findMany({
      where: { user_id: user.id, is_active: true, is_hidden: false, deleted_at: null },
      orderBy: { created_at: 'asc' },
    });

    return ApiResponse.success(res, 'Event types retrieved successfully', eventTypes);
  }),
);

/**
 * GET /api/v1/public/:username/:slug
 * Returns specific event type details
 */
router.get(
  '/:username/:slug',
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.user.findUnique({
      where: { username: req.params.username as string },
    });

    if (!user || user.deleted_at) {
      throw new AppError('User not found', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
    }

    const eventType = await prisma.eventType.findUnique({
      where: {
        user_id_slug: {
          user_id: user.id,
          slug: req.params.slug as string,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            username: true,
            avatar_url: true,
            timezone: true,
            settings: {
              select: {
                brand_name: true,
                brand_colors_enabled: true,
                brand_color_light: true,
                brand_color_dark: true,
              },
            },
          },
        },
      },
    });

    if (!eventType || !eventType.is_active || eventType.deleted_at) {
      throw new AppError('Event type not found', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
    }

    return ApiResponse.success(res, 'Event type retrieved successfully', eventType);
  }),
);

export { router as publicRoutes };
