import { describe, it, expect, vi, beforeEach } from 'vitest';
import { recordAdminAudit } from './audit-logger';

// Mock Supabase admin client
const mockSingle = vi.fn();
const mockSelect = vi.fn(() => ({ single: mockSingle }));
const mockInsert = vi.fn(() => ({ select: mockSelect }));
const mockFrom = vi.fn(() => ({ insert: mockInsert }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

describe('Admin Audit Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('records an audit entry with sanitized before and after states', async () => {
    mockSingle.mockResolvedValueOnce({ data: { id: 'audit-123' }, error: null });

    const result = await recordAdminAudit({
      actorId: 'admin-1',
      action: 'UPDATE_PRODUCT_VISIBILITY',
      entityType: 'product',
      entityId: 'prod-456',
      beforeState: {
        is_visible: false,
        admin_token: 'secret-token-123',
        customer_phone: '9816090309',
      },
      afterState: {
        is_visible: true,
      },
      reason: 'Product approved for public launch',
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('audit-123');
    expect(mockFrom).toHaveBeenCalledWith('admin_audit_log');
    expect(mockInsert).toHaveBeenCalled();

    // Verify sanitization in insert call
    const calls = mockInsert.mock.calls as unknown as Array<[Record<string, unknown>]>;
    const insertPayload = calls[0]?.[0];
    expect(insertPayload).toBeDefined();
    expect(insertPayload?.action).toBe('UPDATE_PRODUCT_VISIBILITY');
    expect((insertPayload?.before_state as Record<string, unknown>).admin_token).toBe('[REDACTED]');
    expect((insertPayload?.before_state as Record<string, unknown>).customer_phone).toBe('******0309');
    expect(insertPayload?.after_state).toEqual({ is_visible: true });
    expect(insertPayload?.request_correlation_id).toMatch(/^mw-/);
  });

  it('handles database insert errors gracefully without throwing', async () => {
    mockSingle.mockResolvedValueOnce({ data: null, error: new Error('DB connection failed') });

    const result = await recordAdminAudit({
      action: 'DELETE_CODE',
      entityType: 'verification_code',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('DB connection failed');
  });
});
