import React from 'react';
import {
  MWButton,
  MWEmptyState,
  StatusBadge,
} from '@/components/primitives';
import { Download, Shield } from 'lucide-react';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import type { CodeStatus } from '@/lib/supabase/types';
import { BatchGeneratorForm } from './BatchGeneratorForm';
import { CodeRowActions } from './CodeRowActions';

export const dynamic = 'force-dynamic';

export default async function AdminVerificationCodesPage({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string; status?: string }>;
}) {
  await requireAdminUser();
  const { batch: selectedBatchId, status: selectedStatus } = await searchParams;

  const supabase = await createServerSupabaseClient();

  // 1. Query live batches
  const { data: rawBatches } = await supabase
    .from('verification_code_batches')
    .select('*')
    .order('created_at', { ascending: false });

  const batches = rawBatches || [];

  // 2. Query live codes
  let codesQuery = supabase
    .from('verification_codes')
    .select('*')
    .order('generated_at', { ascending: false })
    .limit(50);

  if (selectedBatchId) {
    codesQuery = codesQuery.eq('batch_id', selectedBatchId);
  }
  if (selectedStatus) {
    codesQuery = codesQuery.eq('status', selectedStatus as CodeStatus);
  }

  const { data: rawCodes } = await codesQuery;
  const codes = rawCodes || [];

  // Total codes count in DB
  const { count: totalCodesCount } = await supabase
    .from('verification_codes')
    .select('*', { count: 'exact', head: true });

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0B1220] uppercase tracking-tight">
            Verification Code Management
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Generate 1–5,000 product-independent codes per batch with guaranteed global uniqueness.
          </p>
        </div>

        {totalCodesCount && totalCodesCount > 0 ? (
          <a href="/api/admin/export?type=codes" download>
            <MWButton variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5 text-[#1677FF]" />}>
              Export Codes (CSV / XLS)
            </MWButton>
          </a>
        ) : null}
      </div>

      {/* Code Generation Panel */}
      <BatchGeneratorForm />

      {/* Live Batches History */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase text-[#0B1220] tracking-wider">
            Batch Inventory History ({batches.length})
          </h3>
        </div>

        {batches.length > 0 ? (
          <div className="bg-white rounded-[20px] border border-[#DDE5EF] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F8FC] border-b border-[#DDE5EF] text-[#667085] uppercase tracking-wider font-extrabold text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Batch ID</th>
                    <th className="py-3.5 px-4">Generated</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Note</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5EF] text-[#0B1220]">
                  {batches.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#1677FF]">
                        {b.id.slice(0, 8)}...
                      </td>
                      <td className="py-3.5 px-4 font-black">
                        {b.generated_count} / {b.requested_count}
                      </td>
                      <td className="py-3.5 px-4">
                        {b.status === 'completed' ? (
                          <StatusBadge status="verified" label="Ready" size="sm" />
                        ) : b.status === 'pending' ? (
                          <StatusBadge status="pending" label="Generating" size="sm" />
                        ) : (
                          <StatusBadge status="error" label="Failed" size="sm" />
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#667085]">
                        {b.note || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-[#667085]">
                        {new Date(b.created_at).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={`/api/admin/export?type=codes&batch_id=${b.id}`}
                          className="inline-flex items-center gap-1 text-[#1677FF] font-bold hover:underline"
                          download
                        >
                          <Download className="w-3 h-3" />
                          <span>Export</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <MWEmptyState
            icon={Shield}
            title="No Code Batches Generated Yet"
            description="Generated batches will be listed here with batch ID, creation timestamp, requested/successful count, and export options."
          />
        )}
      </div>

      {/* Live Individual Codes Table (Latest 50) */}
      {codes.length > 0 && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-[#0B1220] tracking-wider">
              Recent Codes Stream ({codes.length} showing)
            </h3>
            <span className="text-xs text-[#667085]">
              Total in DB: <strong className="text-[#0B1220]">{totalCodesCount}</strong>
            </span>
          </div>

          <div className="bg-white rounded-[20px] border border-[#DDE5EF] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5F8FC] border-b border-[#DDE5EF] text-[#667085] uppercase tracking-wider font-extrabold text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Scratch Code</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Generated At</th>
                    <th className="py-3.5 px-4 text-right">Status Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DDE5EF] text-[#0B1220]">
                  {codes.map((c) => (
                    <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-black text-sm text-[#0B1220] tracking-wider">
                        {c.code_encrypted || 'MW-****-****'}
                      </td>
                      <td className="py-3.5 px-4">
                        {c.status === 'active' ? (
                          <StatusBadge status="active" label="Unused / Active" size="sm" />
                        ) : c.status === 'verified' ? (
                          <StatusBadge status="verified" label="Verified / Used" size="sm" />
                        ) : c.status === 'disabled' ? (
                          <StatusBadge status="disabled" label="Disabled" size="sm" />
                        ) : (
                          <StatusBadge status="error" label="Revoked" size="sm" />
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#667085]">
                        {new Date(c.generated_at).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <CodeRowActions codeId={c.id} currentStatus={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
