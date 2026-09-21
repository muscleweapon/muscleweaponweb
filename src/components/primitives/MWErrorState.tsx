import React from 'react';
import { cn } from '@/lib/cn';
import { AlertTriangle } from 'lucide-react';
import { MWButton } from './MWButton';

export interface MWErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  className?: string;
}

export const MWErrorState: React.FC<MWErrorStateProps> = ({
  title = 'Something went wrong',
  description,
  onRetry,
  className,
}) => {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-[20px] border border-[#FCA5A5] bg-[#FFF5F5]',
        className
      )}
    >
      <div className="w-12 h-12 rounded-full bg-[#FEE2E2] flex items-center justify-center text-[#DC3545] mb-4">
        <AlertTriangle className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-base font-bold text-[#0B1220]">{title}</h3>
      <p className="text-xs text-[#667085] max-w-md mt-1 mb-6">
        {description}
      </p>
      {onRetry && (
        <MWButton variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </MWButton>
      )}
    </div>
  );
};
