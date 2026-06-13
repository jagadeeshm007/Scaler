import { updateUserSchema } from '@scaler/types';
import { Router } from 'express';

import { UserController } from '../controllers/user.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get('/me', UserController.getMe);
router.patch('/me', validate(updateUserSchema), UserController.updateMe);

export { router as userRoutes };
