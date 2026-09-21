import React from 'react';
import { cn } from '@/lib/cn';
import { AlertCircle } from 'lucide-react';

export interface MWFormErrorProps {
  message?: string;
  className?: string;
}

export const MWFormError: React.FC<MWFormErrorProps> = ({ message, className }) => {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-2 p-3 text-xs font-medium text-[#DC3545] bg-[#FEE2E2] rounded-[12px] border border-[#FCA5A5]',
        className
      )}
    >
      <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};
