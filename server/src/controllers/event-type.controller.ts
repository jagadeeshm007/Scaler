import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { ApiResponse } from '../utils/api-response';
import { EventTypeService } from '../services/event-type.service';

export class EventTypeController {
  static getEventTypes = asyncHandler(async (req: Request, res: Response) => {
    const eventTypes = await EventTypeService.getEventTypes(req.user!.id);
    return ApiResponse.success(res, 'Event types retrieved successfully', eventTypes);
  });

  static getEventTypeById = asyncHandler(async (req: Request, res: Response) => {
    const eventType = await EventTypeService.getEventTypeById(
      req.user!.id,
      req.params.id as string,
    );
    return ApiResponse.success(res, 'Event type retrieved successfully', eventType);
  });

  static createEventType = asyncHandler(async (req: Request, res: Response) => {
    const eventType = await EventTypeService.createEventType(req.user!.id, req.body);
    return ApiResponse.created(res, 'Event type created successfully', eventType);
  });

  static updateEventType = asyncHandler(async (req: Request, res: Response) => {
    const eventType = await EventTypeService.updateEventType(
      req.user!.id,
      req.params.id as string,
      req.body,
    );
    return ApiResponse.success(res, 'Event type updated successfully', eventType);
  });

  static deleteEventType = asyncHandler(async (req: Request, res: Response) => {
    await EventTypeService.deleteEventType(req.user!.id, req.params.id as string);
    return ApiResponse.success(res, 'Event type deleted successfully');
  });
}
