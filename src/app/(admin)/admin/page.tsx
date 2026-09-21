import React from 'react';
import Link from 'next/link';
import { MWButton, MWEmptyState, MetricCard, StatusBadge } from '@/components/primitives';
import {
  Package,
  KeyRound,
  ShieldCheck,
  Eye,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdminUser();
  const supabase = await createServerSupabaseClient();

  // 1. Live Product Metrics
  const { data: products } = await supabase
    .from('products')
    .select('id, name, slug, category, price_amount, is_visible, specifications, created_at')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  const totalProducts = products?.length || 0;
  const visibleProducts = products?.filter((p) => p.is_visible).length || 0;

  // 2. Live Verification Batches & Codes
  const { count: totalBatches } = await supabase
    .from('verification_code_batches')
    .select('*', { count: 'exact', head: true });

  const { count: totalCodes } = await supabase
    .from('verification_codes')
    .select('*', { count: 'exact', head: true });

  // 3. Live Verification Events
  const { data: rawEvents } = await supabase
    .from('verification_events')
    .select('id, submitted_code_fingerprint, outcome, mobile_masked, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  const { count: totalVerifications } = await supabase
    .from('verification_events')
    .select('*', { count: 'exact', head: true });

  const recentEvents = rawEvents || [];

  const metrics = [
    {
      label: 'Total Products in DB',
      value: totalProducts,
      icon: Package,
      helper: `${visibleProducts} published publicly`,
    },
    {
      label: 'Visible on Public Site',
      value: visibleProducts,
      icon: Eye,
      helper: 'Currently live in store',
    },
    {
      label: 'Total Code Batches',
      value: totalBatches || 0,
      icon: KeyRound,
      helper: `${totalCodes || 0} unique codes generated`,
    },
    {
      label: 'Verification Attempts',
      value: totalVerifications || 0,
      icon: ShieldCheck,
      helper: 'Customer authentication scans',
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl">
      {/* Overview Top Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 bg-white rounded-[20px] border border-[#DDE5EF] shadow-xs">
        <div>
          <h2 className="text-xl font-black text-[#0B1220] uppercase tracking-tight">
            Operational Command Center
          </h2>
          <p className="text-xs text-[#667085] mt-1">
            Displaying live database records. No fabricated analytics or dummy metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/products/new">
            <MWButton size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Product
            </MWButton>
          </Link>
          <Link href="/admin/verification-codes">
            <MWButton variant="outline" size="sm" leftIcon={<KeyRound className="w-3.5 h-3.5 text-[#1677FF]" />}>
              Generate Codes
            </MWButton>
          </Link>
        </div>
      </div>

      {/* Real-time Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metrics.map((item) => (
          <MetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            icon={item.icon}
            helperText={item.helper}
          />
        ))}
      </div>

      {/* Two-column operational section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Product Management */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-[#0B1220] tracking-wider">
              Product Catalog ({totalProducts})
            </h3>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-[#1677FF] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {products && products.length > 0 ? (
            <div className="bg-white rounded-[20px] border border-[#DDE5EF] overflow-hidden shadow-xs">
              <div className="divide-y divide-[#DDE5EF] text-xs">
                {products.slice(0, 5).map((p) => (
                  <div key={p.id} className="p-4 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
                    <div>
                      <h4 className="font-black text-[#0B1220] uppercase tracking-tight">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#667085]">
                        <span className="font-bold text-[#1677FF] uppercase">{p.category}</span>
                        <span>•</span>
                        <span>
                          {p.price_amount ? `₹${p.price_amount.toLocaleString('en-IN')}` : 'Price unlisted'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {p.is_visible ? (
                        <StatusBadge status="active" label="Published" size="sm" />
                      ) : (
                        <StatusBadge status="pending" label="Draft" size="sm" />
                      )}
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-xs font-bold text-[#1677FF] hover:underline"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <MWEmptyState
              icon={Package}
              title="No Products In Database"
              description="The product database is currently empty. Create your first product to configure specifications, nutrition facts, and visibility."
              action={
                <Link href="/admin/products/new">
                  <MWButton size="sm" variant="secondary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                    Create First Product
                  </MWButton>
                </Link>
              }
            />
          )}
        </div>

        {/* Verification Audit Stream */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase text-[#0B1220] tracking-wider">
              Recent Verification Activity ({totalVerifications || 0})
            </h3>
            <Link
              href="/admin/verifications"
              className="text-xs font-bold text-[#1677FF] hover:underline flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recentEvents.length > 0 ? (
            <div className="bg-white rounded-[20px] border border-[#DDE5EF] overflow-hidden shadow-xs">
              <div className="divide-y divide-[#DDE5EF] text-xs">
                {recentEvents.map((e) => (
                  <div key={e.id} className="p-4 flex items-center justify-between hover:bg-[#F8FAFC] transition-colors">
                    <div>
                      <div className="font-mono font-black text-[#0B1220]">
                        {e.submitted_code_fingerprint}
                      </div>
                      <div className="text-[11px] text-[#667085] mt-0.5">
                        Mobile: {e.mobile_masked}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      {e.outcome === 'verified' ? (
                        <StatusBadge status="verified" label="Authentic" size="sm" />
                      ) : e.outcome === 'already_verified' ? (
                        <StatusBadge status="pending" label="Repeat" size="sm" />
                      ) : e.outcome === 'disabled' ? (
                        <StatusBadge status="disabled" label="Deactivated" size="sm" />
                      ) : (
                        <StatusBadge status="error" label="Invalid" size="sm" />
                      )}
                      <span className="text-[11px] text-[#667085] font-mono">
                        {new Date(e.created_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <MWEmptyState
              icon={ShieldCheck}
              title="No Verification Events Recorded"
              description="Customer scratch-code verification attempts will appear here in real-time with outcome, timestamps, masked mobile numbers, and device audit data."
            />
          )}
        </div>
      </div>
    </div>
  );
}
