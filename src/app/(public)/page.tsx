import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MWButton, MWEmptyState, ProductCard } from '@/components/primitives';
import {
  ShieldCheck,
  Zap,
  Award,
  Sparkles,
  ArrowRight,
  Headphones,
  CheckCircle,
  Truck,
  CreditCard,
  Layers,
  Dumbbell,
  Activity,
  Heart,
  Droplet,
  Bone,
} from 'lucide-react';
import { HeroProductCarousel, type HeroProduct } from '@/components/public/HeroProductCarousel';
import { PRODUCT_CATEGORIES } from '@/lib/validations/product';
import { createClient as createServerSupabaseClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

// Category metadata for enhanced athletic visual presentation
const CATEGORY_META: Record<
  string,
  {
    icon: React.ElementType;
    badge: string;
    accent: string;
    sub: string;
  }
> = {
  'Protein': {
    icon: Layers,
    badge: 'Pure Whey',
    accent: '#1677FF',
    sub: 'Lean Muscle & Recovery',
  },
  'Mass gainer': {
    icon: Dumbbell,
    badge: 'High Calorie',
    accent: '#0757C8',
    sub: 'Mass & Strength',
  },
  'Pre-workout': {
    icon: Zap,
    badge: 'Explosive Focus',
    accent: '#0EA5E9',
    sub: 'Energy & Nitric Oxide',
  },
  'Creatine': {
    icon: Activity,
    badge: 'Micronized',
    accent: '#6366F1',
    sub: 'Power & ATP Output',
  },
  'Multivitamins': {
    icon: Heart,
    badge: 'Daily Shield',
    accent: '#10B981',
    sub: 'Immunity & Vitality',
  },
  'Calcium': {
    icon: Bone,
    badge: 'Bone Density',
    accent: '#3B82F6',
    sub: 'Joint & Skeletal Health',
  },
  'Omega gold fish oil': {
    icon: Droplet,
    badge: 'EPA / DHA',
    accent: '#F59E0B',
    sub: 'Heart, Brain & Joints',
  },
};

type ProductWithImages = Database['public']['Tables']['products']['Row'] & {
  product_images?: Database['public']['Tables']['product_images']['Row'][];
  flavor?: string;
  is_in_stock?: boolean;
};

export default async function HomePage() {
  // Query live published products from Supabase (Zero mock data rule)
  const supabase = await createServerSupabaseClient();
  const { data: rawProducts } = await supabase
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
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  const allVisibleProducts = (rawProducts || []) as unknown as ProductWithImages[];

  // Filter for hero products:
  // If products have specifications.show_on_hero === true, use those!
  // If none are specifically marked, fallback to allVisibleProducts so the slider works out-of-the-box!
  const heroProductsRaw = allVisibleProducts.filter(
    (p) => (p.specifications as Record<string, unknown>)?.show_on_hero === true
  );
  const heroProductsToUse = heroProductsRaw.length > 0 ? heroProductsRaw : allVisibleProducts;

  const heroProducts: HeroProduct[] = heroProductsToUse.map((p) => {
    const specs = (p.specifications as Record<string, unknown>) || {};
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      price_amount: p.price_amount,
      price_currency: p.price_currency,
      imageUrl: p.product_images?.[0]?.secure_url || null,
      imageAlt: p.product_images?.[0]?.alt_text || p.name,
      flavor: (specs.flavor as string) || null,
      proteinPerServing: (specs.protein_per_serving as string) || null,
      bcaaPerServing: (specs.bcaa_per_serving as string) || null,
      servings: (specs.servings as string) || null,
      isInStock: p.is_in_stock,
    };
  });

  const featuredProducts = allVisibleProducts.slice(0, 4);

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* Top Banner Tagline (Master Specification) */}
      <div className="bg-[#0B1220] text-white py-2.5 px-4 text-center border-b border-[#1E293B]">
        <p className="text-[11px] sm:text-xs font-black uppercase tracking-widest text-[#EAF4FF]">
          Built Different <span className="text-[#1677FF]">For A Stronger Tomorrow</span>
          <span className="mx-3 text-[#667085] hidden sm:inline">•</span>
          <span className="text-[#94A3B8] font-bold hidden sm:inline">Science | Discipline | Real Results</span>
        </p>
      </div>

      {/* Hero Section: Full-Width Cinematic Background with Database Product Carousel */}
      <section className="relative w-full overflow-hidden border-b border-[#DDE5EF] min-h-[660px] lg:min-h-[740px] xl:min-h-[800px] flex items-center">
        {/* Layer 1: Full-Width Cinematic Athlete & Gym Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero/muscle-weapon-hero-bg.jpg"
            alt="Muscle Weapon Athlete Training in High-Tech Performance Center"
            fill
            priority
            quality={95}
            className="object-cover object-[center_35%] sm:object-[center_28%] lg:object-[center_25%]"
          />
          {/* Layer 2: Controlled Gradient Overlay (Local to left text for 100% legibility; center athlete remains completely sharp & vibrant) */}
          <div className="absolute inset-y-0 left-0 w-full lg:w-3/5 bg-gradient-to-r from-white/92 via-white/55 to-transparent pointer-events-none z-1" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/85 via-white/40 to-transparent lg:hidden pointer-events-none z-1" />
          {/* Subtle bottom ground transition */}
          <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-white/80 via-transparent to-transparent pointer-events-none z-1" />
        </div>

        {/* Content Container (Layer 3: Hero Text + Layer 4: Product Carousel) */}
        <div className="mw-container relative z-10 w-full py-12 lg:py-16 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-14">
          {/* Left Column: Headline, Copy, and Conversion CTAs */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAF4FF]/95 backdrop-blur-md text-[#1677FF] text-xs font-black uppercase tracking-wider mb-6 border border-[#BEDAFF] shadow-xs">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Next-Gen Sports Nutrition 2050</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-[#0B1220] tracking-tight leading-[1.04] uppercase">
              Fuel Your <br />
              <span className="text-[#1677FF] bg-clip-text text-transparent bg-gradient-to-r from-[#1677FF] to-[#0757C8]">
                Potential
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#334155] mt-5 max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Premium sports nutrition engineered for serious athletes. Science-focused formulations. Premium quality. Verify what you trust.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <Link href="/products" className="w-full sm:w-auto">
                <MWButton size="lg" className="w-full sm:w-auto shadow-[0_8px_25px_rgba(22,119,255,0.35)]" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Shop Products
                </MWButton>
              </Link>
              <Link href="/verify" className="w-full sm:w-auto">
                <MWButton
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto bg-white/90 backdrop-blur-sm border-[#DDE5EF] hover:border-[#1677FF] text-[#0B1220]"
                  leftIcon={<ShieldCheck className="w-4 h-4 text-[#1677FF]" />}
                >
                  Verify Your Product
                </MWButton>
              </Link>
            </div>

            {/* 3 Trust Metric Indicators */}
            <div className="mt-10 pt-6 border-t border-[#0B1220]/15 flex items-center justify-center lg:justify-start gap-6 sm:gap-8 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="font-black text-[#0B1220] uppercase">100% Authentic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shadow-xs">
                  <Award className="w-4 h-4" />
                </div>
                <span className="font-black text-[#0B1220] uppercase">Lab Tested</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shadow-xs">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="font-black text-[#0B1220] uppercase">Results Driven</span>
              </div>
            </div>
          </div>

          {/* Right Column: Database Product Carousel Layer */}
          <div className="flex-1 w-full max-w-2xl relative flex justify-center lg:justify-end">
            <HeroProductCarousel products={heroProducts} />
          </div>
        </div>
      </section>

      {/* Trust Strip (Master Spec 5 Pillars) */}
      <section className="mw-container">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 p-6 rounded-[22px] bg-white border border-[#DDE5EF] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-black text-[#0B1220] uppercase tracking-tight">100% Authentic</div>
              <div className="text-[11px] text-[#667085]">Scratch-code verified</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-black text-[#0B1220] uppercase tracking-tight">Premium Quality</div>
              <div className="text-[11px] text-[#667085]">Certified formulations</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-black text-[#0B1220] uppercase tracking-tight">Athlete Focused</div>
              <div className="text-[11px] text-[#667085]">Engineered for strength</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-black text-[#0B1220] uppercase tracking-tight">Fast Shipping</div>
              <div className="text-[11px] text-[#667085]">Orders above ₹999</div>
            </div>
          </div>

          <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-[12px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <div className="text-xs font-black text-[#0B1220] uppercase tracking-tight">Dedicated Support</div>
              <div className="text-[11px] text-[#667085]">Direct customer care</div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category (7 Categories from Screen 01 Specification with Custom Athletic Badges) */}
      <section className="mw-container">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B1220] uppercase tracking-tight">
            Shop By Category
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] mt-2">
            Engineered nutritional systems targeted for strength, recovery, and peak performance.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3.5">
          {PRODUCT_CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category] || {
              icon: Zap,
              badge: 'Supplements',
              accent: '#1677FF',
              sub: 'Peak Performance',
            };
            const IconComponent = meta.icon;

            return (
              <Link
                key={category}
                href={`/products?category=${encodeURIComponent(category)}`}
                className="group p-4 rounded-[18px] bg-white border border-[#DDE5EF] hover:border-[#1677FF] hover:shadow-[0_12px_25px_rgba(22,119,255,0.12)] transition-all duration-200 flex flex-col items-center text-center justify-between min-h-[145px]"
              >
                <div
                  className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs"
                  style={{ backgroundColor: `${meta.accent}15`, color: meta.accent }}
                >
                  <IconComponent className="w-6 h-6" aria-hidden="true" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#667085] block mb-0.5">
                    {meta.badge}
                  </span>
                  <h3 className="text-xs font-black text-[#0B1220] uppercase leading-tight group-hover:text-[#1677FF] transition-colors">
                    {category}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Campaign Banner with Real Athlete Visual (Screen 01 & 02) */}
      <section className="mw-container">
        <div className="relative rounded-[24px] overflow-hidden shadow-xl min-h-[320px] flex items-center">
          {/* Background athlete image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/campaign/muscle-weapon-athlete-banner.jpg"
              alt="Muscle Weapon Athletic Discipline"
              fill
              className="object-cover object-center"
            />
            {/* Gradient Overlay for high-contrast legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B1220]/95 via-[#0B1220]/80 to-transparent" />
          </div>

          <div className="relative z-10 p-8 md:p-14 max-w-xl text-white flex flex-col items-start gap-4">
            <span className="text-xs font-black uppercase tracking-widest text-[#1677FF] bg-white/10 px-3 py-1 rounded-full inline-block backdrop-blur-xs">
              Discipline Builds Freedom
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
              Discipline Today. <br />
              <span className="text-[#1677FF]">A Stronger Tomorrow.</span>
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Every rep, every scoop, every recovery window counts. Fuel your discipline with certified sports nutrition that never compromises.
            </p>
            <Link href="/products" className="mt-2">
              <MWButton size="lg" className="shadow-[0_8px_25px_rgba(22,119,255,0.4)]">
                Explore Supplements
              </MWButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Best Selling Products Section (Live Database Records) */}
      <section className="mw-container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-[#0B1220] uppercase tracking-tight">
              Featured Products
            </h2>
            <p className="text-xs text-[#667085] mt-1">
              Live published products from the verified database.
            </p>
          </div>
          <Link href="/products">
            <MWButton variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
              View All
            </MWButton>
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => {
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
            title="Catalog Being Synchronized"
            description="Products will appear here in real time as they are published by administrators. No placeholder or mock items are displayed."
            action={
              <Link href="/products">
                <MWButton variant="secondary" size="sm">
                  Browse Full Catalog
                </MWButton>
              </Link>
            }
          />
        )}
      </section>

      {/* Real Nutrition, Real People, Real Results Trust Banner */}
      <section className="mw-container">
        <div className="rounded-[22px] bg-white border border-[#DDE5EF] p-8 text-center shadow-xs">
          <h2 className="text-xl sm:text-2xl font-black uppercase text-[#0B1220] tracking-tight mb-2">
            Real Nutrition. Real People. Real Results.
          </h2>
          <p className="text-xs text-[#667085] max-w-lg mx-auto mb-6">
            Muscle Weapon is built on absolute transparency, uncompromised raw materials, and verified anti-counterfeiting authenticity.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-[#0B1220]">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#12A150]" aria-hidden="true" />
              100% Genuine
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#12A150]" aria-hidden="true" />
              Lab Tested
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#12A150]" aria-hidden="true" />
              Scratch-Code Protected
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-[#12A150]" aria-hidden="true" />
              Engineered in India
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
