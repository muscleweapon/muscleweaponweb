import React from 'react';
import { cn } from '@/lib/cn';
import { AlertCircle, ChevronDown } from 'lucide-react';

export interface MWSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export const MWSelect = React.forwardRef<HTMLSelectElement, MWSelectProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      options,
      id,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
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
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              'w-full appearance-none bg-white text-[#0B1220] text-sm rounded-[14px] border border-[#DDE5EF] px-4 py-2.5 pr-10 transition-all duration-200 focus:outline-none focus:border-[#1677FF] focus:ring-2 focus:ring-[#1677FF]/20 disabled:bg-[#F5F8FC] disabled:cursor-not-allowed',
              error &&
                'border-[#DC3545] focus:border-[#DC3545] focus:ring-[#DC3545]/20',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 text-[#667085] pointer-events-none flex items-center">
            {error ? (
              <AlertCircle className="w-4 h-4 text-[#DC3545]" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            )}
          </div>
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

MWSelect.displayName = 'MWSelect';
