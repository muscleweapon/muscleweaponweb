import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  requireAdminUser,
  requireSuperAdminUser,
  getAuthSession,
  AuthError,
} from './server-auth';

// Mock Supabase server client
const mockGetUser = vi.fn();
const mockSingle = vi.fn();
const mockEq = vi.fn(() => ({ single: mockSingle }));
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

describe('Server-side Authorization Guards (Adversarial Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAuthSession', () => {
    it('returns null when unauthenticated', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: new Error('No session') });
      const session = await getAuthSession();
      expect(session).toBeNull();
    });

    it('returns null when user has no matching profile', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123', email: 'test@mw.com' } }, error: null });
      mockSingle.mockResolvedValueOnce({ data: null, error: new Error('Profile not found') });
      const session = await getAuthSession();
      expect(session).toBeNull();
    });

    it('returns valid AuthContext when user and profile exist', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'user-123', email: 'admin@mw.com' } }, error: null });
      mockSingle.mockResolvedValueOnce({
        data: { role: 'admin', full_name: 'Admin User', email: 'admin@mw.com' },
        error: null,
      });

      const session = await getAuthSession();
      expect(session).not.toBeNull();
      expect(session?.userId).toBe('user-123');
      expect(session?.role).toBe('admin');
    });
  });

  describe('requireAdminUser (Defense in Depth)', () => {
    it('strictly throws 401 Unauthorized for unauthenticated actors', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
      await expect(requireAdminUser()).rejects.toThrow(AuthError);
      try {
        await requireAdminUser();
      } catch (err) {
        expect(err).toBeInstanceOf(AuthError);
        expect((err as AuthError).statusCode).toBe(401);
      }
    });

    it('strictly throws 403 Forbidden for non-admin actors (e.g. customer role)', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'cust-1' } }, error: null });
      mockSingle.mockResolvedValueOnce({
        data: { role: 'customer' as unknown, full_name: 'Customer', email: 'c@mw.com' },
        error: null,
      });

      try {
        await requireAdminUser();
      } catch (err) {
        expect(err).toBeInstanceOf(AuthError);
        expect((err as AuthError).statusCode).toBe(403);
      }
    });

    it('allows access for actor with role admin', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } }, error: null });
      mockSingle.mockResolvedValueOnce({
        data: { role: 'admin', full_name: 'Admin', email: 'a@mw.com' },
        error: null,
      });

      const result = await requireAdminUser();
      expect(result.role).toBe('admin');
      expect(result.userId).toBe('admin-1');
    });

    it('allows access for actor with role super_admin', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'super-1' } }, error: null });
      mockSingle.mockResolvedValueOnce({
        data: { role: 'super_admin', full_name: 'Super Admin', email: 'sa@mw.com' },
        error: null,
      });

      const result = await requireAdminUser();
      expect(result.role).toBe('super_admin');
    });
  });

  describe('requireSuperAdminUser', () => {
    it('strictly rejects ordinary admin actor with 403', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'admin-1' } }, error: null });
      mockSingle.mockResolvedValueOnce({
        data: { role: 'admin', full_name: 'Admin', email: 'a@mw.com' },
        error: null,
      });

      try {
        await requireSuperAdminUser();
      } catch (err) {
        expect(err).toBeInstanceOf(AuthError);
        expect((err as AuthError).statusCode).toBe(403);
      }
    });

    it('allows access for super_admin actor', async () => {
      mockGetUser.mockResolvedValueOnce({ data: { user: { id: 'super-1' } }, error: null });
      mockSingle.mockResolvedValueOnce({
        data: { role: 'super_admin', full_name: 'Super Admin', email: 'sa@mw.com' },
        error: null,
      });

      const result = await requireSuperAdminUser();
      expect(result.role).toBe('super_admin');
    });
  });
});
