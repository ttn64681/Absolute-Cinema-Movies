'use client';

import React from 'react';
import Spinner from '@/components/common/Spinner';

interface AuthButtonProps {
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'transparent';
  children: React.ReactNode;
  className?: string;
}

export default function AuthButton({
  type = 'button',
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  children,
  className = '',
}: AuthButtonProps) {
  // Base styling applied to all button variants
  const baseClasses =
    'w-full inline-flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  // Button style variants for different UI contexts
  const variantClasses = {
    // Primary: Main action button with gradient background (e.g., "Continue", "Login")
    primary:
      'bg-gradient-to-r from-acm-pink to-acm-orange text-white hover:brightness-110 shadow-lg hover:shadow-acm-pink/25 drop-shadow-lg',

    // Secondary: Alternative action with pink accent border (e.g., "Skip & Create Account")
    secondary: 'bg-transparent border border-acm-pink/50 text-acm-pink hover:bg-acm-pink/10 hover:border-acm-pink',

    // Transparent: Subtle action with white border (e.g., "Go Back")
    transparent: 'bg-transparent border border-white/20 text-white/80 hover:bg-white/5 hover:text-white',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {loading ? <Spinner size="sm" color="white" text="Loading..." /> : children}
    </button>
  );
}
