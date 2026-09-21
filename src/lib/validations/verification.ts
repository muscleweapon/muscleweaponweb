import { z } from 'zod';

/**
 * Normalizes Indian mobile numbers to 10 digits
 * Accepts: +919816090309, 919816090309, 09816090309, 9816090309
 */
export function normalizeMobileNumber(raw: string): string {
  const cleaned = raw.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+91')) {
    return cleaned.slice(3);
  }
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned.slice(2);
  }
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Normalizes verification code: uppercase, strips spaces and hyphens
 */
export function normalizeVerificationCode(raw: string): string {
  return raw.replace(/[\s\-]/g, '').toUpperCase();
}

export const verificationAttemptSchema = z.object({
  mobile: z
    .string()
    .min(1, 'Mobile number is required')
    .transform(normalizeMobileNumber)
    .refine((val) => /^[6-9]\d{9}$/.test(val), {
      message: 'Please enter a valid 10-digit Indian mobile number',
    }),
  code: z
    .string()
    .min(1, 'Verification code is required')
    .transform(normalizeVerificationCode)
    .refine((val) => /^[A-Z0-9]{12}$/.test(val), {
      message: 'Verification code must be 12 alphanumeric characters',
    }),
  location: z
    .object({
      latitude: z.number().optional().nullable(),
      longitude: z.number().optional().nullable(),
      status: z.enum(['available', 'denied', 'unavailable']).default('unavailable'),
    })
    .optional(),
});

export type VerificationAttemptInput = z.infer<typeof verificationAttemptSchema>;
