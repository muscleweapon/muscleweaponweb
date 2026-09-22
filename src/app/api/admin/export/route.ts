import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdminUser();
    const { searchParams } = new URL(req.url);
    const exportType = searchParams.get('type') || 'codes';
    const batchId = searchParams.get('batch_id');

    const supabase = createAdminClient();

    if (exportType === 'codes') {
      let query = supabase
        .from('verification_codes')
        .select('id, batch_id, code_encrypted, status, generated_at, status_changed_at')
        .order('generated_at', { ascending: false })
        .limit(5000);

      if (batchId) {
        query = query.eq('batch_id', batchId);
      }

      const { data: codes, error } = await query;
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Build CSV Content
      const headers = ['Code ID', 'Batch ID', 'Verification Scratch Code', 'Status', 'Generated At (UTC)', 'Status Changed At'];
      const rows = (codes || []).map((c) => [
        c.id,
        c.batch_id,
        c.code_encrypted || 'HIDDEN',
        c.status,
        c.generated_at,
        c.status_changed_at || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      // Log export job
      await supabase.from('export_jobs').insert({
        requester_id: admin.userId,
        scope_description: `Export verification codes (${codes?.length || 0} rows)`,
        filters_applied: { batch_id: batchId || null },
        format: 'xls',
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="muscle-weapon-codes-${Date.now()}.csv"`,
        },
      });
    }

    if (exportType === 'verifications') {
      const { data: rawEvents, error } = await supabase
        .from('verification_events')
        .select('id, submitted_code_fingerprint, outcome, mobile_masked, location_status, location_city, location_region, location_country, location_source, location_accuracy, device_ua, created_at')
        .order('created_at', { ascending: false })
        .limit(5000);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const events = (rawEvents as any[]) || [];
      const headers = ['Event ID', 'Code Fingerprint', 'Outcome', 'Masked Mobile', 'Location Status', 'City', 'Region', 'Country', 'Location Source', 'Location JSON', 'Device/Browser', 'Timestamp'];
      const rows = events.map((e) => [
        e.id,
        e.submitted_code_fingerprint,
        e.outcome,
        e.mobile_masked,
        e.location_status,
        e.location_city || '',
        e.location_region || '',
        e.location_country || '',
        e.location_source || '',
        e.location_accuracy || '',
        e.device_ua || '',
        e.created_at,
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      await supabase.from('export_jobs').insert({
        requester_id: admin.userId,
        scope_description: `Export verification events (${events?.length || 0} rows)`,
        filters_applied: {},
        format: 'xls',
        status: 'completed',
        completed_at: new Date().toISOString(),
      });

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="muscle-weapon-audit-log-${Date.now()}.csv"`,
        },
      });
    }

    return NextResponse.json({ error: 'Invalid export type.' }, { status: 400 });
  } catch (err: unknown) {
    console.error('[Export Error]:', err);
    const message = err instanceof Error ? err.message : 'Export error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
