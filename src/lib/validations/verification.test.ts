import { describe, it, expect } from 'vitest';
import {
  verificationAttemptSchema,
  normalizeMobileNumber,
  normalizeVerificationCode,
} from './verification';

describe('Verification Schema and Normalization', () => {
  it('normalizes various Indian phone formats to 10 digits', () => {
    expect(normalizeMobileNumber('+91 98160 90309')).toBe('9816090309');
    expect(normalizeMobileNumber('+91-98160-90309')).toBe('9816090309');
    expect(normalizeMobileNumber('09816090309')).toBe('9816090309');
    expect(normalizeMobileNumber('9816090309')).toBe('9816090309');
  });

  it('normalizes scratch codes: uppercase and strips hyphens/whitespace', () => {
    expect(normalizeVerificationCode('mw-793k-900c')).toBe('MW793K900C');
    expect(normalizeVerificationCode('ABCD EFGH 1234')).toBe('ABCDEFGH1234');
  });

  it('accepts valid mobile and 12-digit code', () => {
    const result = verificationAttemptSchema.safeParse({
      mobile: '+91 9816090309',
      code: 'ABCD-EFGH-1234',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mobile).toBe('9816090309');
      expect(result.data.code).toBe('ABCDEFGH1234');
    }
  });

  it('rejects invalid or missing mobile numbers', () => {
    const invalidPhones = ['', '12345', '1234567890', 'abcdefghij'];
    for (const phone of invalidPhones) {
      const result = verificationAttemptSchema.safeParse({
        mobile: phone,
        code: 'ABCDEFGH1234',
      });
      expect(result.success).toBe(false);
    }
  });

  it('rejects invalid code lengths', () => {
    const invalidCodes = ['', '123', 'TOO-LONG-CODE-OVER-TWELVE'];
    for (const code of invalidCodes) {
      const result = verificationAttemptSchema.safeParse({
        mobile: '9816090309',
        code,
      });
      expect(result.success).toBe(false);
    }
  });
});
