import { createBookingSchema, updateBookingStatusSchema } from '@scaler/types';
import { Router } from 'express';

import { BookingController } from '../controllers/booking.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Public route to CREATE a booking
router.post('/', validate(createBookingSchema), BookingController.createBooking);

// Protected routes
router.use(requireAuth);
router.get('/', BookingController.getBookings);
router.get('/:id', BookingController.getBookingById);
router.patch(
  '/:id/status',
  validate(updateBookingStatusSchema),
  BookingController.updateBookingStatus,
);

export { router as bookingRoutes };
