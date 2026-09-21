'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { MWButton } from '@/components/primitives';

export interface HeroProduct {
  id: string;
  name: string;
  slug: string;
  category: string;
  price_amount: number | null;
  price_currency?: string;
  imageUrl: string | null;
  imageAlt?: string;
  flavor?: string | null;
  proteinPerServing?: string | null;
  bcaaPerServing?: string | null;
  servings?: string | null;
  isInStock?: boolean;
}

interface HeroProductCarouselProps {
  products: HeroProduct[];
}

/**
 * Transforms Cloudinary URLs to produce clean transparent PNG cutouts
 * so products sit directly in the 3D scene without white boxes.
 */
function getOptimizedHeroImageUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.includes('cloudinary.com') && url.includes('/image/upload/')) {
    if (!url.includes('e_background_removal') && !url.includes('e_make_transparent')) {
      return url
        .replace('/image/upload/', '/image/upload/e_background_removal/')
        .replace(/\.[a-zA-Z0-9]+$/, '.png');
    }
  }
  return url;
}

export const HeroProductCarousel: React.FC<HeroProductCarouselProps> = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const totalProducts = products.length;

  const handleNext = useCallback(() => {
    if (totalProducts <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % totalProducts);
  }, [totalProducts]);

  const handlePrev = useCallback(() => {
    if (totalProducts <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + totalProducts) % totalProducts);
  }, [totalProducts]);

  // Auto-rotation timer (pause on hover / user interaction)
  useEffect(() => {
    if (totalProducts <= 1 || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(timer);
  }, [totalProducts, isPaused, handleNext]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      handleNext();
    }
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  // If no products in database, render clean empty state
  if (totalProducts === 0) {
    return (
      <div className="relative w-full max-w-md mx-auto flex flex-col items-center justify-center p-8 rounded-[24px] bg-[#0B1220]/75 backdrop-blur-md border border-white/15 shadow-2xl text-white">
        <div className="w-14 h-14 rounded-2xl bg-[#1677FF]/20 text-[#1677FF] flex items-center justify-center mb-3 shadow-inner">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-base font-black uppercase tracking-tight text-center">
          Catalog Synchronizing
        </h3>
        <p className="text-xs text-[#94A3B8] text-center mt-1.5 max-w-xs leading-relaxed">
          Supplements published by administrators will appear here live with scratch-code verification.
        </p>
        <Link href="/products" className="mt-4">
          <MWButton size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
            Explore All Products
          </MWButton>
        </Link>
      </div>
    );
  }

  const activeProduct = products[currentIndex];

  return (
    <div
      className="relative w-full max-w-2xl mx-auto select-none flex flex-col items-center justify-center"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured Muscle Weapon Products"
    >
      {/* Radial Blue Atmospheric Energy behind product stage */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[520px] h-[340px] bg-[#1677FF]/20 rounded-full blur-[80px] pointer-events-none -z-10"
        aria-hidden="true"
      />

      {/* 3D Product Depth Stage */}
      <div className="relative w-full h-[380px] sm:h-[440px] md:h-[480px] flex items-end justify-center perspective-[1200px]">
        {products.map((product, idx) => {
          const isCurrent = idx === currentIndex;
          const isPrev = idx === (currentIndex - 1 + totalProducts) % totalProducts;
          const isNext = idx === (currentIndex + 1) % totalProducts;

          // 3D Depth Transforms:
          // Center: Large active (scale 1.15-1.25), foreground (z-30), opacity 1
          // Neighbors: Smaller (scale 0.8-0.85), shifted left/right with slight overlap, opacity 0.75
          let positionClasses = 'opacity-0 scale-75 pointer-events-none translate-y-8';
          let clickHandler: (() => void) | undefined = undefined;

          if (isCurrent) {
            positionClasses = 'opacity-100 scale-100 sm:scale-115 md:scale-120 z-30 translate-x-0 translate-y-0';
          } else if (isNext && totalProducts > 1) {
            positionClasses =
              'opacity-65 sm:opacity-75 scale-75 sm:scale-85 z-10 translate-x-32 sm:translate-x-44 md:translate-x-52 translate-y-4 hover:opacity-95 transition-all cursor-pointer hidden sm:flex';
            clickHandler = handleNext;
          } else if (isPrev && totalProducts > 2) {
            positionClasses =
              'opacity-65 sm:opacity-75 scale-75 sm:scale-85 z-10 -translate-x-32 sm:-translate-x-44 md:-translate-x-52 translate-y-4 hover:opacity-95 transition-all cursor-pointer hidden sm:flex';
            clickHandler = handlePrev;
          }

          const optimizedImageUrl = getOptimizedHeroImageUrl(product.imageUrl) || product.imageUrl;

          return (
            <div
              key={product.id}
              onClick={clickHandler}
              className={`absolute bottom-6 flex flex-col items-center justify-end transition-all duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] ${positionClasses}`}
              aria-hidden={!isCurrent}
            >
              <div className="relative flex flex-col items-center group">
                {/* Floating Anti-Counterfeit Badge on Active Product */}
                {isCurrent && (
                  <div className="absolute -top-7 sm:-top-9 z-40 bg-[#0B1220]/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-black px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full uppercase tracking-wider shadow-2xl flex items-center gap-1.5 border border-[#1677FF]/50 animate-fade-in">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#1677FF]" />
                    <span>Verified Authentic</span>
                  </div>
                )}

                {/* Product Tub / Render */}
                <div className="relative w-[280px] sm:w-[340px] md:w-[380px] h-[300px] sm:h-[360px] md:h-[400px] flex items-end justify-center">
                  {optimizedImageUrl ? (
                    <Image
                      src={optimizedImageUrl}
                      alt={product.imageAlt || product.name}
                      fill
                      sizes="(max-width: 768px) 300px, 420px"
                      priority={isCurrent}
                      className="object-contain object-bottom drop-shadow-[0_20px_25px_rgba(11,18,32,0.35)] transition-transform duration-300"
                    />
                  ) : (
                    <Image
                      src="/images/hero/muscle-weapon-hero-product.jpg"
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 300px, 420px"
                      priority={isCurrent}
                      className="object-contain object-bottom drop-shadow-[0_20px_25px_rgba(11,18,32,0.35)] transition-transform duration-300"
                    />
                  )}
                </div>

                {/* Physical Contact Shadow System (Anchors jar directly to the platform floor) */}
                <div className="relative w-full flex flex-col items-center pointer-events-none -mt-4">
                  {/* Tight contact shadow directly beneath jar rim */}
                  <div className="w-3/5 h-3 bg-[#0B1220]/90 rounded-full blur-[3px]" />
                  {/* Mid ambient shadow */}
                  <div className="w-4/5 h-5 bg-[#0B1220]/50 rounded-full blur-md -mt-2" />
                  {/* Diffused floor shadow */}
                  <div className="w-[110%] h-8 bg-[#0B1220]/30 rounded-full blur-xl -mt-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Minimal Integrated Product Overlay (Directly integrated into scene, NO floating white card) */}
      {activeProduct && (
        <div className="relative z-30 -mt-2 sm:-mt-4 w-full max-w-lg px-4 flex flex-col items-center">
          <div className="w-full rounded-[20px] bg-[#0B1220]/85 backdrop-blur-md border border-white/15 px-5 py-3.5 shadow-[0_20px_40px_rgba(11,18,32,0.45)] flex items-center justify-between gap-4">
            {/* Left: Product Name, Category/Flavor & Real DB Price */}
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1677FF] bg-[#1677FF]/15 px-2 py-0.5 rounded-md border border-[#1677FF]/30">
                  {activeProduct.category}
                </span>
                {activeProduct.flavor && (
                  <span className="text-[10px] font-bold text-[#94A3B8] uppercase">
                    • {activeProduct.flavor}
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-tight mt-1">
                {activeProduct.name}
              </h3>
              {activeProduct.price_amount !== null && (
                <div className="text-xs font-bold text-[#94A3B8] mt-0.5">
                  <span className="text-sm font-black text-white">
                    ₹{activeProduct.price_amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-[#64748B] ml-1.5">
                    (Tax Incl.)
                  </span>
                </div>
              )}
            </div>

            {/* Right: Minimal View Product Link */}
            <Link
              href={`/products/${activeProduct.slug}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[12px] bg-[#1677FF] hover:bg-[#0757C8] text-white text-xs font-black uppercase tracking-wider shadow-[0_4px_15px_rgba(22,119,255,0.4)] transition-all hover:scale-105 shrink-0"
            >
              <span>View Product</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Carousel Navigation Controls (Glass Buttons & Dots) */}
      {totalProducts > 1 && (
        <div className="flex items-center justify-between w-full max-w-md mt-4 px-4 z-30">
          {/* Previous Button */}
          <button
            onClick={handlePrev}
            type="button"
            className="w-9 h-9 rounded-full bg-[#0B1220]/75 hover:bg-[#1677FF] text-white backdrop-blur-md border border-white/20 transition-all flex items-center justify-center shadow-lg hover:scale-110 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1677FF]"
            aria-label="Previous product"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Pagination Dots */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Product navigation">
            {products.map((p, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={p.id}
                  onClick={() => setCurrentIndex(idx)}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to product ${idx + 1}: ${p.name}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-7 bg-[#1677FF] shadow-[0_0_12px_rgba(22,119,255,0.8)]'
                      : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                />
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            type="button"
            className="w-9 h-9 rounded-full bg-[#0B1220]/75 hover:bg-[#1677FF] text-white backdrop-blur-md border border-white/20 transition-all flex items-center justify-center shadow-lg hover:scale-110 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1677FF]"
            aria-label="Next product"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
