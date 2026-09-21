import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MWButton } from '@/components/primitives';
import { Award, ShieldCheck, Zap, ArrowRight, Flame } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Discover Muscle Weapon — athletic nutrition engineered for champions. Science-backed, verified authentic formulations designed to fuel peak human performance.',
};

export default function AboutPage() {
  return (
    <div className="mw-container py-10 md:py-16 flex flex-col gap-14">
      {/* Hero Banner (Screen 04 Specification) */}
      <section className="relative overflow-hidden rounded-[24px] bg-gradient-to-r from-[#0B1220] via-[#122238] to-[#0757C8] p-8 sm:p-14 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl flex flex-col items-start gap-4">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#1677FF] bg-white/10 px-3 py-1 rounded-full">
            Our Story
          </span>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-tight">
            Built by Athletes <br />
            <span className="text-[#1677FF]">For Athletes</span>
          </h1>

          <p className="text-xs sm:text-sm text-white/80 leading-relaxed mt-2 max-w-xl">
            Muscle Weapon is more than a supplement brand. It&apos;s a movement. A commitment to a stronger, healthier, and more disciplined world. We combine science, quality and passion to fuel your journey.
          </p>

          <div className="mt-4 flex items-center gap-4">
            <Link href="/products">
              <MWButton size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Our Mission
              </MWButton>
            </Link>
          </div>
        </div>

        {/* Athlete Typography Badge on Right */}
        <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 flex-col items-center justify-center text-center opacity-90 select-none pointer-events-none">
          <div className="w-24 h-24 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-3">
            <Flame className="w-12 h-12 text-[#1677FF]" />
          </div>
          <div className="font-black italic uppercase tracking-widest text-lg text-white">
            Discipline Builds
          </div>
          <div className="font-black italic uppercase tracking-widest text-2xl text-[#1677FF]">
            Freedom
          </div>
        </div>
      </section>

      {/* Stats Strip (Screen 04 Specification) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-[22px] bg-white border border-[#DDE5EF] shadow-xs text-center">
        <div className="flex flex-col items-center justify-center p-2">
          <div className="text-2xl sm:text-3xl font-black text-[#0B1220] tracking-tight">
            50K+
          </div>
          <div className="text-xs text-[#667085] font-semibold uppercase mt-0.5">
            Happy Customers
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-2">
          <div className="text-2xl sm:text-3xl font-black text-[#0B1220] tracking-tight">
            25+
          </div>
          <div className="text-xs text-[#667085] font-semibold uppercase mt-0.5">
            Premium Products
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-2">
          <div className="text-2xl sm:text-3xl font-black text-[#0B1220] tracking-tight text-[#1677FF]">
            4.8★
          </div>
          <div className="text-xs text-[#667085] font-semibold uppercase mt-0.5">
            Average Rating
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-2">
          <div className="text-2xl sm:text-3xl font-black text-[#0B1220] tracking-tight">
            INDIA
          </div>
          <div className="text-xs text-[#667085] font-semibold uppercase mt-0.5">
            Proudly Made
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-[22px] bg-white border border-[#DDE5EF] shadow-xs flex flex-col gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center">
            <Zap className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-black text-[#0B1220] uppercase tracking-wide">
            Science & Discipline
          </h2>
          <p className="text-xs text-[#667085] leading-relaxed">
            Every formulation is backed by rigorous sports nutritional science. No proprietary blends, no hidden fillers, and no exaggerated claims.
          </p>
        </div>

        <div className="p-8 rounded-[22px] bg-white border border-[#DDE5EF] shadow-xs flex flex-col gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-black text-[#0B1220] uppercase tracking-wide">
            Verified Authenticity
          </h2>
          <p className="text-xs text-[#667085] leading-relaxed">
            We combat counterfeits with industry-leading scratch-code verification. Every single container can be authenticated directly on our platform.
          </p>
        </div>

        <div className="p-8 rounded-[22px] bg-white border border-[#DDE5EF] shadow-xs flex flex-col gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-[#EAF4FF] text-[#1677FF] flex items-center justify-center">
            <Award className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-lg font-black text-[#0B1220] uppercase tracking-wide">
            Athlete-First Standard
          </h2>
          <p className="text-xs text-[#667085] leading-relaxed">
            Designed for high performance, rapid recovery, and maximum muscle synthesis. Built for the relentless pursuit of peak athletic conditioning.
          </p>
        </div>
      </section>

      {/* Brand CTA */}
      <section className="p-10 md:p-14 rounded-[24px] bg-gradient-to-r from-[#0B1220] to-[#162A45] text-white text-center flex flex-col items-center justify-center">
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
          Ready to Elevate Your Training?
        </h2>
        <p className="text-xs sm:text-sm text-white/70 max-w-lg mt-2 mb-8">
          Explore our certified product line or authenticate your purchase using your scratch code.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/products">
            <MWButton size="md" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Explore Products
            </MWButton>
          </Link>
          <Link href="/verify">
            <MWButton variant="secondary" size="md">
              Verify Scratch Code
            </MWButton>
          </Link>
        </div>
      </section>
    </div>
  );
}

