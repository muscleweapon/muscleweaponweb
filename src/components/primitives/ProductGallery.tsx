'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';
import { ChevronLeft, ChevronRight, Maximize2, X, ShieldCheck } from 'lucide-react';

export interface GalleryImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

export interface ProductGalleryProps {
  images: GalleryImage[];
  productName: string;
  className?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  className,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const validImages = images.length > 0 ? images : [];
  const activeImage = validImages[selectedIndex];

  const handlePrevious = () => {
    setSelectedIndex((prev) =>
      prev === 0 ? validImages.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setSelectedIndex((prev) =>
      prev === validImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Main Image Frame */}
      <div className="relative aspect-square w-full rounded-[22px] bg-white border border-[#DDE5EF] p-6 shadow-[0_12px_35px_rgba(11,18,32,0.06)] overflow-hidden flex items-center justify-center group">
        {activeImage ? (
          <>
            <Image
              src={activeImage.url}
              alt={activeImage.altText || productName}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              priority
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />

            {/* Lightbox Trigger Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              aria-label="Enlarge image"
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-xs border border-[#DDE5EF] text-[#0B1220] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-[#1677FF] shadow-xs cursor-pointer focus:opacity-100"
            >
              <Maximize2 className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Next / Previous Controls if multiple images */}
            {validImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevious}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-xs border border-[#DDE5EF] text-[#0B1220] opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-[#1677FF] shadow-xs cursor-pointer focus:opacity-100"
                >
                  <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 backdrop-blur-xs border border-[#DDE5EF] text-[#0B1220] opacity-80 md:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-[#1677FF] shadow-xs cursor-pointer focus:opacity-100"
                >
                  <ChevronRight className="w-5 h-5" aria-hidden="true" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-[#667085] gap-3">
            <div className="w-16 h-16 rounded-full bg-[#F5F8FC] border border-[#DDE5EF] flex items-center justify-center text-[#1677FF] shadow-xs">
              <ShieldCheck className="w-8 h-8" aria-hidden="true" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#94A3B8]">
              Muscle Weapon Authentic
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {validImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {validImages.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              aria-label={`View image ${idx + 1}`}
              className={cn(
                'relative w-20 h-20 shrink-0 rounded-[14px] bg-white border p-1.5 transition-all overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-[#1677FF]',
                selectedIndex === idx
                  ? 'border-[#1677FF] ring-2 ring-[#1677FF]/20 shadow-xs'
                  : 'border-[#DDE5EF] opacity-70 hover:opacity-100 hover:border-[#B4D7FF]'
              )}
            >
              <Image
                src={img.url}
                alt={img.altText || `${productName} thumbnail ${idx + 1}`}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
          className="fixed inset-0 z-50 bg-[#0B1220]/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] aspect-square rounded-[22px] bg-white p-6 shadow-2xl flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close lightbox"
              className="absolute top-4 right-4 p-2.5 rounded-full bg-[#F5F8FC] text-[#0B1220] hover:bg-[#EAF4FF] hover:text-[#1677FF] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" aria-hidden="true" />
            </button>

            <div className="relative w-full h-full">
              <Image
                src={activeImage.url}
                alt={activeImage.altText || productName}
                fill
                sizes="90vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
