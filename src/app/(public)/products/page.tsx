import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Browse the full Muscle Weapon product catalog — Protein, Mass Gainer, Creatine, Pre-workout, Multivitamins, Calcium, and Omega Gold Fish Oil. Premium sports supplements for athletes.',
};
import { MWButton, MWEmptyState, ProductCard } from '@/components/primitives';
import { PRODUCT_CATEGORIES, type ProductCategory } from '@/lib/validations/product';
import {
  Filter,
  SlidersHorizontal,
  Flame,
  Zap,
  Activity,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type ProductWithImages = Database['public']['Tables']['products']['Row'] & {
  product_images?: Database['public']['Tables']['product_images']['Row'][];
  flavor?: string;
  is_in_stock?: boolean;
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    in_stock?: string;
  }>;
}) {
  const { category, sort = 'featured', in_stock } = await searchParams;
  const activeCategory = category as ProductCategory | undefined;
  const inStockOnly = in_stock === 'true';

  const supabase = await createServerSupabaseClient();

  // 1. Fetch live visible products for the catalog
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
    .eq('is_visible', true)
    .eq('is_deleted', false);

  if (activeCategory && PRODUCT_CATEGORIES.includes(activeCategory)) {
    query = query.eq('category', activeCategory);
  }

  if (sort === 'price_low') {
    query = query.order('price_amount', { ascending: true });
  } else if (sort === 'price_high') {
    query = query.order('price_amount', { ascending: false });
  } else if (sort === 'name') {
    query = query.order('name', { ascending: true });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data: rawProducts } = await query;
  let products = (rawProducts || []) as unknown as ProductWithImages[];

  if (inStockOnly) {
    products = products.filter((p) => (p.is_in_stock ?? true) === true);
  }

  // 2. Fetch category counts from live database
  const { data: allVisibleProducts } = await supabase
    .from('products')
    .select('category')
    .eq('is_visible', true)
    .eq('is_deleted', false);

  const categoryCounts = PRODUCT_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = allVisibleProducts?.filter((p) => p.category === cat).length || 0;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="mw-container py-10 flex flex-col gap-10">
      {/* Page Header (Screen 02 Specification) */}
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-black text-[#0B1220] uppercase tracking-tight">
          Our Products
        </h1>
        <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#667085] mt-2">
          Premium Supplements For Every Goal
        </p>
      </div>

      {/* Horizontal Pill Category Filter Bar (Screen 02 Specification) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
        <Link
          href="/products"
          className={cn(
            'px-4 py-2 rounded-[12px] text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all border',
            !activeCategory
              ? 'bg-[#1677FF] text-white border-[#1677FF] shadow-[0_4px_12px_rgba(22,119,255,0.3)]'
              : 'bg-white text-[#0B1220] border-[#DDE5EF] hover:border-[#1677FF] hover:bg-[#F5F8FC]'
          )}
        >
          All ({allVisibleProducts?.length || 0})
        </Link>
        {PRODUCT_CATEGORIES.map((cat) => {
          const isSelected = activeCategory === cat;
          const count = categoryCounts[cat] || 0;
          return (
            <Link
              key={cat}
              href={`/products?category=${encodeURIComponent(cat)}`}
              className={cn(
                'px-4 py-2 rounded-[12px] text-xs font-extrabold uppercase tracking-wider whitespace-nowrap transition-all border',
                isSelected
                  ? 'bg-[#1677FF] text-white border-[#1677FF] shadow-[0_4px_12px_rgba(22,119,255,0.3)]'
                  : 'bg-white text-[#0B1220] border-[#DDE5EF] hover:border-[#1677FF] hover:bg-[#F5F8FC]'
              )}
            >
              {cat} {count > 0 && `(${count})`}
            </Link>
          );
        })}
      </div>

      {/* Two-column layout: Left Filter Rail + Right Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Rail */}
        <aside className="lg:col-span-1 flex flex-col gap-6">
          <div className="rounded-[22px] bg-white border border-[#DDE5EF] p-6 shadow-xs flex flex-col gap-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#DDE5EF]">
              <div className="flex items-center gap-2 font-black text-sm text-[#0B1220] uppercase tracking-wide">
                <Filter className="w-4 h-4 text-[#1677FF]" aria-hidden="true" />
                <span>Filters</span>
              </div>
              {activeCategory && (
                <Link href="/products" className="text-[11px] font-bold text-[#1677FF] hover:underline">
                  Reset
                </Link>
              )}
            </div>

            {/* Category Checkbox List */}
            <div>
              <h2 className="text-xs font-black uppercase text-[#0B1220] tracking-wider mb-3">
                Category
              </h2>
              <div className="flex flex-col gap-2">
                {PRODUCT_CATEGORIES.map((cat) => {
                  const isChecked = activeCategory === cat;
                  const count = categoryCounts[cat] || 0;
                  return (
                    <Link
                      key={cat}
                      href={isChecked ? '/products' : `/products?category=${encodeURIComponent(cat)}`}
                      className={cn(
                        'flex items-center justify-between text-xs py-1.5 px-2.5 rounded-[8px] transition-colors',
                        isChecked
                          ? 'bg-[#EAF4FF] text-[#1677FF] font-bold'
                          : 'text-[#0B1220] hover:bg-[#F5F8FC]'
                      )}
                    >
                      <span>{cat}</span>
                      <span className="text-[11px] text-[#667085] font-mono">{count}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Brand Authenticity Guarantee */}
            <div className="pt-4 border-t border-[#DDE5EF] flex items-center gap-2.5 text-xs text-[#667085]">
              <ShieldCheck className="w-4 h-4 text-[#1677FF] shrink-0" />
              <span>100% Genuine Muscle Weapon Formulations</span>
            </div>
          </div>
        </aside>

        {/* Right Product Grid Area */}
        <section className="lg:col-span-3 flex flex-col gap-6">
          {/* Top Sort / Counter Bar */}
          <div className="flex items-center justify-between bg-white border border-[#DDE5EF] px-6 py-4 rounded-[18px] text-xs shadow-xs">
            <div className="font-bold text-[#0B1220]">
              Showing <span className="font-black text-[#1677FF]">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
            </div>

            <div className="flex items-center gap-2 text-[#0B1220]">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#667085]" aria-hidden="true" />
              <span className="font-bold text-[#667085]">Sort by:</span>
              <div className="flex items-center gap-1">
                <Link
                  href={`/products?${new URLSearchParams({ ...(activeCategory ? { category: activeCategory } : {}), sort: 'featured' }).toString()}`}
                  className={cn(
                    'px-2.5 py-1 rounded-[6px] text-xs font-bold transition-colors',
                    sort === 'featured' ? 'bg-[#1677FF] text-white' : 'text-[#0B1220] hover:bg-[#F5F8FC]'
                  )}
                >
                  Featured
                </Link>
                <Link
                  href={`/products?${new URLSearchParams({ ...(activeCategory ? { category: activeCategory } : {}), sort: 'price_low' }).toString()}`}
                  className={cn(
                    'px-2.5 py-1 rounded-[6px] text-xs font-bold transition-colors',
                    sort === 'price_low' ? 'bg-[#1677FF] text-white' : 'text-[#0B1220] hover:bg-[#F5F8FC]'
                  )}
                >
                  Price: Low to High
                </Link>
                <Link
                  href={`/products?${new URLSearchParams({ ...(activeCategory ? { category: activeCategory } : {}), sort: 'price_high' }).toString()}`}
                  className={cn(
                    'px-2.5 py-1 rounded-[6px] text-xs font-bold transition-colors',
                    sort === 'price_high' ? 'bg-[#1677FF] text-white' : 'text-[#0B1220] hover:bg-[#F5F8FC]'
                  )}
                >
                  Price: High to Low
                </Link>
              </div>
            </div>
          </div>

          {/* Product Grid or Honest Empty State */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((p) => {
                const primaryImg = p.product_images?.[0]?.secure_url || null;
                return (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    name={p.name}
                    slug={p.slug}
                    category={p.category}
                    priceAmount={p.price_amount}
                    priceCurrency={p.price_currency}
                    imageUrl={primaryImg}
                    imageAlt={p.name}
                    isInStock={p.is_in_stock ?? true}
                  />
                );
              })}
            </div>
          ) : (
            <MWEmptyState
              title={
                activeCategory
                  ? `No Products Available in ${activeCategory}`
                  : 'No Products Available in Catalog'
              }
              description="Our product catalog is currently being updated in Supabase. Products marked visible by administrators will appear here automatically."
              action={
                activeCategory ? (
                  <Link href="/products">
                    <MWButton variant="secondary" size="sm">
                      Clear Filters
                    </MWButton>
                  </Link>
                ) : undefined
              }
            />
          )}
        </section>
      </div>

      {/* Bottom Campaign Banner (Screen 02 Specification) */}
      <section className="rounded-[24px] bg-gradient-to-r from-[#0B1220] via-[#122238] to-[#0757C8] p-8 md:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl mt-6">
        <div className="max-w-xl">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-tight">
            Supplements That Work <br />
            <span className="text-[#1677FF]">As Hard As You Do</span>
          </h2>
          <p className="text-xs sm:text-sm text-white/70 mt-2">
            Engineered with uncompromising purity and clinical dosages for serious athletes.
          </p>
        </div>

        <Link href="/verify">
          <MWButton size="lg" className="shadow-[0_8px_25px_rgba(22,119,255,0.4)]">
            Verify Your Tub
          </MWButton>
        </Link>
      </section>

      {/* 4 Pillars Trust Strip (Screen 02 Specification) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-[22px] bg-white border border-[#DDE5EF] text-center shadow-xs">
        <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-[#0B1220]">
          <Flame className="w-4 h-4 text-[#1677FF]" aria-hidden="true" />
          <span>Build Lean Muscle</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-[#0B1220]">
          <Zap className="w-4 h-4 text-[#1677FF]" aria-hidden="true" />
          <span>Faster Recovery</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-[#0B1220]">
          <Activity className="w-4 h-4 text-[#1677FF]" aria-hidden="true" />
          <span>More Energy</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs font-black uppercase text-[#0B1220]">
          <Award className="w-4 h-4 text-[#1677FF]" aria-hidden="true" />
          <span>Better Performance</span>
        </div>
      </div>
    </div>
  );
}
