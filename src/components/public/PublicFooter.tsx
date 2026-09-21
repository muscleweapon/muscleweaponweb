'use client';

import React from 'react';
import Link from 'next/link';
import { MuscleWeaponLogo } from '@/components/brand/MuscleWeaponLogo';
import {
  Mail,
  Phone,
} from 'lucide-react';
import { PRODUCT_CATEGORIES } from '@/lib/validations/product';
import { MWButton } from '@/components/primitives';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#DDE5EF] text-[#0B1220] pt-14 pb-8">
      <div className="mw-container flex flex-col gap-12">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Col 1: Brand & Statement */}
          <div className="flex flex-col gap-4">
            <MuscleWeaponLogo />
            <p className="text-xs text-[#667085] leading-relaxed max-w-sm mt-2">
              Built different for a stronger tomorrow. Science-backed, athlete-first performance supplements designed to empower your discipline and potential.
            </p>
            <div className="text-xs font-bold text-[#0B1220] uppercase tracking-widest mt-1">
              Supplements That Empower
            </div>
          </div>

          {/* Col 2: Categories */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0B1220] mb-4">
              Product Categories
            </h3>
            <ul className="flex flex-col gap-2.5 text-xs text-[#667085]">
              {PRODUCT_CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    href={`/products?category=${encodeURIComponent(cat)}`}
                    className="hover:text-[#1677FF] transition-colors font-medium"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Customer Support & Contact */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0B1220] mb-4">
              Customer Support
            </h3>
            <ul className="flex flex-col gap-3 text-xs text-[#667085]">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#1677FF] shrink-0" aria-hidden="true" />
                <a
                  href="mailto:muscle.weapon@gmail.com"
                  className="hover:text-[#1677FF] transition-colors font-medium"
                >
                  muscle.weapon@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#1677FF] shrink-0" aria-hidden="true" />
                <a
                  href="tel:8816090309"
                  className="hover:text-[#1677FF] transition-colors font-medium"
                >
                  8816090309
                </a>
              </li>
              <li className="mt-2">
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-1.5 font-bold text-[#1677FF] hover:underline"
                >
                  Verify Scratch Code
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter & Verified Marketplaces (Reference Image) */}
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0B1220] mb-2">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-xs text-[#667085] mb-3">
                Get the latest updates, offers and fitness tips.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex items-center gap-2"
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-[#F5F8FC] border border-[#DDE5EF] rounded-[12px] px-3.5 py-2 text-xs text-[#0B1220] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#1677FF] w-full"
                />
                <MWButton size="sm" variant="primary">
                  Subscribe
                </MWButton>
              </form>
            </div>

            {/* Social Icons (Reference Image) */}
            <div className="flex items-center gap-3 text-[#0B1220] pt-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Muscle Weapon on Instagram"
                className="w-8 h-8 rounded-full bg-[#F5F8FC] border border-[#DDE5EF] flex items-center justify-center hover:bg-[#EAF4FF] hover:text-[#1677FF] transition-colors text-[#0B1220]"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Muscle Weapon on YouTube"
                className="w-8 h-8 rounded-full bg-[#F5F8FC] border border-[#DDE5EF] flex items-center justify-center hover:bg-[#EAF4FF] hover:text-[#1677FF] transition-colors text-[#0B1220]"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Muscle Weapon on Facebook"
                className="w-8 h-8 rounded-full bg-[#F5F8FC] border border-[#DDE5EF] flex items-center justify-center hover:bg-[#EAF4FF] hover:text-[#1677FF] transition-colors text-[#0B1220]"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Muscle Weapon on Twitter"
                className="w-8 h-8 rounded-full bg-[#F5F8FC] border border-[#DDE5EF] flex items-center justify-center hover:bg-[#EAF4FF] hover:text-[#1677FF] transition-colors text-[#0B1220]"
              >
                <svg className="w-3.5 h-3.5 fill-currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright, Nav & Tagline */}
        <div className="border-t border-[#DDE5EF] pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#667085] gap-4">
          <p>© {new Date().getFullYear()} Muscle Weapon. All Rights Reserved.</p>

          <div className="flex items-center gap-6 font-medium">
            <Link href="/" className="hover:text-[#1677FF] transition-colors">
              Home
            </Link>
            <Link href="/products" className="hover:text-[#1677FF] transition-colors">
              Products
            </Link>
            <Link href="/about" className="hover:text-[#1677FF] transition-colors">
              About
            </Link>
            <Link href="/verify" className="hover:text-[#1677FF] transition-colors">
              Verify Product
            </Link>
            <Link href="/blogs" className="hover:text-[#1677FF] transition-colors">
              Blogs
            </Link>
            <Link href="/contact" className="hover:text-[#1677FF] transition-colors">
              Contact
            </Link>
          </div>

          <div className="font-extrabold uppercase text-[11px] tracking-wider text-[#0B1220]">
            BUILT FOR ATHLETES. <span className="text-[#1677FF]">DESIGNED FOR 2050.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

