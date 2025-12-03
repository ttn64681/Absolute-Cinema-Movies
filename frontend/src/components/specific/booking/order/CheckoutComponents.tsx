/**
 * Reusable UI components for checkout flow
 * Extracted from CheckoutSections for better organization
 */

import React from 'react';

interface FormFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  withChevron?: boolean;
}

export function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  maxLength,
  withChevron,
}: FormFieldProps) {
  return (
    <label className="block">
      {label && <span className="block text-white text-sm mb-2">{label}</span>}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-md bg-transparent border border-white text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        {withChevron && (
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-white/60">⌄</span>
        )}
      </div>
    </label>
  );
}

interface SelectFieldProps {
  label?: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

export function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="block">
      {label && <span className="block text-white text-sm mb-2">{label}</span>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-md bg-transparent border border-white text-white appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-black">
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-white/60">⌄</span>
      </div>
    </label>
  );
}

interface StepCardProps {
  title: string;
  gradient: string;
  children: React.ReactNode;
}

export function StepCard({ title, gradient, children }: StepCardProps) {
  return (
    <div className="p-[3px] rounded-2xl flex-1 flex flex-col" style={{ backgroundImage: gradient }}>
      <div className="bg-black rounded-2xl p-6 flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}

interface StepActionsProps {
  onPrev?: () => void;
  onNext?: () => void;
}

export function StepActions({ onPrev, onNext }: StepActionsProps) {
  return (
    <div className="mt-auto pt-6 flex justify-between">
      {onPrev ? (
        <GhostButton onClick={onPrev}>Back</GhostButton>
      ) : (
        <span />
      )}
      {onNext && <PrimaryButton onClick={onNext}>Next</PrimaryButton>}
    </div>
  );
}

export function ReviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-3">{title}</h3>
      <div className="text-white/90 text-sm space-y-1 min-h-[60px]">{children}</div>
    </div>
  );
}

export function GhostButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-white px-5 py-2 rounded-full border border-white hover:bg-white/10 transition-colors font-afacad cursor-pointer"
    >
      {children}
    </button>
  );
}

export function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="bg-white text-black px-5 py-2 rounded-full hover:opacity-90 transition-colors font-afacad font-bold disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
    >
      {children}
    </button>
  );
}

