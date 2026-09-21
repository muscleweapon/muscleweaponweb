import React from 'react';
import Link from 'next/link';
import { MWButton, StatusBadge } from '@/components/primitives';
import { Layers, Plus, ArrowRight, Package, Eye } from 'lucide-react';
import { requireAdminUser } from '@/lib/auth/server-auth';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { PRODUCT_CATEGORIES } from '@/lib/validations/product';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  await requireAdminUser();
  const supabase = await createServerSupabaseClient();

  // Query live product counts per category
  const { data: products } = await supabase
    .from('products')
    .select('id, category, is_visible')
    .eq('is_deleted', false);

  const categoryStats = PRODUCT_CATEGORIES.map((cat) => {
    const catProducts = products?.filter((p) => p.category === cat) || [];
    const visibleCount = catProducts.filter((p) => p.is_visible).length;

    return {
      name: cat,
      totalCount: catProducts.length,
      visibleCount,
      status: 'active' as const,
    };
  });

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0B1220] uppercase tracking-tight">
            Category Management
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            The 7 official supplement categories defined in PRD Section 2.
          </p>
        </div>

        <Link href="/admin/products/new">
          <MWButton size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add Product to Category
          </MWButton>
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categoryStats.map((cat) => (
          <div
            key={cat.name}
            className="rounded-[20px] bg-white border border-[#DDE5EF] p-6 shadow-xs flex flex-col justify-between gap-4 hover:border-[#1677FF]/40 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-[12px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <StatusBadge status="active" label="Approved System" size="sm" />
            </div>

            <div>
              <h3 className="text-base font-black text-[#0B1220] uppercase tracking-tight">
                {cat.name}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-xs text-[#667085]">
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5 text-[#0B1220]" />
                  <strong className="text-[#0B1220]">{cat.totalCount}</strong> total
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-[#12A150]" />
                  <strong className="text-[#12A150]">{cat.visibleCount}</strong> published
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#DDE5EF] flex items-center justify-between text-xs">
              <Link
                href={`/admin/products?category=${encodeURIComponent(cat.name)}`}
                className="font-bold text-[#1677FF] hover:underline flex items-center gap-1"
              >
                <span>View products</span>
                <ArrowRight className="w-3 h-3" />
              </Link>

              <Link href={`/products?category=${encodeURIComponent(cat.name)}`} target="_blank">
                <span className="text-[11px] text-[#667085] hover:text-[#0B1220]">
                  Public view ↗
                </span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
