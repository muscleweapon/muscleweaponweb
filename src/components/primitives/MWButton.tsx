import React from 'react';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';

export interface MWButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const MWButton = React.forwardRef<HTMLButtonElement, MWButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      leftIcon,
      rightIcon,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none focus-visible:outline-2 focus-visible:outline-offset-2 hover:-translate-y-0.5 active:translate-y-0 disabled:hover:translate-y-0';

    const sizeStyles = {
      sm: 'text-xs px-3.5 py-1.5 rounded-[10px] gap-1.5 min-h-[36px]',
      md: 'text-sm px-5 py-2.5 rounded-[14px] gap-2 min-h-[44px]',
      lg: 'text-base px-7 py-3.5 rounded-[16px] gap-2.5 min-h-[48px]',
    };

    const variantStyles = {
      primary:
        'bg-[#1677FF] text-white hover:bg-[#0757C8] hover:shadow-[0_8px_20px_rgba(22,119,255,0.3)] active:scale-[0.98]',
      secondary:
        'bg-[#EAF4FF] text-[#0757C8] hover:bg-[#D4E8FF] active:scale-[0.98]',
      outline:
        'border border-[#DDE5EF] bg-white text-[#0B1220] hover:border-[#1677FF] hover:text-[#1677FF] hover:bg-[#F5F8FC] active:scale-[0.98]',
      ghost:
        'bg-transparent text-[#0B1220] hover:bg-[#EAF4FF] hover:text-[#1677FF]',
      danger:
        'bg-[#DC3545] text-white hover:bg-[#b02a37] hover:shadow-[0_8px_20px_rgba(220,53,69,0.3)] active:scale-[0.98]',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
            {children}
            {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

MWButton.displayName = 'MWButton';
