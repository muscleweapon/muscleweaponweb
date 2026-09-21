import React from 'react';
import { cn } from '@/lib/cn';

export interface MWSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded';
}

export const MWSkeleton: React.FC<MWSkeletonProps> = ({
  className,
  variant = 'rounded',
  ...props
}) => {
  const variantClasses = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    rounded: 'rounded-[14px]',
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-[#E2E8F0]/80',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
};
