import React from 'react';
import Link from 'next/link';
import { MWButton } from '@/components/primitives';
import { ShieldAlert } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F5F8FC] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[24px] border border-[#DDE5EF] p-8 text-center shadow-[0_16px_40px_rgba(11,18,32,0.08)]">
        <div className="w-12 h-12 rounded-full bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-6 h-6" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-black text-[#0B1220] uppercase tracking-tight">
          Page Not Found
        </h1>

        <p className="text-xs text-[#667085] mt-2 leading-relaxed">
          The requested page or record could not be located. Unpublished products and restricted admin areas are safely inaccessible.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link href="/">
            <MWButton size="sm">Return to Home</MWButton>
          </Link>
          <Link href="/products">
            <MWButton variant="outline" size="sm">
              Browse Products
            </MWButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
