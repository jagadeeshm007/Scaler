import crypto from 'crypto';

import { ERROR_CODE, HTTP_STATUS } from '../config/constants';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';
import { decrypt } from '../utils/encryption';

export class IntegrationService {
  /**
   * Get all available integrations and their connection status for a user
   */
  static async getIntegrations(userId: string): Promise<unknown> {
    const apps = await prisma.app.findMany({
      where: { is_active: true },
    });

    const credentials = await prisma.credential.findMany({
      where: { user_id: userId },
    });

    return apps.map((app) => ({
      ...app,
      // Remove encrypted secrets from public response
      client_id_encrypted: undefined,
      client_secret_encrypted: undefined,
      is_connected: credentials.some((c) => c.app_id === app.id),
    }));
  }

  /**
   * Generates OAuth redirect URL and state token
   */
  static async connectIntegration(
    userId: string,
    appSlug: string,
  ): Promise<{ authUrl: string; state: string }> {
    const app = await prisma.app.findUnique({
      where: { slug: appSlug, is_active: true },
    });

    if (!app) {
      throw new AppError('Integration not found', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
    }

    // In a real app, generate a signed JWT state token to prevent CSRF
    const state = crypto.randomBytes(32).toString('hex');
    // Store state in redis/db if needed, or encode userId in JWT.
    // We'll return it for the controller to handle.

    // Construct OAuth URL based on provider (simplified for demonstration)
    let authUrl = '';
    const clientId = app.client_id_encrypted ? decrypt(app.client_id_encrypted) : '';

    if (appSlug === 'google') {
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId ?? ''}&redirect_uri=${app.redirect_uri ?? ''}&response_type=code&scope=${app.scopes ?? ''}&access_type=offline&prompt=consent&state=${state}`;
    } else if (appSlug === 'zoom') {
      authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId ?? ''}&redirect_uri=${app.redirect_uri ?? ''}&state=${state}`;
    } else {
      throw new AppError(
        'OAuth flow not implemented for this provider',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
      );
    }

    return { authUrl, state };
  }

  /**
   * Disconnect an integration
   */
  static async disconnectIntegration(userId: string, appSlug: string): Promise<void> {
    const app = await prisma.app.findUnique({
      where: { slug: appSlug },
    });

    if (!app) {
      throw new AppError('Integration not found', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
    }

    await prisma.credential.deleteMany({
      where: {
        user_id: userId,
        app_id: app.id,
      },
    });
  }
}
