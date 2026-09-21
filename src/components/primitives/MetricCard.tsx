import React from 'react';
import { cn } from '@/lib/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number; // percentage, e.g. 12 for +12%
    isPositive?: boolean;
    periodLabel?: string; // e.g. "vs last month"
  };
  helperText?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon: Icon,
  trend,
  helperText,
  className,
}) => {
  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between rounded-[18px] bg-white border border-[#DDE5EF] p-5 shadow-[0_4px_20px_rgba(11,18,32,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(11,18,32,0.08)] hover:border-[#1677FF]/30',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#667085]">
            {label}
          </span>
          <div className="mt-1 text-2xl md:text-3xl font-black text-[#0B1220] tracking-tight">
            {value}
          </div>
        </div>

        {Icon && (
          <div className="w-11 h-11 rounded-[12px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center shrink-0 border border-[#B4D7FF]/40 group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5" aria-hidden="true" />
          </div>
        )}
      </div>

      {/* Optional period comparison ONLY rendered if trend data is provided */}
      {trend && (
        <div className="mt-4 pt-3 border-t border-[#DDE5EF]/60 flex items-center gap-2 text-xs">
          <span
            className={cn(
              'inline-flex items-center gap-1 font-bold px-1.5 py-0.5 rounded-[6px]',
              trend.isPositive !== false
                ? 'bg-[#E8F8EE] text-[#12A150]'
                : 'bg-[#FEE2E2] text-[#DC3545]'
            )}
          >
            {trend.isPositive !== false ? (
              <TrendingUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
            <span>{trend.value > 0 ? `+${trend.value}%` : `${trend.value}%`}</span>
          </span>
          {trend.periodLabel && (
            <span className="text-[#667085]">{trend.periodLabel}</span>
          )}
        </div>
      )}

      {!trend && helperText && (
        <div className="mt-3 pt-2 text-xs text-[#667085] border-t border-[#DDE5EF]/50">
          {helperText}
        </div>
      )}
    </div>
  );
};
