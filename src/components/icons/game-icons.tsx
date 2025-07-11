import React from 'react';
import { cn } from '@/lib/utils';

interface IconProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  animated?: boolean;
  variant?: 'default' | 'glow' | 'pulse';
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4', 
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
  '2xl': 'w-16 h-16'
};

// Streak Fire Icon - Substitui 🔥
export function StreakIcon({ size = 'md', className, animated = false, variant = 'default' }: IconProps) {
  return (
    <svg 
      className={cn(
        sizeClasses[size], 
        'inline-block',
        animated && 'animate-pulse',
        variant === 'glow' && 'filter drop-shadow-[0_0_8px_#adff2f]',
        variant === 'pulse' && 'animate-pulse',
        className
      )} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <defs>
        <linearGradient id="streak-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#adff2f" />
          <stop offset="50%" stopColor="#7fff00" />
          <stop offset="100%" stopColor="#32cd32" />
        </linearGradient>
      </defs>
      <path 
        d="M12 2L8 10h3v8l5-8h-3V2z" 
        fill="url(#streak-gradient)" 
        stroke="#adff2f" 
        strokeWidth="0.5"
      />
      <path 
        d="M10 12l2-1.5L14 12l-2 1.5z" 
        fill="#ffffff" 
        opacity="0.8"
      />
    </svg>
  );
}

// Trophy Icon - Substitui 🏆
export function TrophyIcon({ size = 'md', className, animated = false, variant = 'default' }: IconProps) {
  return (
    <svg 
      className={cn(
        sizeClasses[size], 
        'inline-block',
        animated && 'animate-bounce',
        variant === 'glow' && 'filter drop-shadow-[0_0_8px_#adff2f]',
        variant === 'pulse' && 'animate-pulse',
        className
      )} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <defs>
        <linearGradient id="trophy-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="50%" stopColor="#adff2f" />
          <stop offset="100%" stopColor="#32cd32" />
        </linearGradient>
      </defs>
      <path 
        d="M7 4V2a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v2h1a2 2 0 0 1 2 2v3a3 3 0 0 1-3 3h-1.08A6.003 6.003 0 0 1 12 16a6.003 6.003 0 0 1-3.92-4H7a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2h1Z" 
        fill="url(#trophy-gradient)" 
        stroke="#adff2f" 
        strokeWidth="0.5"
      />
      <rect x="8" y="18" width="8" height="3" rx="1" fill="url(#trophy-gradient)" stroke="#adff2f" strokeWidth="0.5" />
      <circle cx="12" cy="8" r="2" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

// Lightning XP Icon - Substitui ⚡
export function LightningIcon({ size = 'md', className, animated = false, variant = 'default' }: IconProps) {
  return (
    <svg 
      className={cn(
        sizeClasses[size], 
        'inline-block',
        animated && 'animate-pulse',
        variant === 'glow' && 'filter drop-shadow-[0_0_8px_#adff2f]',
        variant === 'pulse' && 'animate-pulse',
        className
      )} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <defs>
        <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ffff" />
          <stop offset="50%" stopColor="#adff2f" />
          <stop offset="100%" stopColor="#0080ff" />
        </linearGradient>
      </defs>
      <path 
        d="M13 2L4.09 12.97A1 1 0 0 0 5 14.5h4L7 22l8.91-10.97A1 1 0 0 0 15 9.5h-4L13 2Z" 
        fill="url(#lightning-gradient)" 
        stroke="#adff2f" 
        strokeWidth="0.5"
      />
      <path 
        d="M11 8h2l-1 2h-1l1-2z" 
        fill="#ffffff" 
        opacity="0.9"
      />
    </svg>
  );
}

// Gift Box Icon - Substitui 🎁
export function GiftIcon({ size = 'md', className, animated = false, variant = 'default' }: IconProps) {
  return (
    <svg 
      className={cn(
        sizeClasses[size], 
        'inline-block',
        animated && 'animate-bounce',
        variant === 'glow' && 'filter drop-shadow-[0_0_8px_#adff2f]',
        variant === 'pulse' && 'animate-pulse',
        className
      )} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <defs>
        <linearGradient id="gift-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff6b6b" />
          <stop offset="50%" stopColor="#adff2f" />
          <stop offset="100%" stopColor="#4ecdc4" />
        </linearGradient>
      </defs>
      <rect x="4" y="10" width="16" height="10" rx="2" fill="url(#gift-gradient)" stroke="#adff2f" strokeWidth="0.5" />
      <rect x="4" y="8" width="16" height="4" rx="1" fill="#adff2f" stroke="#32cd32" strokeWidth="0.5" />
      <path d="M12 8V20M8 4a2 2 0 1 1 4 4M16 4a2 2 0 1 0-4 4" stroke="#adff2f" strokeWidth="1.5" fill="none" />
      <circle cx="12" cy="15" r="1.5" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

// Star Icon - Substitui ⭐
export function StarIcon({ size = 'md', className, animated = false, variant = 'default' }: IconProps) {
  return (
    <svg 
      className={cn(
        sizeClasses[size], 
        'inline-block',
        animated && 'animate-spin',
        variant === 'glow' && 'filter drop-shadow-[0_0_8px_#adff2f]',
        variant === 'pulse' && 'animate-pulse',
        className
      )} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <defs>
        <linearGradient id="star-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="50%" stopColor="#adff2f" />
          <stop offset="100%" stopColor="#ffff00" />
        </linearGradient>
      </defs>
      <path 
        d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z" 
        fill="url(#star-gradient)" 
        stroke="#adff2f" 
        strokeWidth="0.5"
      />
      <circle cx="12" cy="10" r="2" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

// Diamond Icon - Substitui 💎
export function DiamondIcon({ size = 'md', className, animated = false, variant = 'default' }: IconProps) {
  return (
    <svg 
      className={cn(
        sizeClasses[size], 
        'inline-block',
        animated && 'animate-pulse',
        variant === 'glow' && 'filter drop-shadow-[0_0_8px_#adff2f]',
        variant === 'pulse' && 'animate-pulse',
        className
      )} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <defs>
        <linearGradient id="diamond-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00ffff" />
          <stop offset="50%" stopColor="#adff2f" />
          <stop offset="100%" stopColor="#0080ff" />
        </linearGradient>
      </defs>
      <path 
        d="M6 9l6-6 6 6-6 12-6-12Z" 
        fill="url(#diamond-gradient)" 
        stroke="#adff2f" 
        strokeWidth="0.5"
      />
      <path 
        d="M8 9l4-4 4 4-4 8-4-8Z" 
        fill="#ffffff" 
        opacity="0.3"
      />
      <circle cx="12" cy="9" r="1" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

// Sword Icon - Substitui ⚔️
export function SwordIcon({ size = 'md', className, animated = false, variant = 'default' }: IconProps) {
  return (
    <svg 
      className={cn(
        sizeClasses[size], 
        'inline-block',
        animated && 'animate-pulse',
        variant === 'glow' && 'filter drop-shadow-[0_0_8px_#adff2f]',
        variant === 'pulse' && 'animate-pulse',
        className
      )} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <defs>
        <linearGradient id="sword-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c0c0c0" />
          <stop offset="50%" stopColor="#adff2f" />
          <stop offset="100%" stopColor="#808080" />
        </linearGradient>
      </defs>
      <path 
        d="M14.5 9.5L20 4l-1-1-5.5 5.5M6 18L4 20l2 2 2-2-2-2Z" 
        stroke="#adff2f" 
        strokeWidth="1.5" 
        fill="none"
      />
      <path 
        d="M14.5 9.5L9.5 14.5 6 18l2 2 3.5-3.5 5-5Z" 
        fill="url(#sword-gradient)" 
        stroke="#adff2f" 
        strokeWidth="0.5"
      />
      <circle cx="17" cy="7" r="1" fill="#adff2f" />
    </svg>
  );
}

// Crown Icon - Substitui 👑
export function CrownIcon({ size = 'md', className, animated = false, variant = 'default' }: IconProps) {
  return (
    <svg 
      className={cn(
        sizeClasses[size], 
        'inline-block',
        animated && 'animate-bounce',
        variant === 'glow' && 'filter drop-shadow-[0_0_8px_#adff2f]',
        variant === 'pulse' && 'animate-pulse',
        className
      )} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <defs>
        <linearGradient id="crown-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="50%" stopColor="#adff2f" />
          <stop offset="100%" stopColor="#ffff00" />
        </linearGradient>
      </defs>
      <path 
        d="M5 16L2 6l4 2 6-6 6 6 4-2-3 10H5Z" 
        fill="url(#crown-gradient)" 
        stroke="#adff2f" 
        strokeWidth="0.5"
      />
      <rect x="4" y="16" width="16" height="2" rx="1" fill="url(#crown-gradient)" stroke="#adff2f" strokeWidth="0.5" />
      <circle cx="8" cy="12" r="1" fill="#ffffff" opacity="0.9" />
      <circle cx="12" cy="10" r="1" fill="#ffffff" opacity="0.9" />
      <circle cx="16" cy="12" r="1" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

// Target Icon - Substitui 🎯
export function TargetIcon({ size = 'md', className, animated = false, variant = 'default' }: IconProps) {
  return (
    <svg 
      className={cn(
        sizeClasses[size], 
        'inline-block',
        animated && 'animate-spin',
        variant === 'glow' && 'filter drop-shadow-[0_0_8px_#adff2f]',
        variant === 'pulse' && 'animate-pulse',
        className
      )} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <defs>
        <linearGradient id="target-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4444" />
          <stop offset="50%" stopColor="#adff2f" />
          <stop offset="100%" stopColor="#ff0000" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="none" stroke="#adff2f" strokeWidth="1" />
      <circle cx="12" cy="12" r="6" fill="none" stroke="#adff2f" strokeWidth="1" />
      <circle cx="12" cy="12" r="2" fill="url(#target-gradient)" stroke="#adff2f" strokeWidth="0.5" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="#adff2f" strokeWidth="1" />
    </svg>
  );
}

// Shield Icon - Substitui 🛡️
export function ShieldIcon({ size = 'md', className, animated = false, variant = 'default' }: IconProps) {
  return (
    <svg 
      className={cn(
        sizeClasses[size], 
        'inline-block',
        animated && 'animate-pulse',
        variant === 'glow' && 'filter drop-shadow-[0_0_8px_#adff2f]',
        variant === 'pulse' && 'animate-pulse',
        className
      )} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <defs>
        <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4169e1" />
          <stop offset="50%" stopColor="#adff2f" />
          <stop offset="100%" stopColor="#0000ff" />
        </linearGradient>
      </defs>
      <path 
        d="M12 2C8 6 8 6 3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7c-5 0-5-1-9-5Z" 
        fill="url(#shield-gradient)" 
        stroke="#adff2f" 
        strokeWidth="0.5"
      />
      <path d="M9 12l2 2 4-4" stroke="#ffffff" strokeWidth="2" fill="none" />
    </svg>
  );
}

// Rocket Icon - Substitui 🚀
export function RocketIcon({ size = 'md', className, animated = false, variant = 'default' }: IconProps) {
  return (
    <svg 
      className={cn(
        sizeClasses[size], 
        'inline-block',
        animated && 'animate-bounce',
        variant === 'glow' && 'filter drop-shadow-[0_0_8px_#adff2f]',
        variant === 'pulse' && 'animate-pulse',
        className
      )} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <defs>
        <linearGradient id="rocket-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff4500" />
          <stop offset="50%" stopColor="#adff2f" />
          <stop offset="100%" stopColor="#ff6347" />
        </linearGradient>
      </defs>
      <path 
        d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" 
        fill="url(#rocket-gradient)" 
        stroke="#adff2f" 
        strokeWidth="0.5"
      />
      <path 
        d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" 
        fill="url(#rocket-gradient)" 
        stroke="#adff2f" 
        strokeWidth="0.5"
      />
      <circle cx="15" cy="9" r="1" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}