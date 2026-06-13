import type { Request, Response } from 'express';
import type { ReorderEventTypesInput } from '@scaler/types';
import { EventTypeService } from '../services/event-type.service';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/async-handler';

export class EventTypeController {
  static getEventTypes = asyncHandler(async (req: Request, res: Response) => {
    const eventTypes = await EventTypeService.getEventTypes(
      (req.user as { id: string; email: string }).id,
    );
    return ApiResponse.success(res, 'Event types retrieved successfully', eventTypes);
  });

  static getEventTypeById = asyncHandler(async (req: Request, res: Response) => {
    const eventType = await EventTypeService.getEventTypeById(
      (req.user as { id: string; email: string }).id,
      req.params.id as string,
    );
    return ApiResponse.success(res, 'Event type retrieved successfully', eventType);
  });

  static createEventType = asyncHandler(async (req: Request, res: Response) => {
    const eventType = await EventTypeService.createEventType(
      (req.user as { id: string; email: string }).id,
      req.body,
    );
    return ApiResponse.created(res, 'Event type created successfully', eventType);
  });

  static updateEventType = asyncHandler(async (req: Request, res: Response) => {
    const eventType = await EventTypeService.updateEventType(
      (req.user as { id: string; email: string }).id,
      req.params.id as string,
      req.body,
    );
    return ApiResponse.success(res, 'Event type updated successfully', eventType);
  });

  static deleteEventType = asyncHandler(async (req: Request, res: Response) => {
    await EventTypeService.deleteEventType(
      (req.user as { id: string; email: string }).id,
      req.params.id as string,
    );
    return ApiResponse.success(res, 'Event type deleted successfully');
  });

  static reorderEventTypes = asyncHandler(async (req: Request, res: Response) => {
    const { ids } = req.body as ReorderEventTypesInput;
    const eventTypes = await EventTypeService.reorderEventTypes(
      (req.user as { id: string; email: string }).id,
      ids,
    );
    return ApiResponse.success(res, 'Event types reordered successfully', eventTypes);
  });
}
