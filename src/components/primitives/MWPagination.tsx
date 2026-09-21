import React from 'react';
import { cn } from '@/lib/cn';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface MWPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const MWPagination: React.FC<MWPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1.5', className)}
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
        className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] border border-[#DDE5EF] bg-white text-[#0B1220] hover:bg-[#F5F8FC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
      </button>

      {pages.map((page) => {
        const isCurrent = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={isCurrent ? 'page' : undefined}
            className={cn(
              'inline-flex items-center justify-center w-9 h-9 text-xs font-bold rounded-[10px] transition-all',
              isCurrent
                ? 'bg-[#1677FF] text-white shadow-[0_4px_12px_rgba(22,119,255,0.3)]'
                : 'bg-white border border-[#DDE5EF] text-[#0B1220] hover:bg-[#F5F8FC]'
            )}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
        className="inline-flex items-center justify-center w-9 h-9 rounded-[10px] border border-[#DDE5EF] bg-white text-[#0B1220] hover:bg-[#F5F8FC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </button>
    </nav>
  );
};
