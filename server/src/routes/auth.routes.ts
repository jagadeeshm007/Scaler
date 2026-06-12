import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { loginSchema, bypassSchema } from '@scaler/types';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public auth routes
router.post('/login', validate(loginSchema), AuthController.login);
router.post('/bypass', validate(bypassSchema), AuthController.bypass);
router.post('/refresh', AuthController.refresh);

// Protected auth routes
router.post('/logout', requireAuth, AuthController.logout);

export default router;
