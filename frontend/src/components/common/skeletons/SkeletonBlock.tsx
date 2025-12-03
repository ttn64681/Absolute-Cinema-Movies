'use client';

interface SkeletonBlockProps {
  className?: string;
}

export default function SkeletonBlock({ className = '' }: SkeletonBlockProps) {
  return <div className={`bg-white/10 border border-white/10 animate-pulse ${className}`} />;
}
