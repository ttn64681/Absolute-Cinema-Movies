'use client';

import { useState, useCallback, useEffect } from 'react';
import { buildUrl, endpoints } from '@/config/api';

export function useGenres() {
  const [genres, setGenres] = useState<string[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);

  // CACHES: Function reference - persists across hook re-renders
  // CHANGES: Never (empty deps) - BUT recreates if component unmounts/remounts
  // WITHOUT useCallback: New reference every re-render → potential re-fetching
  // WHY MATTERS: Prevents unnecessary function recreation and API calls
  const fetchGenres = useCallback(async () => {
    setIsLoadingGenres(true);
    try {
      const url = buildUrl(endpoints.movies.genres);
      console.log('Fetching genres from:', url);
      const response = await fetch(url);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const responseText = await response.text();
      console.log('Response text:', responseText);
      if (!responseText.trim()) {
        console.warn('Empty response from genres endpoint');
        return;
      }

      const genreNames = JSON.parse(responseText);
      console.log('Genres received:', genreNames);
      setGenres(genreNames);
    } catch (err) {
      console.error('Error fetching genres:', err);
      setGenres([]); // Clear genres on error
    } finally {
      setIsLoadingGenres(false);
    }
  }, []);

  // Fetch genres only once on mount
  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  return { genres, isLoadingGenres, refetchGenres: fetchGenres };
}
