import 'server-only';

import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Privileged Supabase Admin Client.
 * Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS for trusted server operations:
 * - Code batch generation (1-5000)
 * - Append-only audit log writes
 * - Atomic scratch-code verification execution
 * 
 * CAUTION: NEVER import or execute this in client-side components.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!serviceRoleKey && process.env.NODE_ENV === 'production') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for privileged admin operations.');
  }

  return createSupabaseClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
