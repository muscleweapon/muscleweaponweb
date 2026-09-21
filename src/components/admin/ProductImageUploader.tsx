'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, ArrowUp, ArrowDown, Image as ImageIcon, Loader2 } from 'lucide-react';
import { MWButton } from '@/components/primitives';

export interface UploadedProductImage {
  id?: string;
  cloudinary_public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  alt_text?: string;
  sort_order: number;
}

interface ProductImageUploaderProps {
  images: UploadedProductImage[];
  onChange: (images: UploadedProductImage[]) => void;
  maxImages?: number;
}

export const ProductImageUploader: React.FC<ProductImageUploaderProps> = ({
  images,
  onChange,
  maxImages = 5,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setUploadError(`You can upload a maximum of ${maxImages} images per product.`);
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      // 1. Get signed credentials from server
      const signRes = await fetch('/api/cloudinary/sign', { method: 'POST' });
      if (!signRes.ok) {
        throw new Error('Failed to obtain Cloudinary upload authorization.');
      }
      const { signature, timestamp, apiKey, cloudName, folder } = await signRes.json();

      const newUploadedImages: UploadedProductImage[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validate image size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File "${file.name}" exceeds maximum allowed size (5MB).`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('api_key', apiKey);
        formData.append('timestamp', String(timestamp));
        formData.append('signature', signature);
        formData.append('folder', folder);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: formData,
          }
        );

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData?.error?.message || `Failed to upload "${file.name}".`);
        }

        const data = await uploadRes.json();
        newUploadedImages.push({
          cloudinary_public_id: data.public_id,
          secure_url: data.secure_url,
          width: data.width,
          height: data.height,
          format: data.format,
          alt_text: file.name.replace(/\.[^/.]+$/, ''),
          sort_order: images.length + i,
        });
      }

      onChange([...images, ...newUploadedImages]);
    } catch (err: unknown) {
      console.error('[Image Upload Error]:', err);
      const message = err instanceof Error ? err.message : 'Failed to upload image to Cloudinary.';
      setUploadError(message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const updated = images
      .filter((_, i) => i !== index)
      .map((img, i) => ({ ...img, sort_order: i }));
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const reordered = copy.map((img, i) => ({ ...img, sort_order: i }));
    onChange(reordered);
  };

  const handleAltChange = (index: number, alt: string) => {
    const copy = [...images];
    copy[index] = { ...copy[index], alt_text: alt };
    onChange(copy);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-black uppercase text-[#0B1220] tracking-wider block">
            Product Images ({images.length} / {maxImages})
          </label>
          <span className="text-[11px] text-[#667085]">
            Upload high-resolution PNG or JPG product renders. Stored securely on Cloudinary.
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="product-image-upload"
          disabled={isUploading || images.length >= maxImages}
        />

        <label htmlFor="product-image-upload">
          <MWButton
            type="button"
            size="sm"
            disabled={isUploading || images.length >= maxImages}
            isLoading={isUploading}
            leftIcon={<Upload className="w-3.5 h-3.5" />}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? 'Uploading to Cloudinary...' : 'Upload Images'}
          </MWButton>
        </label>
      </div>

      {uploadError && (
        <div className="p-3 rounded-[10px] bg-[#FEE2E2] border border-[#FCA5A5] text-xs text-[#DC3545] font-bold">
          {uploadError}
        </div>
      )}

      {/* Images List / Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img, index) => (
            <div
              key={img.cloudinary_public_id || index}
              className="relative group rounded-[16px] bg-[#F5F8FC] border border-[#DDE5EF] p-3 flex flex-col gap-2"
            >
              {/* Thumbnail */}
              <div className="relative aspect-square w-full rounded-[10px] bg-white overflow-hidden border border-[#DDE5EF]/60">
                <Image
                  src={img.secure_url}
                  alt={img.alt_text || 'Product image'}
                  fill
                  className="object-contain p-2"
                />
                {index === 0 && (
                  <span className="absolute top-2 left-2 bg-[#1677FF] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-[6px] uppercase tracking-wider shadow-xs">
                    Primary Cover
                  </span>
                )}
              </div>

              {/* Alt Text Input */}
              <input
                type="text"
                value={img.alt_text || ''}
                onChange={(e) => handleAltChange(index, e.target.value)}
                placeholder="Alt text (e.g. Front View)"
                className="w-full text-[11px] bg-white border border-[#DDE5EF] rounded-[8px] px-2.5 py-1 text-[#0B1220] focus:outline-none focus:border-[#1677FF]"
              />

              {/* Reorder and Delete Controls */}
              <div className="flex items-center justify-between pt-1 border-t border-[#DDE5EF]/60">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, 'up')}
                    className="p-1 rounded text-[#667085] hover:bg-white disabled:opacity-30"
                    title="Move earlier"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === images.length - 1}
                    onClick={() => handleMove(index, 'down')}
                    className="p-1 rounded text-[#667085] hover:bg-white disabled:opacity-30"
                    title="Move later"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1 rounded text-[#DC3545] hover:bg-[#FEE2E2] transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#DDE5EF] rounded-[18px] p-8 text-center flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#1677FF] hover:bg-[#F5F8FC]/50 transition-colors"
        >
          <div className="w-12 h-12 rounded-full bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <ImageIcon className="w-6 h-6" />
            )}
          </div>
          <span className="text-xs font-bold text-[#0B1220]">
            {isUploading ? 'Uploading to Cloudinary...' : 'Click or drop product renders here'}
          </span>
          <span className="text-[11px] text-[#667085]">
            Supports JPG, PNG, WEBP up to 5MB. First image becomes the primary product cover.
          </span>
        </div>
      )}
    </div>
  );
};
