import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MWButton, MWEmptyState } from '@/components/primitives';
import { BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Athlete Insights & Science',
  description:
    'Clinical guides on sports nutrition, supplementation protocols, and training science from the Muscle Weapon research team.',
};

export default function BlogsPage() {
  return (
    <div className="mw-container py-12 md:py-20 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-xs font-bold text-[#1677FF] uppercase tracking-wider mb-1">
          Knowledge Base
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0B1220] uppercase tracking-tight">
          Athlete Insights & Science
        </h1>
      </div>

      <MWEmptyState
        icon={BookOpen}
        title="Articles Under Preparation"
        description="Our sports nutritionists and training coaches are compiling clinical guides on supplementation, recovery protocols, and athletic performance."
        action={
          <Link href="/products">
            <MWButton variant="primary" size="sm">
              Explore Products
            </MWButton>
          </Link>
        }
      />
    </div>
  );
}
