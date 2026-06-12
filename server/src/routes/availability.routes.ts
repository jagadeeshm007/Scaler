import { Router } from 'express';
import { AvailabilityController } from '../controllers/availability.controller';
import { validate } from '../middleware/validate';
import { createScheduleSchema, updateScheduleSchema } from '@scaler/types';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

router.get('/', AvailabilityController.getSchedules);
router.post('/', validate(createScheduleSchema), AvailabilityController.createSchedule);
router.get('/:id', AvailabilityController.getScheduleById);
router.put('/:id', validate(updateScheduleSchema), AvailabilityController.updateSchedule);
router.delete('/:id', AvailabilityController.deleteSchedule);

export default router;
