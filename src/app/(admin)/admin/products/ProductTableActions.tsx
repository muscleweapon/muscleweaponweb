'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { Edit, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { toggleProductVisibilityAction, deleteProductAction } from '@/lib/actions/products';

interface ProductTableActionsProps {
  productId: string;
  productName: string;
  isVisible: boolean;
}

export const ProductTableActions: React.FC<ProductTableActionsProps> = ({
  productId,
  productName,
  isVisible: initialVisible,
}) => {
  const [isVisible, setIsVisible] = useState(initialVisible);
  const [isPending, startTransition] = useTransition();

  const handleToggleVisibility = () => {
    startTransition(async () => {
      const res = await toggleProductVisibilityAction(productId, !isVisible);
      if (res.success && res.isVisible !== undefined) {
        setIsVisible(res.isVisible);
      }
    });
  };

  const handleDelete = () => {
    const confirmed = window.confirm(
      `Are you sure you want to archive/delete "${productName}"? It will be removed from public view immediately.`
    );
    if (!confirmed) return;

    startTransition(async () => {
      await deleteProductAction(productId);
    });
  };

  return (
    <div className="inline-flex items-center gap-1.5">
      {/* Visibility Toggle Button */}
      <button
        type="button"
        disabled={isPending}
        onClick={handleToggleVisibility}
        className="p-1.5 rounded-[8px] border border-[#DDE5EF] text-[#667085] hover:text-[#1677FF] hover:border-[#1677FF] hover:bg-[#EAF4FF]/50 transition-colors disabled:opacity-50"
        title={isVisible ? 'Click to Hide from Public Site' : 'Click to Publish on Public Site'}
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isVisible ? (
          <Eye className="w-3.5 h-3.5 text-[#12A150]" />
        ) : (
          <EyeOff className="w-3.5 h-3.5 text-[#667085]" />
        )}
      </button>

      {/* Edit Link */}
      <Link
        href={`/admin/products/${productId}`}
        className="p-1.5 rounded-[8px] border border-[#DDE5EF] text-[#667085] hover:text-[#1677FF] hover:border-[#1677FF] hover:bg-[#EAF4FF]/50 transition-colors"
        title="Edit Product Details"
      >
        <Edit className="w-3.5 h-3.5" />
      </Link>

      {/* Delete / Archive Button */}
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="p-1.5 rounded-[8px] border border-[#DDE5EF] text-[#DC3545] hover:border-[#DC3545] hover:bg-[#FEE2E2] transition-colors disabled:opacity-50"
        title="Archive / Delete Product"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
