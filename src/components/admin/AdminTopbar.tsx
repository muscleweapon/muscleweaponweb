'use client';

import React from 'react';
import { StatusBadge } from '@/components/primitives';
import { User, Shield } from 'lucide-react';

export interface AdminTopbarProps {
  title: string;
  subtitle?: string;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ title, subtitle }) => {
  return (
    <header className="h-18 bg-white border-b border-[#DDE5EF] px-8 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-lg font-black text-[#0B1220] uppercase tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs text-[#667085] mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Real-time DB indicator */}
        <StatusBadge status="active" label="Live System" size="sm" />

        <div className="h-6 w-px bg-[#DDE5EF]" aria-hidden="true" />

        {/* User Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-[12px] bg-[#F5F8FC] border border-[#DDE5EF] text-xs">
          <div className="w-6 h-6 rounded-full bg-[#1677FF] text-white flex items-center justify-center">
            <User className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[#0B1220]">Admin Console</span>
            <span className="text-[10px] text-[#667085] flex items-center gap-1">
              <Shield className="w-2.5 h-2.5 text-[#1677FF]" aria-hidden="true" />
              Authenticated Session
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
