import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../../../src/utils/encryption';
import { env } from '../../../src/config/env';

describe('Encryption Utils', () => {
  it('should encrypt and decrypt a string correctly', () => {
    const plainText = 'super-secret-zoom-token';
    const encryptedText = encrypt(plainText);

    expect(encryptedText).not.toBe(plainText);
    expect(encryptedText).toMatch(/^[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+:[A-Za-z0-9+/=]+$/); // IV:AuthTag:EncryptedData format

    const decryptedText = decrypt(encryptedText);
    expect(decryptedText).toBe(plainText);
  });

  it('should throw an error if attempting to decrypt invalid format', () => {
    expect(() => decrypt('invalid-format-without-colon')).toThrow();
  });

  it('should throw an error if auth tag/encryption key is tampered with', () => {
    const plainText = 'super-secret';
    const encryptedText = encrypt(plainText);

    const [ivBase64, authTagBase64, encryptedBase64] = encryptedText.split(':');

    // Tamper with the encrypted string
    const tamperedBase64 = encryptedBase64.substring(0, encryptedBase64.length - 2) + 'ab';
    const tamperedString = `${ivBase64}:${authTagBase64}:${tamperedBase64}`;

    // Should fail decryption because GCM will fail auth tag verification
    expect(() => decrypt(tamperedString)).toThrow();
  });
});
