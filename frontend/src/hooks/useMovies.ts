'use client';

import { useState, useCallback, useEffect } from 'react';
import { movieClient } from '@/clients/movieClient';
import { BackendMovie, PaginatedMovieResponse } from '@/types/movie';
import { CACHE_DURATION, initialPaginationState, createPaginationState } from '@/utils/pagination';

/**
 * Hook for movie browsing operations
 *
 * Responsibilities:
 * - React state management (movies, loading, error, pagination)
 * - Client-side caching (5min TTL)
 * - Pagination navigation
 *
 * Delegates to:
 * - movieClient (Facade): API calls
 * - pagination utils: Pagination helpers
 *
 * @param activeTab - 'nowplaying' | 'upcoming' - determines which movies to fetch
 * @returns Movie state, pagination info & navigation operations
 */

// Cache for paginated movies data (per page)
const moviesCache: Record<string, Record<number, PaginatedMovieResponse>> = {
  nowplaying: {},
  upcoming: {},
};
const lastFetch: Record<string, Record<number, number>> = {
  nowplaying: {},
  upcoming: {},
};

export function useMovies(activeTab: 'nowplaying' | 'upcoming') {
  const [page, setPage] = useState(0);
  const [movies, setMovies] = useState<BackendMovie[]>([]);
  const [pagination, setPagination] = useState(initialPaginationState);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch movies for current page
  const fetchMovies = useCallback(
    async (pageNum: number) => {
      const now = Date.now();
      const cacheKey = activeTab;
      const cached = moviesCache[cacheKey]?.[pageNum];
      const lastFetchTime = lastFetch[cacheKey]?.[pageNum] || 0;

      // Check cache
      if (now - lastFetchTime < CACHE_DURATION && cached) {
        console.log(`Using cached ${activeTab} movies page ${pageNum}`);
        setMovies(cached.movies);
        setPagination(createPaginationState(cached));
        setError(null);
        return;
      }

      // Fetch from API using movieClient facade
      setIsLoading(true);
      setError(null);
      try {
        const data =
          activeTab === 'nowplaying'
            ? await movieClient.getNowPlaying(pageNum)
            : await movieClient.getUpcoming(pageNum);

        // Update cache
        if (!moviesCache[cacheKey]) moviesCache[cacheKey] = {}; // Init cache for this tab if not exists
        if (!lastFetch[cacheKey]) lastFetch[cacheKey] = {}; // Init last fetch time for this tab if not exists
        moviesCache[cacheKey][pageNum] = data; // Update cache w/ new data
        lastFetch[cacheKey][pageNum] = now; // Update last fetch time w/ curr time

        setMovies(data.movies);
        setPagination(createPaginationState(data));
      } catch (err) {
        console.error('Error fetching movies:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load movies';
        setError(errorMessage);
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    },
    [activeTab]
  );

  // Reset to page 0 when tab changes
  useEffect(() => {
    setPage(0);
  }, [activeTab]);

  // Fetch movies when page or tab changes
  useEffect(() => {
    fetchMovies(page);
  }, [page, fetchMovies]);

  const goToNextPage = useCallback(() => {
    if (pagination.hasNext) {
      setPage((prev) => prev + 1);
    }
  }, [pagination.hasNext]);

  const goToPreviousPage = useCallback(() => {
    if (pagination.hasPrevious) {
      setPage((prev) => prev - 1);
    }
  }, [pagination.hasPrevious]);

  const goToPage = useCallback(
    (pageNum: number) => {
      if (pageNum >= 0 && pageNum < pagination.totalPages) {
        setPage(pageNum);
      }
    },
    [pagination.totalPages]
  );

  return {
    movies,
    isLoading,
    error,
    pagination,
    goToNextPage,
    goToPreviousPage,
    goToPage,
    refreshMovies: () => fetchMovies(page),
  };
}
