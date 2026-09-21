import 'server-only';

import { createAdminClient } from '@/lib/supabase/admin';
import { sanitizeLogData } from '@/lib/logger';
import { generateCorrelationId } from '@/lib/correlation';
import type { Json, Database } from '@/lib/supabase/types';

export interface AuditLogEntry {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  beforeState?: Record<string, unknown> | null;
  afterState?: Record<string, unknown> | null;
  reason?: string | null;
  correlationId?: string | null;
}

/**
 * Append-only admin audit logging helper.
 * Strictly sanitizes before/after state snapshots to prevent leaking
 * secrets, passwords, tokens, full phone numbers, or raw verification codes.
 */
export async function recordAdminAudit(entry: AuditLogEntry): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const supabase = createAdminClient();
    const correlationId = entry.correlationId || generateCorrelationId();

    const sanitizedBefore = entry.beforeState
      ? (sanitizeLogData(entry.beforeState) as Json)
      : null;

    const sanitizedAfter = entry.afterState
      ? (sanitizeLogData(entry.afterState) as Json)
      : null;

    const insertPayload: Database['public']['Tables']['admin_audit_log']['Insert'] = {
      actor_id: entry.actorId || null,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId || null,
      before_state: sanitizedBefore,
      after_state: sanitizedAfter,
      reason: entry.reason || null,
      request_correlation_id: correlationId,
    };

    const { data, error } = await supabase
      .from('admin_audit_log')
      .insert(insertPayload as never)
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    const row = data as { id: string } | null;
    return { success: true, id: row?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, error: message };
  }
}
