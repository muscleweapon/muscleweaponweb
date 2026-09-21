'use server';

import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { batchGenerationSchema } from '@/lib/validations/batch';

const CODE_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // 32 characters, no ambiguous 0/O or 1/I

function generateUniqueCodeString(): string {
  const bytes = crypto.randomBytes(10);
  let code = 'MW';
  for (let i = 0; i < 10; i++) {
    code += CODE_CHARSET[bytes[i] % CODE_CHARSET.length];
  }
  return code; // Exactly 12 characters: e.g. MW793K900C12
}

export async function generateCodeBatchAction({
  count,
  note,
}: {
  count: number;
  note?: string;
}) {
  try {
    const admin = await requireAdminUser();

    const validated = batchGenerationSchema.parse({
      count,
      note: note || undefined,
    });

    const supabase = createAdminClient();

    // 1. Create batch record in verification_code_batches
    const { data: batch, error: batchError } = await supabase
      .from('verification_code_batches')
      .insert({
        requested_count: validated.count,
        generated_count: 0,
        code_scheme: 'MW-12CHAR-ALPHANUMERIC',
        status: 'pending',
        actor_id: admin.userId,
        note: validated.note || null,
      })
      .select('id')
      .single();

    if (batchError || !batch) {
      console.error('[Batch Generation Error]:', batchError);
      return { success: false, error: 'Failed to initialize batch record in Supabase.' };
    }

    const batchId = batch.id;
    const totalToGenerate = validated.count;
    const generatedCodesSet = new Set<string>();

    // 2. Generate unique codes in memory
    while (generatedCodesSet.size < totalToGenerate) {
      generatedCodesSet.add(generateUniqueCodeString());
    }

    const codeArray = Array.from(generatedCodesSet);

    // 3. Chunk insertions (500 per chunk) to ensure high performance and avoid query size limits
    const CHUNK_SIZE = 500;
    let successfullyInsertedCount = 0;

    for (let i = 0; i < codeArray.length; i += CHUNK_SIZE) {
      const chunk = codeArray.slice(i, i + CHUNK_SIZE);
      const recordsToInsert = chunk.map((rawCode) => {
        const codeHash = crypto.createHash('sha256').update(rawCode).digest('hex');
        // Formatted display code: MW-XXXX-XXXX
        const formattedDisplay = `${rawCode.slice(0, 2)}-${rawCode.slice(2, 6)}-${rawCode.slice(6, 10)}${rawCode.slice(10)}`;

        return {
          batch_id: batchId,
          code_hash: codeHash,
          code_encrypted: formattedDisplay, // Display representation for authorized admin exports
          status: 'active' as const,
        };
      });

      const { error: insertError } = await supabase
        .from('verification_codes')
        .insert(recordsToInsert);

      if (insertError) {
        console.error('[Chunk Insert Error]:', insertError);
        // If conflict occurs, mark batch failed
        await supabase
          .from('verification_code_batches')
          .update({
            generated_count: successfullyInsertedCount,
            status: 'failed',
          })
          .eq('id', batchId);

        return {
          success: false,
          error: `Error inserting codes into database: ${insertError.message}`,
        };
      }

      successfullyInsertedCount += chunk.length;
    }

    // 4. Update batch record to completed
    await supabase
      .from('verification_code_batches')
      .update({
        generated_count: successfullyInsertedCount,
        status: 'completed',
      })
      .eq('id', batchId);

    // 5. Log audit event
    await supabase.from('admin_audit_log').insert({
      actor_id: admin.userId,
      action: 'verification_batch.generated',
      entity_type: 'verification_code_batch',
      entity_id: batchId,
      after_state: { count: successfullyInsertedCount, note: validated.note },
    });

    // 6. Revalidate admin views
    revalidatePath('/admin/verification-codes');
    revalidatePath('/admin');

    return {
      success: true,
      batchId,
      count: successfullyInsertedCount,
    };
  } catch (err: unknown) {
    console.error('[Generate Code Batch Exception]:', err);
    const message = err instanceof Error ? err.message : 'Internal server error while generating verification codes.';
    return {
      success: false,
      error: message,
    };
  }
}

export async function toggleCodeStatusAction(codeId: string, newStatus: 'active' | 'disabled') {
  try {
    const admin = await requireAdminUser();
    const supabase = createAdminClient();

    const { error } = await supabase
      .from('verification_codes')
      .update({
        status: newStatus,
        status_changed_at: new Date().toISOString(),
        status_changed_by: admin.userId,
      })
      .eq('id', codeId);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase.from('admin_audit_log').insert({
      actor_id: admin.userId,
      action: `code.${newStatus}`,
      entity_type: 'verification_code',
      entity_id: codeId,
      after_state: { status: newStatus },
    });

    revalidatePath('/admin/verification-codes');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized or server error.';
    return { success: false, error: message };
  }
}

export async function deleteCodeAction(codeId: string) {
  try {
    const admin = await requireAdminUser();
    const supabase = createAdminClient();

    // Check if code has been verified
    const { data: verifiedEvent } = await supabase
      .from('verification_events')
      .select('id')
      .eq('code_id', codeId)
      .eq('outcome', 'verified')
      .limit(1)
      .maybeSingle();

    if (verifiedEvent) {
      return {
        success: false,
        error: 'Verified codes cannot be deleted to preserve audit integrity. You can disable them instead.',
      };
    }

    // Revoke or delete
    const { error } = await supabase
      .from('verification_codes')
      .update({
        status: 'revoked',
        status_changed_at: new Date().toISOString(),
        status_changed_by: admin.userId,
      })
      .eq('id', codeId);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase.from('admin_audit_log').insert({
      actor_id: admin.userId,
      action: 'code.revoked',
      entity_type: 'verification_code',
      entity_id: codeId,
      after_state: { status: 'revoked' },
    });

    revalidatePath('/admin/verification-codes');
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unauthorized or server error.';
    return { success: false, error: message };
  }
}
