import { describe, it, expect } from 'vitest';
import { sanitizeLogData } from './logger';

describe('Logger Sanitization', () => {
  it('masks Indian mobile numbers retaining only last 4 digits', () => {
    const raw = 'Customer verification for mobile: 9816090309';
    const sanitized = sanitizeLogData(raw) as string;
    expect(sanitized).toContain('******0309');
    expect(sanitized).not.toContain('9816090309');
  });

  it('redacts tokens and passwords in objects', () => {
    const data = {
      user: 'admin',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      password: 'supersecretpassword',
      supabase_service_role: 'secret-service-role-key',
    };
    const sanitized = sanitizeLogData(data) as Record<string, unknown>;
    expect(sanitized.token).toBe('[REDACTED]');
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.supabase_service_role).toBe('[REDACTED]');
    expect(sanitized.user).toBe('admin');
  });
});
