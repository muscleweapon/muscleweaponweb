'use client';

import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/cn';
import { X } from 'lucide-react';

export interface MWDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const MWDialog: React.FC<MWDialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = 'md',
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1220]/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cn(
          'relative w-full bg-white rounded-[22px] border border-[#DDE5EF] p-6 shadow-[0_20px_45px_rgba(11,18,32,0.18)] animate-in zoom-in-95 duration-200 focus:outline-none',
          maxWidthClasses[maxWidth],
          className
        )}
      >
        <div className="flex items-start justify-between pb-4 border-b border-[#DDE5EF]">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-[#0B1220]">
              {title}
            </h2>
            {description && (
              <p id={descId} className="text-xs text-[#667085] mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-lg text-[#667085] hover:text-[#0B1220] hover:bg-[#F5F8FC] transition-colors focus-visible:outline-2"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};
