'use client';

import React, { useEffect } from 'react';
import { cn } from '@/lib/cn';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface MWToastProps {
  type: ToastType;
  message: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  duration?: number;
}

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle2,
    border: 'border-[#B7EBCA]',
    bg: 'bg-white',
    iconColor: 'text-[#12A150]',
    titleColor: 'text-[#0B1220]',
    role: 'status' as const,
    ariaLive: 'polite' as const,
  },
  error: {
    icon: AlertCircle,
    border: 'border-[#FCA5A5]',
    bg: 'bg-white',
    iconColor: 'text-[#DC3545]',
    titleColor: 'text-[#0B1220]',
    role: 'alert' as const,
    ariaLive: 'assertive' as const,
  },
  info: {
    icon: Info,
    border: 'border-[#B4D7FF]',
    bg: 'bg-white',
    iconColor: 'text-[#1677FF]',
    titleColor: 'text-[#0B1220]',
    role: 'status' as const,
    ariaLive: 'polite' as const,
  },
};

export const MWToast: React.FC<MWToastProps> = ({
  type,
  message,
  description,
  isOpen,
  onClose,
  duration = 5000,
}) => {
  useEffect(() => {
    if (!isOpen || duration <= 0) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const config = TOAST_CONFIG[type];
  const Icon = config.icon;

  return (
    <div
      role={config.role}
      aria-live={config.ariaLive}
      className="fixed bottom-5 right-5 z-50 flex items-start gap-3 max-w-sm p-4 bg-white rounded-[16px] border shadow-[0_12px_35px_rgba(11,18,32,0.12)] animate-in slide-in-from-bottom-3 duration-200"
      style={{ borderColor: config.border }}
    >
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', config.iconColor)} aria-hidden="true" />
      <div className="flex-1">
        <p className={cn('text-sm font-bold', config.titleColor)}>{message}</p>
        {description && (
          <p className="text-xs text-[#667085] mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss notification"
        className="p-1 rounded-md text-[#667085] hover:text-[#0B1220] hover:bg-[#F5F8FC] transition-colors"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
};
