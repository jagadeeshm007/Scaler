import type { Schedule, ScheduleAvailability, DateOverride } from '@prisma/client';
import type { CreateScheduleInput, UpdateScheduleInput } from '@scaler/types';
import { ERROR_CODE, HTTP_STATUS } from '../config/constants';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';

export type ScheduleWithRelations = Schedule & {
  availability: ScheduleAvailability[];
  overrides: DateOverride[];
};

export class ScheduleService {
  static async getSchedules(userId: string): Promise<ScheduleWithRelations[]> {
    return prisma.schedule.findMany({
      where: { user_id: userId },
      include: {
        availability: true,
        overrides: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  static async getScheduleById(userId: string, id: string): Promise<ScheduleWithRelations> {
    const schedule = await prisma.schedule.findUnique({
      where: { id },
      include: {
        availability: true,
        overrides: true,
      },
    });

    if (!schedule || schedule.user_id !== userId) {
      throw new AppError('Schedule not found', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
    }

    return schedule;
  }

  static async createSchedule(
    userId: string,
    data: CreateScheduleInput,
  ): Promise<ScheduleWithRelations> {
    // If this is meant to be default, unset other defaults
    if (data.is_default) {
      await prisma.schedule.updateMany({
        where: { user_id: userId, is_default: true },
        data: { is_default: false },
      });
    }

    // Default Monday-Friday 9am-5pm if not provided
    const defaultAvailability = [1, 2, 3, 4, 5].map((day) => ({
      day_of_week: day,
      start_time: '09:00',
      end_time: '17:00',
    }));

    return prisma.schedule.create({
      data: {
        name: data.name,
        timezone: data.timezone,
        is_default: data.is_default,
        user_id: userId,
        availability: {
          create: data.availability ?? defaultAvailability,
        },
      },
      include: {
        availability: true,
        overrides: true,
      },
    });
  }

  static async updateSchedule(
    userId: string,
    id: string,
    data: UpdateScheduleInput,
  ): Promise<ScheduleWithRelations> {
    await this.getScheduleById(userId, id);

    if (data.is_default) {
      await prisma.schedule.updateMany({
        where: { user_id: userId, is_default: true, id: { not: id } },
        data: { is_default: false },
      });
    }

    return prisma.$transaction(async (tx) => {
      // 1. Update basic schedule details
      await tx.schedule.update({
        where: { id },
        data: {
          name: data.name,
          timezone: data.timezone,
          is_default: data.is_default,
        },
      });

      // 2. Overwrite availability if provided
      if (data.availability) {
        await tx.scheduleAvailability.deleteMany({
          where: { schedule_id: id },
        });
        if (data.availability.length > 0) {
          await tx.scheduleAvailability.createMany({
            data: data.availability.map((a) => ({
              schedule_id: id,
              ...a,
            })),
          });
        }
      }

      // 3. Update overrides if provided
      if (data.overrides) {
        await tx.dateOverride.deleteMany({
          where: { schedule_id: id },
        });
        if (data.overrides.length > 0) {
          await tx.dateOverride.createMany({
            data: data.overrides.map((o) => ({
              schedule_id: id,
              date: new Date(o.date),
              start_time: o.start_time,
              end_time: o.end_time,
              is_available: o.is_available,
              emoji: o.emoji ?? null,
            })),
          });
        }
      }

      // 4. Return updated record
      return tx.schedule.findUniqueOrThrow({
        where: { id },
        include: {
          availability: true,
          overrides: true,
        },
      });
    });
  }

  static async deleteSchedule(userId: string, id: string): Promise<void> {
    const schedule = await this.getScheduleById(userId, id);

    if (schedule.is_default) {
      throw new AppError(
        'Cannot delete default schedule',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
      );
    }

    await prisma.schedule.delete({
      where: { id },
    });
  }
}
