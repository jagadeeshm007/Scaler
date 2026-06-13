import type { Request, Response } from 'express';
import { ScheduleService } from '../services/schedule.service';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/async-handler';

export class AvailabilityController {
  static getSchedules = asyncHandler(async (req: Request, res: Response) => {
    const schedules = await ScheduleService.getSchedules(
      (req.user as { id: string; email: string }).id,
    );
    return ApiResponse.success(res, 'Schedules retrieved successfully', schedules);
  });

  static getScheduleById = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await ScheduleService.getScheduleById(
      (req.user as { id: string; email: string }).id,
      req.params.id as string,
    );
    return ApiResponse.success(res, 'Schedule retrieved successfully', schedule);
  });

  static createSchedule = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await ScheduleService.createSchedule(
      (req.user as { id: string; email: string }).id,
      req.body,
    );
    return ApiResponse.created(res, 'Schedule created successfully', schedule);
  });

  static updateSchedule = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await ScheduleService.updateSchedule(
      (req.user as { id: string; email: string }).id,
      req.params.id as string,
      req.body,
    );
    return ApiResponse.success(res, 'Schedule updated successfully', schedule);
  });

  static deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
    await ScheduleService.deleteSchedule(
      (req.user as { id: string; email: string }).id,
      req.params.id as string,
    );
    return ApiResponse.success(res, 'Schedule deleted successfully');
  });
}
