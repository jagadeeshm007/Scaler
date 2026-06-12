import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { ApiResponse } from '../utils/api-response';
import { ScheduleService } from '../services/schedule.service';

export class AvailabilityController {
  static getSchedules = asyncHandler(async (req: Request, res: Response) => {
    const schedules = await ScheduleService.getSchedules(req.user!.id);
    return ApiResponse.success(res, 'Schedules retrieved successfully', schedules);
  });

  static getScheduleById = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await ScheduleService.getScheduleById(req.user!.id, req.params.id as string);
    return ApiResponse.success(res, 'Schedule retrieved successfully', schedule);
  });

  static createSchedule = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await ScheduleService.createSchedule(req.user!.id, req.body);
    return ApiResponse.created(res, 'Schedule created successfully', schedule);
  });

  static updateSchedule = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await ScheduleService.updateSchedule(
      req.user!.id,
      req.params.id as string,
      req.body,
    );
    return ApiResponse.success(res, 'Schedule updated successfully', schedule);
  });

  static deleteSchedule = asyncHandler(async (req: Request, res: Response) => {
    await ScheduleService.deleteSchedule(req.user!.id, req.params.id as string);
    return ApiResponse.success(res, 'Schedule deleted successfully');
  });
}
