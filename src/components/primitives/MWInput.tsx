import React from 'react';
import { cn } from '@/lib/cn';
import { AlertCircle } from 'lucide-react';

export interface MWInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const MWInput = React.forwardRef<HTMLInputElement, MWInputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold text-[#0B1220] tracking-wide flex items-center gap-1"
          >
            {label}
            {required && (
              <span className="text-[#DC3545]" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-[#667085] pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              'w-full bg-white text-[#0B1220] text-sm rounded-[14px] border border-[#DDE5EF] px-4 py-2.5 transition-all duration-200 placeholder:text-[#98A2B3] focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20 disabled:bg-[#F5F8FC] disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error &&
                'border-[#DC3545] focus:border-[#DC3545] focus:ring-[#DC3545]/20',
              className
            )}
            {...props}
          />

          {rightIcon && !error && (
            <div className="absolute right-3.5 text-[#667085] flex items-center">
              {rightIcon}
            </div>
          )}

          {error && (
            <div className="absolute right-3.5 text-[#DC3545] pointer-events-none flex items-center">
              <AlertCircle className="w-4 h-4" aria-hidden="true" />
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-xs font-medium text-[#DC3545] flex items-center gap-1 mt-0.5"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-xs text-[#667085] mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

MWInput.displayName = 'MWInput';
