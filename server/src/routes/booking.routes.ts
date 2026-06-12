import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { validate } from '../middleware/validate';
import { createBookingSchema, updateBookingStatusSchema } from '@scaler/types';
import { requireAuth } from '../middleware/auth';

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

export default router;
