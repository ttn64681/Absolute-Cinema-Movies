'use client';

import { useState, useEffect } from 'react';
import { getUserIdFromToken } from '@/utils/auth';

/**
 * Hook to get user ID from JWT token
 * Extracts token decoding logic from components
 * 
 * @returns { userId, isLoading }
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





