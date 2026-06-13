import { describe, it, expect } from 'vitest';

import { encrypt, decrypt } from '../../../src/utils/encryption';

describe('Encryption Utils', () => {
  it('should encrypt and decrypt a string correctly with versioned format', () => {
    const plainText = 'super-secret-zoom-token';
    const encryptedText = encrypt(plainText);

    expect(encryptedText).not.toBe(plainText);
    expect(encryptedText.startsWith('v1:')).toBe(true);

    const decryptedText = decrypt(encryptedText);
    expect(decryptedText).toBe(plainText);
  });

  it('should decrypt legacy iv:tag:ciphertext format', () => {
    const plainText = 'legacy-token';
    const legacyEncrypted = encrypt(plainText).split(':').slice(1).join(':');

    const decryptedText = decrypt(legacyEncrypted);
    expect(decryptedText).toBe(plainText);
  });

  it('should throw an error if attempting to decrypt invalid format', () => {
    expect(() => decrypt('invalid-format-without-colon')).toThrow();
  });

  it('should throw an error if auth tag/encryption key is tampered with', () => {
    const plainText = 'super-secret';
    const encryptedText = encrypt(plainText);

    const parts = encryptedText.split(':');
    const tamperedBase64 = parts[parts.length - 1].slice(0, -2) + 'ab';
    parts[parts.length - 1] = tamperedBase64;
    const tamperedString = parts.join(':');

    expect(() => decrypt(tamperedString)).toThrow();
  });
});
