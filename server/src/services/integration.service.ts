import crypto from 'crypto';

import axios from 'axios';
import { sign, verify } from 'jsonwebtoken';

import { ERROR_CODE, HTTP_STATUS } from '../config/constants';
import { env } from '../config/env';
import { prisma } from '../lib/prisma';
import { AppError } from '../utils/app-error';
import { decrypt, encrypt } from '../utils/encryption';

interface OAuthStatePayload {
  userId: string;
  appSlug: string;
  nonce: string;
}

interface OAuthTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

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
      client_id_encrypted: undefined,
      client_secret_encrypted: undefined,
      is_connected: credentials.some((c) => c.app_id === app.id),
    }));
  }

  /**
   * Generates OAuth redirect URL and signed state token
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

    const state = sign(
      {
        userId,
        appSlug,
        nonce: crypto.randomBytes(16).toString('hex'),
      } satisfies OAuthStatePayload,
      env.JWT_ACCESS_SECRET,
      { expiresIn: '10m' },
    );

    const clientId = app.client_id_encrypted ? decrypt(app.client_id_encrypted) : '';
    const redirectUri =
      app.redirect_uri ?? `${env.APP_BASE_URL}/api/v1/integrations/${appSlug}/callback`;

    let authUrl = '';
    if (appSlug === 'google') {
      authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(app.scopes ?? '')}&access_type=offline&prompt=consent&state=${encodeURIComponent(state)}`;
    } else if (appSlug === 'zoom') {
      authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
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
   * Exchanges OAuth authorization code for tokens and persists encrypted credentials
   */
  static async handleOAuthCallback(
    appSlug: string,
    code: string,
    state: string,
  ): Promise<{ userId: string }> {
    let statePayload: OAuthStatePayload;
    try {
      statePayload = verify(state, env.JWT_ACCESS_SECRET) as OAuthStatePayload;
    } catch {
      throw new AppError(
        'Invalid or expired OAuth state',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
      );
    }

    if (statePayload.appSlug !== appSlug) {
      throw new AppError(
        'OAuth state mismatch',
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODE.VALIDATION_ERROR,
      );
    }

    const app = await prisma.app.findUnique({
      where: { slug: appSlug, is_active: true },
    });

    if (!app) {
      throw new AppError('Integration not found', HTTP_STATUS.NOT_FOUND, ERROR_CODE.NOT_FOUND);
    }

    const clientId = app.client_id_encrypted ? decrypt(app.client_id_encrypted) : '';
    const clientSecret = app.client_secret_encrypted ? decrypt(app.client_secret_encrypted) : '';
    const redirectUri =
      app.redirect_uri ?? `${env.APP_BASE_URL}/api/v1/integrations/${appSlug}/callback`;

    const tokens = await this.exchangeAuthorizationCode(
      appSlug,
      code,
      clientId,
      clientSecret,
      redirectUri,
    );

    const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null;

    await prisma.credential.upsert({
      where: {
        user_id_app_id: {
          user_id: statePayload.userId,
          app_id: app.id,
        },
      },
      create: {
        user_id: statePayload.userId,
        app_id: app.id,
        access_token_encrypted: encrypt(tokens.access_token),
        refresh_token_encrypted: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
        expires_at: expiresAt,
        scopes: app.scopes,
      },
      update: {
        access_token_encrypted: encrypt(tokens.access_token),
        refresh_token_encrypted: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
        expires_at: expiresAt,
        scopes: app.scopes,
      },
    });

    return { userId: statePayload.userId };
  }

  private static async exchangeAuthorizationCode(
    appSlug: string,
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  ): Promise<OAuthTokenResponse> {
    // Demo / seed credentials use mock-* prefix — simulate token exchange locally
    if (clientId.startsWith('mock-')) {
      return {
        access_token: `mock-access-${appSlug}-${crypto.randomBytes(8).toString('hex')}`,
        refresh_token: `mock-refresh-${appSlug}-${crypto.randomBytes(8).toString('hex')}`,
        expires_in: 3600,
      };
    }

    if (appSlug === 'google') {
      const { data } = await axios.post<OAuthTokenResponse>(
        'https://oauth2.googleapis.com/token',
        new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );
      return data;
    }

    if (appSlug === 'zoom') {
      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
      const { data } = await axios.post<OAuthTokenResponse>(
        'https://zoom.us/oauth/token',
        new URLSearchParams({
          code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
        },
      );
      return data;
    }

    throw new AppError(
      'OAuth token exchange not implemented for this provider',
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODE.VALIDATION_ERROR,
    );
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
