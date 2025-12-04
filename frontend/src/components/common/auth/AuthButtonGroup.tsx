'use client';

import React from 'react';
import AuthButton from './AuthButton';

interface AuthButtonGroupProps {
  primaryText: string;
  primaryOnClick?: () => void;
  primaryType?: 'button' | 'submit';
  primaryLoading?: boolean;
  primaryDisabled?: boolean;
  secondaryText?: string;
  secondaryOnClick?: () => void;
  secondaryDisabled?: boolean;
  skipText?: string;
  skipOnClick?: () => void;
  skipDisabled?: boolean;
  className?: string;
}

export default function AuthButtonGroup({
  primaryText,
  primaryOnClick,
  primaryType = 'submit',
  primaryLoading = false,
  primaryDisabled = false,
  secondaryText,
  secondaryOnClick,
  secondaryDisabled = false,
  skipText,
  skipOnClick,
  skipDisabled = false,
  className = '',
}: AuthButtonGroupProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Primary and Secondary buttons (secondary on the left, primary on the right) */}
      <div className="flex flex-col sm:flex-row gap-4">
        {secondaryText && (
          <AuthButton
            type="button"
            onClick={secondaryOnClick}
            disabled={secondaryDisabled}
            variant="transparent"
            className="flex-1"
          >
            {secondaryText}
          </AuthButton>
        )}

        <AuthButton
          type={primaryType}
          onClick={primaryOnClick}
          loading={primaryLoading}
          disabled={primaryDisabled}
          variant="primary"
          className="flex-1"
        >
          {primaryText}
        </AuthButton>
      </div>

      {/* Skip button - smaller, less prominent */}
      {skipText && (
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={skipOnClick}
            disabled={skipDisabled}
            className="text-white/60 hover:text-white text-sm underline hover:no-underline transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {skipText}
          </button>
        </div>
      )}
    </div>
  );
}
