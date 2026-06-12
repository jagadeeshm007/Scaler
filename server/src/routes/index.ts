import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import eventTypeRoutes from './event-type.routes';
import availabilityRoutes from './availability.routes';
import publicRoutes from './public.routes';
import integrationRoutes from './integration.routes';
import bookingRoutes from './booking.routes';

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
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
