import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  MWButton,
  MWEmptyState,
  StatusBadge,
  ProductGallery,
} from '@/components/primitives';
import {
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type ProductWithImages = Database['public']['Tables']['products']['Row'] & {
  product_images?: Database['public']['Tables']['product_images']['Row'][];
  flavor?: string;
  short_description?: string;
  ingredients?: string;
  usage_instructions?: string;
  is_in_stock?: boolean;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) return { title: 'Product Not Found' };

  try {
    const supabase = await createServerSupabaseClient();
    const { data: product } = await supabase
      .from('products')
      .select('name, description, product_images(secure_url, alt_text)')
      .eq('slug', slug)
      .eq('is_visible', true)
      .eq('is_deleted', false)
      .single();

    if (!product) {
      return {
        title: 'Product Not Found',
        description: 'The requested product is not available in the catalog.',
      };
    }

    const images = (product as unknown as { product_images?: { secure_url: string; alt_text?: string }[] })?.product_images;
    const firstImage = images?.[0]?.secure_url;

    return {
      title: product.name,
      description: product.description || `Official Muscle Weapon ${product.name} sports nutrition supplement.`,
      openGraph: {
        title: `${product.name} | Muscle Weapon®`,
        description: product.description || `Official Muscle Weapon ${product.name} sports nutrition supplement.`,
        images: firstImage ? [{ url: firstImage, alt: product.name }] : [],
      },
    };
  } catch {
    return {
      title: 'Product Details',
      description: 'Official Muscle Weapon sports nutrition supplement.',
    };
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (!slug) {
    notFound();
  }

  // Query live Supabase database for the product
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
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
    .eq('slug', slug)
    .eq('is_visible', true)
    .eq('is_deleted', false)
    .single();

  const product = data as unknown as ProductWithImages | null;

  // If no product in database with this slug, render the honest contract empty state
  if (!product) {
    return (
      <div className="mw-container py-12 md:py-16 max-w-4xl mx-auto flex flex-col gap-8">
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 text-xs font-semibold text-[#667085]">
          <Link href="/" className="hover:text-[#1677FF] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/products" className="hover:text-[#1677FF] transition-colors">
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#0B1220] font-bold">{slug}</span>
        </nav>

        <MWEmptyState
          title="Product Currently Unavailable"
          description={`The product "${slug}" has not been published yet or is currently inactive. Only verified, live products are accessible.`}
          action={
            <Link href="/products">
              <MWButton variant="primary" size="md">
                Browse Available Products
              </MWButton>
            </Link>
          }
        />
      </div>
    );
  }

  const specs = (typeof product.specifications === 'object' && product.specifications !== null
    ? product.specifications
    : {}) as Record<string, unknown>;

  const flavor = product.flavor || (specs.flavor as string | undefined);
  const shortDescription = product.short_description || (specs.short_description as string | undefined);
  const ingredients = product.ingredients || (specs.ingredients as string | undefined);
  const usageInstructions = product.usage_instructions || (specs.usage_instructions as string | undefined);
  const isInStock = product.is_in_stock ?? (specs.is_in_stock as boolean | undefined) ?? true;

  // Format images for ProductGallery
  const galleryImages = (product.product_images || [])
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => ({
      id: img.id,
      url: img.secure_url,
      altText: img.alt_text || product.name,
      isPrimary: img.sort_order === 0,
    }));

  const formattedPrice =
    product.price_amount !== null && product.price_amount !== undefined
      ? new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: product.price_currency || 'INR',
          maximumFractionDigits: 0,
        }).format(product.price_amount)
      : 'Price on Request';

  return (
    <div className="mw-container py-10 md:py-14 flex flex-col gap-12">
      {/* Breadcrumbs (Section 6.3) */}
      <nav
        aria-label="Breadcrumbs"
        className="flex items-center gap-2 text-xs font-semibold text-[#667085]"
      >
        <Link href="/" className="hover:text-[#1677FF] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        <Link href="/products" className="hover:text-[#1677FF] transition-colors">
          Products
        </Link>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="text-[#1677FF] font-bold">{product.category}</span>
        <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
        <span className="text-[#0B1220] font-bold truncate max-w-[200px] sm:max-w-none">
          {product.name}
        </span>
      </nav>

      {/* Main 2-Column: Gallery + Purchase Panel (Section 6.3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Product Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery
            images={galleryImages}
            productName={product.name}
          />
        </div>

        {/* Right Column: Purchase Panel */}
        <div className="lg:col-span-6 flex flex-col gap-6 rounded-[24px] bg-white border border-[#DDE5EF] p-6 sm:p-8 shadow-[0_12px_35px_rgba(11,18,32,0.06)]">
          {/* Header & Badges */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-[8px] bg-[#EAF4FF] text-[#1677FF]">
              {product.category}
            </span>
            {isInStock ? (
              <StatusBadge status="in_stock" size="sm" />
            ) : (
              <StatusBadge status="disabled" label="Out of Stock" size="sm" />
            )}
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0B1220] uppercase tracking-tight leading-tight">
              {product.name}
            </h1>
            {flavor && (
              <div className="text-xs font-bold text-[#667085] mt-1.5 uppercase tracking-wider">
                Flavor: <span className="text-[#0B1220]">{flavor}</span>
              </div>
            )}
          </div>

          {/* Price display */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-[#DDE5EF]">
            <span className="text-3xl font-black text-[#0B1220] tracking-tight">
              {formattedPrice}
            </span>
            <span className="text-xs text-[#667085] font-medium">
              Inclusive of all taxes
            </span>
          </div>

          {/* Short description */}
          {shortDescription && (
            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              {shortDescription}
            </p>
          )}

          {/* Purchase Actions (External Amazon / Flipkart per PRD) */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="https://www.amazon.in/l/27943762031?ie=UTF8&marketplaceID=A21TJRUUN4KGV&product=B0B5WVQ3SN&me=A1YVXEMI1WMBFS"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <MWButton
                variant="primary"
                size="lg"
                className="w-full shadow-[0_8px_20px_rgba(22,119,255,0.3)]"
                leftIcon={<ShoppingBag className="w-4 h-4" />}
              >
                Buy on Amazon
              </MWButton>
            </a>
            <a
              href="https://www.flipkart.com/search?q=muscle%20weapon&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <MWButton
                variant="outline"
                size="lg"
                className="w-full"
                rightIcon={<ExternalLink className="w-4 h-4 text-[#1677FF]" />}
              >
                Buy on Flipkart
              </MWButton>
            </a>
          </div>

          {/* Tamper-evident Scratch Code Guarantee Pill */}
          <div className="flex items-center gap-3 p-3.5 rounded-[14px] bg-[#F5F8FC] border border-[#DDE5EF] text-xs">
            <div className="w-9 h-9 rounded-[10px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="font-extrabold text-[#0B1220] uppercase text-[11px]">
                Tamper-Evident Anti-Counterfeit Seal
              </div>
              <div className="text-[11px] text-[#667085]">
                Includes a 12-character security scratch code on product packaging.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Sections Below (Section 6.3) */}
      <div className="rounded-[24px] bg-white border border-[#DDE5EF] p-6 sm:p-10 shadow-xs flex flex-col gap-8">
        <div className="border-b border-[#DDE5EF] pb-4">
          <h2 className="text-xl font-black text-[#0B1220] uppercase tracking-tight">
            Product Specifications & Nutrition
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm">
          {/* Description / Overview */}
          <div className="flex flex-col gap-3">
            <h3 className="font-black text-[#0B1220] uppercase text-xs tracking-wider">
              Overview
            </h3>
            <p className="text-[#667085] leading-relaxed">
              {product.description || 'Full nutritional profile and lab certification information.'}
            </p>
          </div>

          {/* Ingredients & Usage */}
          <div className="flex flex-col gap-4">
            {ingredients && (
              <div>
                <h3 className="font-black text-[#0B1220] uppercase text-xs tracking-wider mb-1">
                  Ingredients
                </h3>
                <p className="text-[#667085] leading-relaxed">
                  {ingredients}
                </p>
              </div>
            )}

            {usageInstructions && (
              <div>
                <h3 className="font-black text-[#0B1220] uppercase text-xs tracking-wider mb-1">
                  How to Use
                </h3>
                <p className="text-[#667085] leading-relaxed">
                  {usageInstructions}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
