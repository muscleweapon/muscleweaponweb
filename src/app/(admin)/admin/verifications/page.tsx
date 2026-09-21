import React from 'react';
import Link from 'next/link';
import {
  MWEmptyState,
  StatusBadge,
  MWButton,
} from '@/components/primitives';
import { ShieldCheck, Filter, Download, Smartphone, MapPin } from 'lucide-react';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import type { VerificationOutcome } from '@/lib/supabase/types';

export const dynamic = 'force-dynamic';

export default async function AdminVerificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ outcome?: string }>;
}) {
  await requireAdminUser();
  const { outcome: selectedOutcome } = await searchParams;

  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('verification_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (selectedOutcome) {
    query = query.eq('outcome', selectedOutcome as VerificationOutcome);
  }

  const { data: rawEvents } = await query;
  const events = rawEvents || [];

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0B1220] uppercase tracking-tight">
            Verification Audit Log
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Immutable live record of all customer scratch-code verification attempts.
          </p>
        </div>

        {events.length > 0 ? (
          <a href="/api/admin/export?type=verifications" download>
            <MWButton variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5 text-[#1677FF]" />}>
              Export Audit Log (CSV / XLS)
            </MWButton>
          </a>
        ) : null}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-[16px] border border-[#DDE5EF] shadow-xs text-xs text-[#667085]">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#1677FF]" aria-hidden="true" />
          <span className="font-bold text-[#0B1220]">Filter Outcome:</span>
          <div className="flex items-center gap-1">
            <Link
              href="/admin/verifications"
              className={`px-2.5 py-1 rounded-[6px] font-bold ${
                !selectedOutcome ? 'bg-[#1677FF] text-white' : 'text-[#0B1220] hover:bg-[#F5F8FC]'
              }`}
            >
              All
            </Link>
            <Link
              href="/admin/verifications?outcome=verified"
              className={`px-2.5 py-1 rounded-[6px] font-bold ${
                selectedOutcome === 'verified'
                  ? 'bg-[#1677FF] text-white'
                  : 'text-[#0B1220] hover:bg-[#F5F8FC]'
              }`}
            >
              Verified
            </Link>
            <Link
              href="/admin/verifications?outcome=already_verified"
              className={`px-2.5 py-1 rounded-[6px] font-bold ${
                selectedOutcome === 'already_verified'
                  ? 'bg-[#1677FF] text-white'
                  : 'text-[#0B1220] hover:bg-[#F5F8FC]'
              }`}
            >
              Already Verified
            </Link>
            <Link
              href="/admin/verifications?outcome=invalid"
              className={`px-2.5 py-1 rounded-[6px] font-bold ${
                selectedOutcome === 'invalid'
                  ? 'bg-[#1677FF] text-white'
                  : 'text-[#0B1220] hover:bg-[#F5F8FC]'
              }`}
            >
              Invalid
            </Link>
          </div>
        </div>

        <span className="font-medium">
          Showing <strong className="text-[#0B1220]">{events.length}</strong> events
        </span>
      </div>

      {/* Audit Log Table OR Genuine Empty State */}
      {events.length > 0 ? (
        <div className="bg-white rounded-[20px] border border-[#DDE5EF] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8FC] border-b border-[#DDE5EF] text-[#667085] uppercase tracking-wider font-extrabold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Outcome</th>
                  <th className="py-3.5 px-4">Code Fingerprint</th>
                  <th className="py-3.5 px-4">Masked Mobile</th>
                  <th className="py-3.5 px-4">Device / Client</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5EF] text-[#0B1220]">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-3.5 px-4">
                      {e.outcome === 'verified' ? (
                        <StatusBadge status="verified" label="Authentic" size="sm" />
                      ) : e.outcome === 'already_verified' ? (
                        <StatusBadge status="pending" label="Repeat Scan" size="sm" />
                      ) : e.outcome === 'disabled' ? (
                        <StatusBadge status="disabled" label="Deactivated" size="sm" />
                      ) : (
                        <StatusBadge status="error" label="Invalid Code" size="sm" />
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0B1220]">
                      {e.submitted_code_fingerprint}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#0B1220]">
                      {e.mobile_masked}
                    </td>
                    <td className="py-3.5 px-4 text-[#667085] max-w-[200px] truncate" title={e.device_ua || ''}>
                      {e.device_ua ? (
                        <span className="flex items-center gap-1">
                          <Smartphone className="w-3.5 h-3.5 shrink-0 text-[#1677FF]" />
                          <span className="truncate">{e.device_ua}</span>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#667085]">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#667085]" />
                        <span className="capitalize">{e.location_status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#667085] font-mono">
                      {new Date(e.created_at).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <MWEmptyState
          icon={ShieldCheck}
          title="No Verification Events Recorded"
          description="Every customer verification attempt will appear here in real-time with timestamp, outcome, masked mobile number, approximate location, and client device metadata."
        />
      )}
    </div>
  );
}
