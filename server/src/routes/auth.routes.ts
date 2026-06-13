import { loginSchema, bypassSchema, registerSchema } from '@scaler/types';
import { Router } from 'express';

import { AuthController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rate-limit';
import { validate } from '../middleware/validate';

const router = Router();

// Public auth routes (rate-limited to prevent brute force)
router.post('/register', authRateLimiter, validate(registerSchema), AuthController.register);
router.post('/login', authRateLimiter, validate(loginSchema), AuthController.login);
router.post('/bypass', validate(bypassSchema), AuthController.bypass);
router.post('/refresh', AuthController.refresh);

// Protected auth routes
router.post('/logout', requireAuth, AuthController.logout);

export { router as authRoutes };
