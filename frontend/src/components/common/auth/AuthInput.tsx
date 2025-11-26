'use client';

import React from 'react';

interface AuthInputProps {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function AuthInput({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
}: AuthInputProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-white text-sm mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-md bg-white/10 border ${error ? 'border-red-500' : 'border-white/20'} text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent`}
        disabled={disabled}
      />
      {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
    </div>
  );
}
