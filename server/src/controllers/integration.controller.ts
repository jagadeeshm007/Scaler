import type { Request, Response } from 'express';
import { HTTP_STATUS } from '../config/constants';
import { env } from '../config/env';
import { IntegrationService } from '../services/integration.service';
import { ApiResponse } from '../utils/api-response';
import { asyncHandler } from '../utils/async-handler';

export class IntegrationController {
  static getIntegrations = asyncHandler(async (req: Request, res: Response) => {
    const integrations = await IntegrationService.getIntegrations(
      (req.user as { id: string; email: string }).id,
    );
    return ApiResponse.success(res, 'Integrations retrieved successfully', integrations);
  });

  static connect = asyncHandler(async (req: Request, res: Response) => {
    const { authUrl, state } = await IntegrationService.connectIntegration(
      (req.user as { id: string; email: string }).id,
      req.params.slug as string,
    );

    // In a real app, set state cookie here for CSRF validation on callback
    res.cookie('oauth_state', state, { httpOnly: true, maxAge: 1000 * 60 * 10 });

    return ApiResponse.success(res, 'OAuth URL generated', { authUrl });
  });

  static disconnect = asyncHandler(async (req: Request, res: Response) => {
    await IntegrationService.disconnectIntegration(
      (req.user as { id: string; email: string }).id,
      req.params.slug as string,
    );
    return ApiResponse.success(res, 'Integration disconnected successfully');
  });

  static callback = asyncHandler(async (req: Request, res: Response) => {
    const { code, state } = req.query;
    const appSlug = req.params.slug as string;

    if (!code || typeof code !== 'string') {
      res.status(HTTP_STATUS.BAD_REQUEST).send('Missing code parameter');
      return;
    }

    if (!state || typeof state !== 'string') {
      res.status(HTTP_STATUS.BAD_REQUEST).send('Missing state parameter');
      return;
    }

    await IntegrationService.handleOAuthCallback(appSlug, code, state);

    await Promise.resolve();
    res.redirect(`${env.CLIENT_URL}/settings/integrations?success=true&provider=${appSlug}`);
  });
}
