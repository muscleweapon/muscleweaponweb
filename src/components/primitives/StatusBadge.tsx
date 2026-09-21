import React from 'react';
import { cn } from '@/lib/cn';
import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  XCircle,
  Ban,
} from 'lucide-react';

export type StatusVariant =
  | 'active'
  | 'in_stock'
  | 'verified'
  | 'pending'
  | 'disabled'
  | 'error';

export interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<
  StatusVariant,
  {
    icon: React.ComponentType<{ className?: string }>;
    defaultLabel: string;
    classes: string;
  }
> = {
  active: {
    icon: CheckCircle2,
    defaultLabel: 'Active',
    classes: 'bg-[#E8F8EE] text-[#12A150] border-[#B7EBCA]',
  },
  in_stock: {
    icon: CheckCircle2,
    defaultLabel: 'In Stock',
    classes: 'bg-[#E8F8EE] text-[#12A150] border-[#B7EBCA]',
  },
  verified: {
    icon: ShieldCheck,
    defaultLabel: 'Verified Authentic',
    classes: 'bg-[#EAF4FF] text-[#1677FF] border-[#B4D7FF]',
  },
  pending: {
    icon: Clock,
    defaultLabel: 'Pending',
    classes: 'bg-[#FEF3C7] text-[#D97706] border-[#FDE68A]',
  },
  disabled: {
    icon: Ban,
    defaultLabel: 'Disabled',
    classes: 'bg-[#F3F4F6] text-[#6B7280] border-[#E5E7EB]',
  },
  error: {
    icon: XCircle,
    defaultLabel: 'Error / Invalid',
    classes: 'bg-[#FEE2E2] text-[#DC3545] border-[#FCA5A5]',
  },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  className,
  size = 'md',
}) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.disabled;
  const Icon = config.icon;
  const displayLabel = label || config.defaultLabel;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 rounded-[6px]',
    md: 'text-xs px-2.5 py-1 gap-1.5 rounded-[8px]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold border transition-colors',
        sizeClasses[size],
        config.classes,
        className
      )}
    >
      <Icon
        className={cn(
          'shrink-0',
          size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'
        )}
        aria-hidden="true"
      />
      <span>{displayLabel}</span>
    </span>
  );
};
