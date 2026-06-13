import { Router } from 'express';

import { IntegrationController } from '../controllers/integration.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Public callback endpoint (OAuth providers will redirect here)
router.get('/:slug/callback', IntegrationController.callback);

// Protected endpoints
router.use(requireAuth);
router.get('/', IntegrationController.getIntegrations);
router.get('/:slug/connect', IntegrationController.connect);
router.delete('/:slug', IntegrationController.disconnect);

export { router as integrationRoutes };
