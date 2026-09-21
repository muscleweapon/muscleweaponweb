'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { MWSkeleton } from '@/components/primitives';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  const [isAuthResolving, setIsAuthResolving] = useState(!isLoginPage);

  useEffect(() => {
    // In Phase 1 foundation: simulate auth resolution check.
    // In Phase 2: connects to live Supabase session + profile role check.
    if (!isLoginPage) {
      const timer = setTimeout(() => {
        setIsAuthResolving(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLoginPage]);

  // If on the login page, render clean full-width layout without admin shell
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center p-4">
        {children}
      </div>
    );
  }

  // Protected route boundary: Do NOT render privileged content before authorization resolves!
  if (isAuthResolving) {
    return (
      <div className="min-h-screen bg-[#F5F8FC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-[#1677FF]/10 text-[#1677FF] flex items-center justify-center mb-4">
          <MWSkeleton variant="circular" className="w-8 h-8" />
        </div>
        <p className="text-xs font-bold text-[#0B1220]">Verifying Authorization...</p>
        <p className="text-[11px] text-[#667085] mt-1">
          Validating admin security credentials and permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5F8FC]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar
          title="Muscle Weapon Operations"
          subtitle="Real-time catalog and product authenticity console"
        />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
