import 'server-only';

import { createClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/supabase/types';

export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

export interface AuthContext {
  userId: string;
  email: string | null;
  role: UserRole;
  fullName: string | null;
}

/**
 * Retrieves current authenticated user session and role profile.
 * Returns null if unauthenticated. Does not throw.
 */
export async function getAuthSession(): Promise<AuthContext | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data: rawProfile, error: profileError } = await supabase
      .from('profiles')
      .select('role, full_name, email')
      .eq('id', user.id)
      .single();

    const profile = rawProfile as {
      role: UserRole;
      full_name: string | null;
      email: string | null;
    } | null;

    if (profileError || !profile) {
      return null;
    }

    return {
      userId: user.id,
      email: user.email || profile.email,
      role: profile.role,
      fullName: profile.full_name,
    };
  } catch {
    return null;
  }
}

/**
 * Server-side guard: Requires user to be authenticated with role 'admin' or 'super_admin'.
 * Throws AuthError(401) if unauthenticated, or AuthError(403) if role is insufficient.
 */
export async function requireAdminUser(): Promise<AuthContext> {
  const session = await getAuthSession();

  if (!session) {
    throw new AuthError('Authentication required. Please sign in to access the admin console.', 401);
  }

  if (session.role !== 'admin' && session.role !== 'super_admin') {
    throw new AuthError('Access denied. Administrator privileges required.', 403);
  }

  return session;
}

/**
 * Server-side guard: Requires user to be authenticated with role 'super_admin'.
 * Throws AuthError(401) if unauthenticated, or AuthError(403) if not super_admin.
 */
export async function requireSuperAdminUser(): Promise<AuthContext> {
  const session = await getAuthSession();

  if (!session) {
    throw new AuthError('Authentication required. Please sign in.', 401);
  }

  if (session.role !== 'super_admin') {
    throw new AuthError('Access denied. Super administrator privileges required.', 403);
  }

  return session;
}
