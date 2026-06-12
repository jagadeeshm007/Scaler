import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { validate } from '../middleware/validate';
import { updateUserSchema } from '@scaler/types';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All user routes require authentication
router.use(requireAuth);

router.get('/me', UserController.getMe);
router.patch('/me', validate(updateUserSchema), UserController.updateMe);

export default router;
