import { Router, Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { ApiResponse } from '../utils/api-response';
import { SlotCalculator } from '../utils/slot-calculator';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';
import { HTTP_STATUS, ERROR_CODE } from '../config/constants';

const router = Router();

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

export default router;
