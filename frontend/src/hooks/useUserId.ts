'use client';

import { useState, useEffect } from 'react';
import { getUserIdFromToken } from '@/utils/auth';

/**
 * Hook for SSR-safe user ID extraction
 *
 * Responsibilities:
 * - React state management (userId, loading)
 * - Extract user ID from JWT token (SSR-safe)
 * - Prevents hydration mismatches by starting with null
 *
 * Delegates to:
 * - utils/auth: Token decoding utilities
 *
 * @returns User ID state and loading status
 */
export function useUserId() {
  const [userId, setUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const id = getUserIdFromToken();
    setUserId(id);
    setIsLoading(false);
  }, []);

  return { userId, isLoading };
}





