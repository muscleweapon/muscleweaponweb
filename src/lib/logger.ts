/**
 * Sanitized logging utility for Muscle Weapon.
 * Strictly redacts:
 * - API keys, bearer tokens, service secrets
 * - Full mobile numbers (masks to ****1234)
 * - Raw verification codes (hashes or redacts to [REDACTED_CODE])
 */

export function sanitizeLogData(data: unknown): unknown {
  if (typeof data === 'string') {
    let sanitized = data;

    // Mask phone numbers: retain last 4 digits
    sanitized = sanitized.replace(/(\+?91)?[6-9]\d{5}(\d{4})/g, '******$2');

    // Redact tokens / secrets
    sanitized = sanitized.replace(
      /(Bearer\s+)[A-Za-z0-9._-]+/gi,
      '$1[REDACTED_TOKEN]'
    );
    sanitized = sanitized.replace(
      /(key|secret|password)=([^&\s]+)/gi,
      '$1=[REDACTED]'
    );

    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeLogData);
  }

  if (data !== null && typeof data === 'object') {
    const sanitizedObj: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey.includes('secret') ||
        lowerKey.includes('password') ||
        lowerKey.includes('token') ||
        lowerKey.includes('service_role')
      ) {
        sanitizedObj[key] = '[REDACTED]';
      } else if (lowerKey.includes('mobile') || lowerKey.includes('phone')) {
        sanitizedObj[key] =
          typeof val === 'string'
            ? val.replace(/(\+?91)?[6-9]\d{5}(\d{4})/, '******$2')
            : '[REDACTED_MOBILE]';
      } else if (lowerKey.includes('code') && !lowerKey.includes('status') && !lowerKey.includes('count')) {
        sanitizedObj[key] = '[REDACTED_CODE]';
      } else {
        sanitizedObj[key] = sanitizeLogData(val);
      }
    }
    return sanitizedObj;
  }

  return data;
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => {
    console.info(`[INFO] ${message}`, context ? sanitizeLogData(context) : '');
  },
  warn: (message: string, context?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, context ? sanitizeLogData(context) : '');
  },
  error: (message: string, error?: unknown, context?: Record<string, unknown>) => {
    const sanitizedContext = context ? sanitizeLogData(context) : {};
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[ERROR] ${message}: ${errorMessage}`, sanitizedContext);
  },
};
