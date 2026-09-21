'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/cn';
import { MuscleWeaponLogo } from '@/components/brand/MuscleWeaponLogo';
import {
  LayoutDashboard,
  Package,
  Layers,
  KeyRound,
  ShieldCheck,
  Settings,
  LogOut,
  ExternalLink,
} from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/categories', label: 'Categories', icon: Layers },
  { href: '/admin/verification-codes', label: 'Verification Codes', icon: KeyRound },
  { href: '/admin/verifications', label: 'Audit Logs', icon: ShieldCheck },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-64 bg-[#0B1220] text-white flex flex-col justify-between border-r border-[#1E293B] shrink-0 min-h-screen">
      {/* Top: Brand Header */}
      <div>
        <div className="p-6 border-b border-[#1E293B] flex items-center justify-between">
          <MuscleWeaponLogo variant="light" />
        </div>

        <div className="px-3 py-4">
          <div className="text-[10px] font-extrabold text-[#667085] uppercase tracking-wider px-3 mb-2">
            Admin Console
          </div>
          <nav className="flex flex-col gap-1" aria-label="Admin Navigation">
            {ADMIN_NAV.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-[12px] text-xs font-bold transition-all',
                    isActive
                      ? 'bg-[#1677FF] text-white shadow-[0_4px_16px_rgba(22,119,255,0.35)]'
                      : 'text-[#94A3B8] hover:text-white hover:bg-[#162235]'
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom: Public Link & Logout */}
      <div className="p-4 border-t border-[#1E293B] flex flex-col gap-2">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-[10px] text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-[#162235] transition-colors"
        >
          <span>View Public Store</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>

        <button
          type="button"
          onClick={async () => {
            const { createClient } = await import('@/lib/supabase/client');
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/admin/login');
            router.refresh();
          }}
          className="flex items-center gap-3 px-3 py-2 rounded-[10px] text-xs font-semibold text-[#DC3545] hover:bg-[#DC3545]/10 transition-colors w-full text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
