import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/cn';

export interface MuscleWeaponLogoProps {
  className?: string;
  variant?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

const SIZE_MAP = {
  sm: { height: 36, width: 42, text: 'text-[8px]' },
  md: { height: 48, width: 56, text: 'text-[9px]' },
  lg: { height: 64, width: 75, text: 'text-[11px]' },
};

export const MuscleWeaponLogo: React.FC<MuscleWeaponLogoProps> = ({
  className,
  variant = 'dark',
  size = 'md',
  showSubtitle = true,
}) => {
  const isLight = variant === 'light';
  const logoSrc = isLight
    ? '/images/brand/muscle-weapon-logo-white.png'
    : '/images/brand/muscle-weapon-logo-dark.png';

  const { height, width, text: textClass } = SIZE_MAP[size];

  return (
    <div className={cn('inline-flex flex-col items-start select-none group', className)}>
      <div className="relative flex items-center">
        <Image
          src={logoSrc}
          alt="Muscle Weapon® - Supplements That Empower"
          width={width}
          height={height}
          priority
          className="object-contain transition-transform duration-200 group-hover:scale-105"
          style={{ width: 'auto', height: `${height}px` }}
        />
      </div>

      {showSubtitle && (
        <span
          className={cn(
            'font-bold tracking-widest uppercase leading-none mt-1',
            textClass,
            isLight ? 'text-white/70' : 'text-[#667085]'
          )}
        >
          Supplements That Empower
        </span>
      )}
    </div>
  );
};
