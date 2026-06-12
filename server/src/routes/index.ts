import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import eventTypeRoutes from './event-type.routes';
import availabilityRoutes from './availability.routes';

const router = Router();

// Mount all v1 routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/event-types', eventTypeRoutes);
router.use('/availability', availabilityRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
