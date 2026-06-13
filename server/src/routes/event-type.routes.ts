import {
  createEventTypeSchema,
  reorderEventTypesSchema,
  updateEventTypeSchema,
} from '@scaler/types';
import { Router } from 'express';

import { EventTypeController } from '../controllers/event-type.controller';
import { requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All event-type routes require authentication
router.use(requireAuth);

router.get('/', EventTypeController.getEventTypes);
router.patch('/reorder', validate(reorderEventTypesSchema), EventTypeController.reorderEventTypes);
router.post('/', validate(createEventTypeSchema), EventTypeController.createEventType);
router.get('/:id', EventTypeController.getEventTypeById);
router.patch('/:id', validate(updateEventTypeSchema), EventTypeController.updateEventType);
router.delete('/:id', EventTypeController.deleteEventType);

export { router as event_typeRoutes };
