import { Router } from 'express';
import { EventTypeController } from '../controllers/event-type.controller';
import { validate } from '../middleware/validate';
import { createEventTypeSchema, updateEventTypeSchema } from '@scaler/types';
import { requireAuth } from '../middleware/auth';

const router = Router();

// All event-type routes require authentication
router.use(requireAuth);

router.get('/', EventTypeController.getEventTypes);
router.post('/', validate(createEventTypeSchema), EventTypeController.createEventType);
router.get('/:id', EventTypeController.getEventTypeById);
router.patch('/:id', validate(updateEventTypeSchema), EventTypeController.updateEventType);
router.delete('/:id', EventTypeController.deleteEventType);

export default router;
