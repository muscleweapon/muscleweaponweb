import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { MWButton } from './MWButton';
import { StatusBadge } from './StatusBadge';
import { ShoppingBag, Star, ShieldCheck } from 'lucide-react';
import type { ProductCategory } from '@/lib/validations/product';

export interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  priceAmount?: number | null;
  priceCurrency?: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  inStock?: boolean;
  isInStock?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  name,
  slug,
  category,
  priceAmount,
  priceCurrency = 'INR',
  imageUrl,
  imageAlt,
  rating,
  reviewCount,
  inStock = true,
  isInStock,
  className,
}) => {
  const stockState = isInStock !== undefined ? isInStock : inStock;
  const formattedPrice =
    priceAmount !== undefined && priceAmount !== null
      ? new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: priceCurrency,
          maximumFractionDigits: 0,
        }).format(priceAmount)
      : null;

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-[20px] bg-white border border-[#DDE5EF] p-4 shadow-xs transition-all duration-300 hover:border-[#1677FF]/40 hover:shadow-[0_16px_35px_rgba(11,18,32,0.08)] hover:-translate-y-1',
        className
      )}
    >
      {/* Top badges: Category & Stock */}
      <div className="flex items-center justify-between mb-3 z-10">
        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-[8px] bg-[#EAF4FF] text-[#1677FF]">
          {category}
        </span>
        {stockState ? (
          <StatusBadge status="in_stock" size="sm" />
        ) : (
          <StatusBadge status="disabled" label="Out of Stock" size="sm" />
        )}
      </div>

      {/* Product Image Area */}
      <Link
        href={`/products/${slug}`}
        className="relative aspect-square w-full rounded-[14px] bg-[#F5F8FC] overflow-hidden flex items-center justify-center p-4 mb-4"
        tabIndex={-1}
        aria-hidden="true"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt || name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#667085] gap-2">
            <div className="w-12 h-12 rounded-full bg-white border border-[#DDE5EF] flex items-center justify-center text-[#1677FF] shadow-xs">
              <ShieldCheck className="w-6 h-6" aria-hidden="true" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
              Muscle Weapon
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          {/* Optional real rating - ONLY when exists in DB */}
          {rating && (
            <div className="flex items-center gap-1.5 mb-1.5 text-xs text-[#0B1220]">
              <div className="flex items-center text-[#F59E0B]">
                <Star className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
              </div>
              <span className="font-bold">{rating.toFixed(1)}</span>
              {reviewCount !== undefined && reviewCount !== null && (
                <span className="text-[#667085] text-[11px]">
                  ({reviewCount})
                </span>
              )}
            </div>
          )}

          {/* Product Name */}
          <h3 className="text-sm font-black text-[#0B1220] uppercase tracking-tight line-clamp-2 leading-snug group-hover:text-[#1677FF] transition-colors">
            <Link href={`/products/${slug}`}>{name}</Link>
          </h3>
        </div>

        {/* Price & Action */}
        <div className="mt-4 pt-3 border-t border-[#DDE5EF] flex items-center justify-between gap-2">
          <div>
            {formattedPrice ? (
              <span className="text-base font-black text-[#0B1220] tracking-tight">
                {formattedPrice}
              </span>
            ) : (
              <span className="text-xs font-bold text-[#667085]">
                Price on Request
              </span>
            )}
          </div>

          <Link href={`/products/${slug}`}>
            <MWButton size="sm" variant="primary" leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}>
              View
            </MWButton>
          </Link>
        </div>
      </div>
    </div>
  );
};
