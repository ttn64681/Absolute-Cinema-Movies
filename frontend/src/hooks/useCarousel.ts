'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for carousel navigation and state management
 *
 * Responsibilities:
 * - Carousel index state management
 * - Nav functions (next, previous, go to index)
 * - Auto-advance functionality (timer)
 * - Direction tracking for animations
 * - Bounds checking to prevent out-of-bounds access
 *
 * @param items - Array of items to navigate through
 * @param autoAdvanceInterval - Auto-advance interval in milliseconds (default: 5000ms, 0 to disable)
 * @returns Carousel state and navigation functions
 */
export function useCarousel<T>(
  items: T[],
  autoAdvanceInterval: number = 5000
): {
  currentIndex: number;
  currentItem: T | undefined;
  direction: 1 | -1;
  goToPrevious: () => void;
  goToNext: () => void;
  goToIndex: (index: number) => void;
} {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [resetToken, setResetToken] = useState(0);

  // reset index when items array changes to prevent out-of-bounds access
  useEffect(() => {
    if (items.length > 0) {
      setCurrentIndex((prev) => (prev >= items.length ? 0 : prev));
    }
  }, [items.length]);

  // ensure currentIndex is always w/in bounds
  const safeIndex = items.length > 0 ? Math.min(currentIndex, items.length - 1) : 0;
  const currentItem = items[safeIndex];

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    setResetToken((prev) => prev + 1);
  }, [items.length]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    setResetToken((prev) => prev + 1);
  }, [items.length]);

  // Handle indicator clicks - set direction based on click
  const goToIndex = useCallback(
    (index: number) => {
      if (index < 0 || index >= items.length) return; // Bounds check
      if (index > currentIndex) {
        setDirection(1);
      } else if (index < currentIndex) {
        setDirection(-1);
      } else {
        return; // Same index, do nothing
      }
      setCurrentIndex(index);
      setResetToken((prev) => prev + 1);
    },
    [currentIndex, items.length]
  );

  // Auto-advance carousel
  useEffect(() => {
    if (autoAdvanceInterval > 0 && items.length > 1) {
      const interval = setInterval(goToNext, autoAdvanceInterval);
      return () => clearInterval(interval);
    }
  }, [goToNext, autoAdvanceInterval, items.length, resetToken]);

  return {
    currentIndex: safeIndex,
    currentItem,
    direction,
    goToPrevious,
    goToNext,
    goToIndex,
  };
}
