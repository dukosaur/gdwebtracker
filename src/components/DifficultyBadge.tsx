import React from 'react';
import { DemonRating } from '../types';

interface DifficultyBadgeProps {
  rating: DemonRating | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const getRatingColors = (rating: string) => {
  const r = (rating || '').toLowerCase().trim();

  if (r.includes('easy demon')) {
    return {
      bg: 'bg-[#d8edd6]',
      text: 'text-[#1f5c22]',
      border: 'border-[#a5d6a7]',
      accent: '#2e7d32',
      glow: 'shadow-[0_0_12px_rgba(76,175,80,0.35)]',
    };
  }
  if (r.includes('medium demon')) {
    return {
      bg: 'bg-[#ffecb3]',
      text: 'text-[#684a00]',
      border: 'border-[#ffe082]',
      accent: '#ffb300',
      glow: 'shadow-[0_0_12px_rgba(255,179,0,0.35)]',
    };
  }
  if (r.includes('hard demon')) {
    return {
      bg: 'bg-[#ffccbc]',
      text: 'text-[#872e12]',
      border: 'border-[#ffab91]',
      accent: '#ff7043',
      glow: 'shadow-[0_0_12px_rgba(255,112,67,0.35)]',
    };
  }
  if (r.includes('insane demon')) {
    return {
      bg: 'bg-[#f8bbd0]',
      text: 'text-[#880e4f]',
      border: 'border-[#f48fb1]',
      accent: '#ad1457',
      glow: 'shadow-[0_0_12px_rgba(216,27,96,0.35)]',
    };
  }
  if (r === 'impossible' || r.includes('impossible') || r.includes('immpossible') || r.includes('grandpa')) {
    return {
      bg: 'bg-[#24082c]',
      text: 'text-[#f43f5e]',
      border: 'border-[#a855f7]',
      accent: '#9333ea',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.5)]',
    };
  }
  if (r.includes('extreme demon')) {
    return {
      bg: 'bg-[#2b1016]',
      text: 'text-[#ff5252]',
      border: 'border-[#d32f2f]',
      accent: '#c62828',
      glow: 'shadow-[0_0_15px_rgba(255,23,68,0.5)]',
    };
  }
  if (r === 'easy') {
    return {
      bg: 'bg-[#b2ebf2]',
      text: 'text-[#006064]',
      border: 'border-[#80deea]',
      accent: '#00acc1',
      glow: 'shadow-[0_0_10px_rgba(0,188,212,0.35)]',
    };
  }
  if (r === 'normal') {
    return {
      bg: 'bg-[#e8f5e9]',
      text: 'text-[#2e7d32]',
      border: 'border-[#a5d6a7]',
      accent: '#4caf50',
      glow: 'shadow-[0_0_10px_rgba(76,175,80,0.35)]',
    };
  }
  if (r === 'insane') {
    return {
      bg: 'bg-[#fce4ec]',
      text: 'text-[#c2185b]',
      border: 'border-[#f8bbd0]',
      accent: '#e91e63',
      glow: 'shadow-[0_0_10px_rgba(233,30,99,0.35)]',
    };
  }
  if (r === 'hard') {
    return {
      bg: 'bg-[#fff3e0]',
      text: 'text-[#e65100]',
      border: 'border-[#ffcc80]',
      accent: '#fb8c00',
      glow: 'shadow-[0_0_10px_rgba(255,152,0,0.35)]',
    };
  }
  if (r === 'harder') {
    return {
      bg: 'bg-[#fbe9e7]',
      text: 'text-[#d84315]',
      border: 'border-[#ffab91]',
      accent: '#ff5722',
      glow: 'shadow-[0_0_10px_rgba(255,87,34,0.35)]',
    };
  }
  if (r === 'auto') {
    return {
      bg: 'bg-[#0e2433]',
      text: 'text-[#38bdf8]',
      border: 'border-[#0284c7]',
      accent: '#0284c7',
      glow: 'shadow-[0_0_10px_rgba(2,132,199,0.35)]',
    };
  }
  // Default / NA
  return {
    bg: 'bg-[#cfd8dc]',
    text: 'text-[#37474f]',
    border: 'border-[#b0bec5]',
    accent: '#78909c',
    glow: '',
  };
};

/**
 * Returns the exact public asset path for the user's authentic Geometry Dash face images
 */
export const getRatingImagePath = (rating: string): string => {
  const r = (rating || '').toLowerCase().trim();

  if (r === 'impossible' || r.includes('impossible') || r.includes('immpossible') || r.includes('grandpa')) {
    return '/faces/demon-grandpa.svg';
  }
  if (r.includes('easy demon')) return '/faces/demon-easy.png';
  if (r.includes('medium demon')) return '/faces/demon-medium.png';
  if (r.includes('hard demon')) return '/faces/demon-hard.png';
  if (r.includes('insane demon')) return '/faces/demon-insane.png';
  if (r.includes('extreme demon')) return '/faces/demon-extreme.png';
  if (r.includes('demon')) return '/faces/demon-easy.png';

  if (r === 'easy') return '/faces/easy.png';
  if (r === 'normal') return '/faces/normal.png';
  if (r === 'hard') return '/faces/hard.png';
  if (r === 'harder') return '/faces/harder.png';
  if (r === 'insane') return '/faces/insane.png';
  if (r === 'auto') return '/faces/auto.png';
  if (r === 'na') return '/faces/na.png';

  return '/faces/na.png';
};

export const RatingIcon: React.FC<{ rating: string; className?: string; alt?: string }> = ({
  rating,
  className = 'w-5 h-5',
  alt,
}) => {
  const imageSrc = getRatingImagePath(rating);

  return (
    <img
      src={imageSrc}
      alt={alt || rating}
      className={`inline-block object-contain drop-shadow-sm select-none transition-transform duration-200 ${className}`}
      loading="lazy"
    />
  );
};

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({
  rating,
  size = 'md',
  showIcon = true,
}) => {
  const colors = getRatingColors(rating);
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs font-semibold'
      : size === 'lg'
      ? 'px-4 py-1.5 text-sm font-bold tracking-wide'
      : 'px-2.5 py-1 text-xs font-bold';

  const iconSizes =
    size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses} shadow-sm transition-all duration-200 select-none whitespace-nowrap shrink-0`}
    >
      {showIcon && <RatingIcon rating={rating} className={`${iconSizes} shrink-0`} />}
      <span className="whitespace-nowrap">{rating}</span>
    </div>
  );
};
