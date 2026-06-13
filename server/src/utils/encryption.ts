import crypto from 'crypto';

import { env } from '../config/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const CURRENT_KEY_VERSION = 'v1';

function loadKey(hexKey: string, label: string): Buffer {
  if (hexKey.length !== 64) {
    throw new Error(`${label} must be exactly 64 hex characters (32 bytes)`);
  }
  return Buffer.from(hexKey, 'hex');
}

const ENCRYPTION_KEYS: Record<string, Buffer> = {
  [CURRENT_KEY_VERSION]: loadKey(env.ENCRYPTION_KEY, 'ENCRYPTION_KEY'),
};

if (env.ENCRYPTION_KEY_PREVIOUS) {
  ENCRYPTION_KEYS.v0 = loadKey(env.ENCRYPTION_KEY_PREVIOUS, 'ENCRYPTION_KEY_PREVIOUS');
}

function encryptWithKey(
  text: string,
  key: Buffer,
): { iv: Buffer; authTag: Buffer; encrypted: string } {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  return { iv, authTag: cipher.getAuthTag(), encrypted };
}

function decryptWithKey(iv: Buffer, authTag: Buffer, encryptedText: string, key: Buffer): string {
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

function tryDecryptParts(
  iv: Buffer,
  authTag: Buffer,
  encryptedText: string,
  keyVersions: string[],
): string {
  let lastError: unknown;
  for (const version of keyVersions) {
    const key = ENCRYPTION_KEYS[version];
    if (!key) {
      continue;
    }
    try {
      return decryptWithKey(iv, authTag, encryptedText, key);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Decryption failed');
}

/**
 * Encrypts plaintext using the current key version.
 * Format: v1:iv(base64):authTag(base64):ciphertext(base64)
 */
export function encrypt(text: string): string {
  const { iv, authTag, encrypted } = encryptWithKey(text, ENCRYPTION_KEYS[CURRENT_KEY_VERSION]);
  return `${CURRENT_KEY_VERSION}:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * Decrypts versioned or legacy (iv:tag:ciphertext) ciphertext.
 * Legacy values attempt current key first, then ENCRYPTION_KEY_PREVIOUS when configured.
 */
export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');

  if (parts[0] === CURRENT_KEY_VERSION && parts.length === 4) {
    const [, ivBase64, authTagBase64, encryptedText] = parts;
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    return decryptWithKey(iv, authTag, encryptedText, ENCRYPTION_KEYS[CURRENT_KEY_VERSION]);
  }

  if (parts.length === 3) {
    const [ivBase64, authTagBase64, encryptedText] = parts;
    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');
    return tryDecryptParts(iv, authTag, encryptedText, [CURRENT_KEY_VERSION, 'v0']);
  }

  throw new Error('Invalid encrypted text format');
}
