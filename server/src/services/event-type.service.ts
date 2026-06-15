import type { CreateEventTypeInput, UpdateEventTypeInput } from '@bolt/types';
import { Prisma } from '@prisma/client';
import { ERROR_CODE, HTTP_STATUS } from '../config/constants';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';

export class EventTypeService {
  static async getEventTypes(userId: string): Promise<unknown> {
    return prisma.eventType.findMany({
      where: { user_id: userId, deleted_at: null },
      orderBy: [{ position: 'asc' }, { created_at: 'desc' }],
    });
  }

  static async getEventTypeById(userId: string, id: string): Promise<unknown> {
    const eventType = await prisma.eventType.findUnique({
      where: { id },
    });

    if (!eventType || eventType.user_id !== userId || eventType.deleted_at) {
      throw new AppError('Event type not found', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
    }

    return eventType;
  }

  static async createEventType(userId: string, data: CreateEventTypeInput): Promise<unknown> {
    const existing = await prisma.eventType.findUnique({
      where: {
        user_id_slug: {
          user_id: userId,
          slug: data.slug,
        },
      },
    });

    if (existing && !existing.deleted_at) {
      throw new AppError(
        'Event type with this slug already exists',
        HTTP_STATUS.CONFLICT,
        ERROR_CODE.CONFLICT,
      );
    }

    const last = await prisma.eventType.findFirst({
      where: { user_id: userId, deleted_at: null },
      orderBy: { position: 'desc' },
      select: { position: true },
    });
    const position = (last?.position ?? -1) + 1;
    const { theme_config, ...restData } = data;

    return prisma.eventType.create({
      data: {
        ...restData,
        theme_config:
          theme_config === null
            ? Prisma.DbNull
            : (theme_config as Prisma.InputJsonValue | undefined),
        user_id: userId,
        position,
      },
    });
  }

  static async updateEventType(
    userId: string,
    id: string,
    data: UpdateEventTypeInput,
  ): Promise<unknown> {
    // Ensure it exists and belongs to user
    await this.getEventTypeById(userId, id);

    if (data.slug) {
      const existing = await prisma.eventType.findUnique({
        where: {
          user_id_slug: {
            user_id: userId,
            slug: data.slug,
          },
        },
      });

      if (existing && existing.id !== id && !existing.deleted_at) {
        throw new AppError(
          'Event type with this slug already exists',
          HTTP_STATUS.CONFLICT,
          ERROR_CODE.CONFLICT,
        );
      }
    }

    const { theme_config, ...restData } = data;

    return prisma.eventType.update({
      where: { id },
      data: {
        ...restData,
        ...(theme_config !== undefined
          ? {
              theme_config:
                theme_config === null ? Prisma.DbNull : (theme_config as Prisma.InputJsonValue),
            }
          : {}),
      },
    });
  }

  static async deleteEventType(userId: string, id: string): Promise<unknown> {
    await this.getEventTypeById(userId, id);

    return prisma.eventType.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false },
    });
  }

  static async reorderEventTypes(userId: string, ids: string[]): Promise<unknown> {
    const eventTypes = await prisma.eventType.findMany({
      where: { user_id: userId, deleted_at: null },
      select: { id: true },
    });

    const ownedIds = new Set(eventTypes.map((et) => et.id));
    const uniqueIds = [...new Set(ids)];

    if (uniqueIds.length !== eventTypes.length) {
      throw new AppError(
        'Reorder payload must include every event type exactly once',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
      );
    }

    for (const id of uniqueIds) {
      if (!ownedIds.has(id)) {
        throw new AppError(
          'Invalid event type id',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODE.VALIDATION_ERROR,
        );
      }
    }

    await prisma.$transaction(async (tx) => {
      for (const [index, id] of uniqueIds.entries()) {
        await tx.eventType.update({
          where: { id },
          data: { position: index },
        });
      }
    });

    return this.getEventTypes(userId);
  }
}
