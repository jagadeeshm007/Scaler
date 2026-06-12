import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';
import { ERROR_CODE, HTTP_STATUS } from '../config/constants';
import { CreateEventTypeInput, UpdateEventTypeInput } from '@scaler/types';

export class EventTypeService {
  static async getEventTypes(userId: string) {
    return prisma.eventType.findMany({
      where: { user_id: userId, deleted_at: null },
      orderBy: { created_at: 'desc' },
    });
  }

  static async getEventTypeById(userId: string, id: string) {
    const eventType = await prisma.eventType.findUnique({
      where: { id },
    });

    if (!eventType || eventType.user_id !== userId || eventType.deleted_at) {
      throw new AppError('Event type not found', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
    }

    return eventType;
  }

  static async createEventType(userId: string, data: CreateEventTypeInput) {
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

    return prisma.eventType.create({
      data: {
        ...data,
        user_id: userId,
      },
    });
  }

  static async updateEventType(userId: string, id: string, data: UpdateEventTypeInput) {
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

    return prisma.eventType.update({
      where: { id },
      data,
    });
  }

  static async deleteEventType(userId: string, id: string) {
    await this.getEventTypeById(userId, id);

    return prisma.eventType.update({
      where: { id },
      data: { deleted_at: new Date(), is_active: false },
    });
  }
}
