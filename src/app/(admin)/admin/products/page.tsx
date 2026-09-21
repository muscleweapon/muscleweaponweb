import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MWButton,
  MWEmptyState,
  StatusBadge,
} from '@/components/primitives';
import { Package, Plus, Search } from 'lucide-react';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import { requireAdminUser } from '@/lib/auth/server-auth';
import type { Database, ProductCategory } from '@/lib/supabase/types';
import { ProductTableActions } from './ProductTableActions';

type ProductWithImages = Database['public']['Tables']['products']['Row'] & {
  product_images?: Database['public']['Tables']['product_images']['Row'][];
  flavor?: string;
  is_in_stock?: boolean;
};

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  await requireAdminUser();
  const { q, category } = await searchParams;

  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('products')
    .select(`
      *,
      product_images (
        id,
        secure_url,
        alt_text,
        sort_order
      )
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category as ProductCategory);
  }
  if (q) {
    query = query.ilike('name', `%${q}%`);
  }

  const { data: rawProducts } = await query;
  const products = (rawProducts || []) as unknown as ProductWithImages[];

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-[#0B1220] uppercase tracking-tight">
            Product Catalog Management
          </h2>
          <p className="text-xs text-[#667085] mt-0.5">
            Manage live supplement specifications, nutrition facts, Cloudinary images, and public visibility.
          </p>
        </div>

        <Link href="/admin/products/new">
          <MWButton size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
            Add New Product
          </MWButton>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white rounded-[16px] border border-[#DDE5EF] shadow-xs">
        <form className="relative w-full sm:w-80" method="GET">
          <Search className="w-4 h-4 text-[#667085] absolute left-3.5 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            name="q"
            defaultValue={q || ''}
            type="text"
            placeholder="Search products by name..."
            className="w-full bg-[#F5F8FC] text-xs text-[#0B1220] rounded-[10px] pl-9 pr-3 py-2 border border-[#DDE5EF] focus:outline-none focus:border-[#1677FF]"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto text-xs text-[#667085]">
          <span className="font-bold text-[#0B1220]">{products.length}</span> {products.length === 1 ? 'product' : 'products'} in database
        </div>
      </div>

      {/* Live Data Table OR Empty State */}
      {products.length > 0 ? (
        <div className="bg-white rounded-[20px] border border-[#DDE5EF] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F8FC] border-b border-[#DDE5EF] text-[#667085] uppercase tracking-wider font-extrabold text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Visibility</th>
                  <th className="py-3.5 px-4">Hero</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DDE5EF] text-[#0B1220]">
                {products.map((p) => {
                  const primaryImg = p.product_images?.[0]?.secure_url || null;
                  const formattedPrice =
                    p.price_amount !== null && p.price_amount !== undefined
                      ? `₹${p.price_amount.toLocaleString('en-IN')}`
                      : 'Not set';
                  const isHero = Boolean(
                    (p.specifications as Record<string, unknown>)?.show_on_hero
                  );

                  return (
                    <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-[10px] bg-[#F5F8FC] border border-[#DDE5EF] overflow-hidden shrink-0 flex items-center justify-center">
                            {primaryImg ? (
                              <Image
                                src={primaryImg}
                                alt={p.name}
                                fill
                                className="object-contain p-1"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-[#667085]" />
                            )}
                          </div>
                          <div>
                            <span className="font-black text-xs uppercase tracking-tight block">
                              {p.name}
                            </span>
                            <span className="text-[11px] text-[#667085] font-mono">
                              /{p.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-[6px] bg-[#EAF4FF] text-[#1677FF]">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-black">
                        {formattedPrice}
                      </td>

                      <td className="py-3.5 px-4">
                        {(p.is_in_stock ?? true) ? (
                          <StatusBadge status="in_stock" size="sm" />
                        ) : (
                          <StatusBadge status="disabled" label="Out of Stock" size="sm" />
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {p.is_visible ? (
                          <StatusBadge status="active" label="Published" size="sm" />
                        ) : (
                          <StatusBadge status="pending" label="Draft / Hidden" size="sm" />
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isHero ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-[6px] bg-[#EAF4FF] text-[#0757C8] border border-[#BEDAFF]">
                            ★ Hero
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-[#94A3B8]">
                            —
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <ProductTableActions
                          productId={p.id}
                          productName={p.name}
                          isVisible={p.is_visible}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <MWEmptyState
          icon={Package}
          title="No Products Found in Database"
          description="There are currently no products registered in Supabase. Products created here will only be publicly discoverable when explicitly set to 'Visible'."
          action={
            <Link href="/admin/products/new">
              <MWButton size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Create First Product
              </MWButton>
            </Link>
          }
        />
      )}
    </div>
  );
}
