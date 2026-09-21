'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { MuscleWeaponLogo } from '@/components/brand/MuscleWeaponLogo';
import { ShieldCheck, Menu, X, Search, ShoppingBag } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/about', label: 'About' },
  { href: '/verify', label: 'Verify Product', highlight: true },
  { href: '/blogs', label: 'Blogs' },
  { href: '/contact', label: 'Contact' },
];

export const PublicHeader: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#DDE5EF] shadow-xs">
      <div className="mw-container flex items-center justify-between h-20">
        {/* Brand Logo */}
        <Link href="/" className="focus-visible:outline-2 rounded-lg" aria-label="Muscle Weapon Home">
          <MuscleWeaponLogo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7" aria-label="Primary Navigation">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-bold tracking-tight transition-colors focus-visible:outline-2 rounded-md px-1 py-0.5',
                  isActive
                    ? 'text-[#1677FF]'
                    : 'text-[#0B1220] hover:text-[#1677FF]',
                  link.highlight &&
                    'flex items-center gap-1.5 text-[#1677FF] bg-[#EAF4FF] px-3 py-1.5 rounded-[10px] hover:bg-[#D4E8FF]'
                )}
              >
                {link.highlight && <ShieldCheck className="w-4 h-4" aria-hidden="true" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Actions (Search, Cart placeholder, Mobile menu trigger) */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Search catalog"
            className="p-2 rounded-[10px] text-[#667085] hover:text-[#0B1220] hover:bg-[#F5F8FC] transition-colors focus-visible:outline-2"
          >
            <Search className="w-5 h-5" aria-hidden="true" />
          </button>

          <Link
            href="/products"
            aria-label="View products"
            className="p-2 rounded-[10px] text-[#667085] hover:text-[#0B1220] hover:bg-[#F5F8FC] transition-colors focus-visible:outline-2"
          >
            <ShoppingBag className="w-5 h-5" aria-hidden="true" />
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-[10px] text-[#0B1220] hover:bg-[#F5F8FC] focus-visible:outline-2"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" aria-hidden="true" />
            ) : (
              <Menu className="w-6 h-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DDE5EF] bg-white px-5 py-4 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-3" aria-label="Mobile Primary Navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'text-sm font-bold py-2 px-3 rounded-[10px] transition-colors',
                    isActive
                      ? 'bg-[#EAF4FF] text-[#1677FF]'
                      : 'text-[#0B1220] hover:bg-[#F5F8FC]',
                    link.highlight && 'flex items-center gap-2 text-[#1677FF]'
                  )}
                >
                  {link.highlight && <ShieldCheck className="w-4 h-4" aria-hidden="true" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
