'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { MWButton } from './MWButton';
import { Filter, X, RotateCcw } from 'lucide-react';
import type { ProductCategory } from '@/lib/validations/product';

export interface FilterState {
  category?: ProductCategory | 'all';
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

export interface FilterPanelProps {
  categories: { id: ProductCategory; label: string; count?: number }[];
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  onReset: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  categories,
  filters,
  onChange,
  onReset,
  isOpenMobile = false,
  onCloseMobile,
  className,
}) => {
  const panelContent = (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DDE5EF]">
        <div className="flex items-center gap-2 text-[#0B1220] font-black uppercase text-sm tracking-wide">
          <Filter className="w-4 h-4 text-[#1677FF]" aria-hidden="true" />
          <span>Filters</span>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-[#667085] hover:text-[#1677FF] flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#0B1220]">
          Categories
        </label>
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ ...filters, category: 'all' })}
            className={cn(
              'flex items-center justify-between px-3 py-2 rounded-[10px] text-xs font-semibold text-left transition-all cursor-pointer',
              !filters.category || filters.category === 'all'
                ? 'bg-[#EAF4FF] text-[#1677FF] font-bold'
                : 'text-[#667085] hover:bg-[#F5F8FC] hover:text-[#0B1220]'
            )}
          >
            <span>All Categories</span>
          </button>
          {categories.map((cat) => {
            const isSelected = filters.category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onChange({ ...filters, category: cat.id })}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-[10px] text-xs font-semibold text-left transition-all cursor-pointer',
                  isSelected
                    ? 'bg-[#EAF4FF] text-[#1677FF] font-bold'
                    : 'text-[#667085] hover:bg-[#F5F8FC] hover:text-[#0B1220]'
                )}
              >
                <span>{cat.label}</span>
                {cat.count !== undefined && (
                  <span
                    className={cn(
                      'text-[11px] px-1.5 py-0.5 rounded-full',
                      isSelected
                        ? 'bg-[#1677FF] text-white'
                        : 'bg-[#F5F8FC] text-[#667085]'
                    )}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Availability Filter */}
      <div className="flex flex-col gap-2.5 pt-4 border-t border-[#DDE5EF]">
        <label className="text-xs font-bold uppercase tracking-wider text-[#0B1220]">
          Availability
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-[#0B1220]">
          <input
            type="checkbox"
            checked={Boolean(filters.inStockOnly)}
            onChange={(e) =>
              onChange({ ...filters, inStockOnly: e.target.checked })
            }
            className="w-4 h-4 rounded-[4px] border-[#DDE5EF] text-[#1677FF] focus:ring-[#1677FF] accent-[#1677FF]"
          />
          <span>In Stock Only</span>
        </label>
      </div>

      {/* Price Range Filter */}
      <div className="flex flex-col gap-2.5 pt-4 border-t border-[#DDE5EF]">
        <label className="text-xs font-bold uppercase tracking-wider text-[#0B1220]">
          Price Range (₹)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full bg-[#F5F8FC] text-xs rounded-[10px] border border-[#DDE5EF] px-3 py-2 focus:bg-white focus:border-[#1677FF] focus:outline-none"
          />
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) =>
              onChange({
                ...filters,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full bg-[#F5F8FC] text-xs rounded-[10px] border border-[#DDE5EF] px-3 py-2 focus:bg-white focus:border-[#1677FF] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Rail (≥ 1024px) */}
      <aside
        className={cn(
          'hidden lg:block w-64 shrink-0 rounded-[18px] bg-white border border-[#DDE5EF] p-5 shadow-[0_4px_20px_rgba(11,18,32,0.04)] h-fit sticky top-24',
          className
        )}
      >
        {panelContent}
      </aside>

      {/* Mobile Drawer (< 1024px) */}
      {isOpenMobile && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Filter products"
          className="fixed inset-0 z-50 lg:hidden flex justify-end bg-[#0B1220]/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="w-full max-w-xs h-full bg-white p-6 shadow-2xl overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-black uppercase tracking-wider text-[#0B1220]">
                  Filter Products
                </span>
                <button
                  type="button"
                  onClick={onCloseMobile}
                  aria-label="Close filters"
                  className="p-1.5 rounded-full bg-[#F5F8FC] text-[#667085] hover:text-[#0B1220]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {panelContent}
            </div>

            <div className="pt-6 border-t border-[#DDE5EF] mt-6">
              <MWButton
                variant="primary"
                className="w-full"
                onClick={onCloseMobile}
              >
                Apply Filters
              </MWButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
