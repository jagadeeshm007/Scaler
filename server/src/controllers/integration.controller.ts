import { Request, Response } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { ApiResponse } from '../utils/api-response';
import { IntegrationService } from '../services/integration.service';
import { HTTP_STATUS } from '../config/constants';

export class IntegrationController {
  static getIntegrations = asyncHandler(async (req: Request, res: Response) => {
    const integrations = await IntegrationService.getIntegrations(req.user!.id);
    return ApiResponse.success(res, 'Integrations retrieved successfully', integrations);
  });

  static connect = asyncHandler(async (req: Request, res: Response) => {
    const { authUrl, state } = await IntegrationService.connectIntegration(
      req.user!.id,
      req.params.slug as string,
    );

    // In a real app, set state cookie here for CSRF validation on callback
    res.cookie('oauth_state', state, { httpOnly: true, maxAge: 1000 * 60 * 10 });

    return ApiResponse.success(res, 'OAuth URL generated', { authUrl });
  });

  static disconnect = asyncHandler(async (req: Request, res: Response) => {
    await IntegrationService.disconnectIntegration(req.user!.id, req.params.slug as string);
    return ApiResponse.success(res, 'Integration disconnected successfully');
  });

  static callback = asyncHandler(async (req: Request, res: Response) => {
    // This would typically exchange the code for tokens, encrypt them, and save to Credential table.
    // For this assignment, we'll return a mock success response.
    const { code, state } = req.query;

    if (!code) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send('Missing code parameter');
    }

    // Redirect back to frontend settings page
    res.redirect(`${process.env.CLIENT_URL}/settings/integrations?success=true`);
  });
}
