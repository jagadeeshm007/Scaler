import type { Request, Response } from 'express';
import { HTTP_STATUS, ERROR_CODE } from '../config/constants';
import { storeIdempotentResponse, type IdempotentRequest } from '../middleware/idempotency';
import { BookingService } from '../services/booking.service';
import { ApiResponse } from '../utils/api-response';
import { AppError } from '../utils/app-error';
import { asyncHandler } from '../utils/async-handler';

export class BookingController {
  static getBookings = asyncHandler(async (req: Request, res: Response) => {
    const bookings = await BookingService.getBookings(
      (req.user as { id: string; email: string }).id,
    );
    return ApiResponse.success(res, 'Bookings retrieved successfully', bookings);
  });

  static getBookingById = asyncHandler(async (req: Request, res: Response) => {
    const booking = await BookingService.getBookingById(
      (req.user as { id: string; email: string }).id,
      req.params.id as string,
    );
    return ApiResponse.success(res, 'Booking retrieved successfully', booking);
  });

  static createBooking = asyncHandler(async (req: IdempotentRequest, res: Response) => {
    const booking = await BookingService.createBooking(req.body);

    const payload = {
      success: true,
      message: 'Booking created successfully',
      data: booking,
    };

    if (req.idempotencyKey && typeof res.locals.idempotencyRoute === 'string') {
      await storeIdempotentResponse(
        req.idempotencyKey,
        res.locals.idempotencyRoute,
        HTTP_STATUS.CREATED,
        payload,
      );
    }

    return res.status(HTTP_STATUS.CREATED).json(payload);
  });

  static getPublicBookingByUid = asyncHandler(async (req: Request, res: Response) => {
    const booking = await BookingService.getBookingByUid(req.params.uid as string);
    return ApiResponse.success(res, 'Booking retrieved successfully', booking);
  });

  static updatePublicBookingStatus = asyncHandler(async (req: Request, res: Response) => {
    const { timezone } = req.query;
    if (!timezone) {
      throw new AppError(
        'Missing timezone in query parameters',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
      );
    }

    const booking = await BookingService.updateBookingStatusByUid(
      req.params.uid as string,
      req.body,
      timezone as string,
    );
    return ApiResponse.success(res, 'Booking status updated successfully', booking);
  });

  static updateBookingStatus = asyncHandler(async (req: Request, res: Response) => {
    // Requires hostTimezone from frontend to send the correct cancellation/confirmation email times
    const { timezone } = req.query;
    if (!timezone) {
      throw new AppError(
        'Missing timezone in query parameters',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
      );
    }

    const booking = await BookingService.updateBookingStatus(
      (req.user as { id: string; email: string }).id,
      req.params.id as string,
      req.body,
      timezone as string,
    );
    return ApiResponse.success(res, 'Booking status updated successfully', booking);
  });
}
