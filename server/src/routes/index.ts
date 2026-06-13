import { Router } from 'express';

import { authRoutes as authRoutes } from './auth.routes';
import { availabilityRoutes as availabilityRoutes } from './availability.routes';
import { bookingRoutes as bookingRoutes } from './booking.routes';
import { event_typeRoutes as eventTypeRoutes } from './event-type.routes';
import { healthRoutes } from './health.routes';
import { integrationRoutes as integrationRoutes } from './integration.routes';
import { publicRoutes as publicRoutes } from './public.routes';
import { userRoutes as userRoutes } from './user.routes';

const router = Router();

// Mount all v1 routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/event-types', eventTypeRoutes);
router.use('/availability', availabilityRoutes);
router.use('/integrations', integrationRoutes);
router.use('/bookings', bookingRoutes);

// Public/unauthenticated routes
// API plan specifies:
// GET /api/v1/public/:username/event-types
// GET /api/v1/public/:username/:slug
// GET /api/v1/slots
router.use('/public', publicRoutes);
router.use('/', publicRoutes);

// Health check endpoint
router.use('/health', healthRoutes);

export { router as apiRoutes };
