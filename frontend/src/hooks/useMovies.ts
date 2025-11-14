'use client';

import { useState, useCallback, useEffect } from 'react';
import { buildUrl, endpoints } from '@/config/api';
import { BackendMovie, PaginatedMovieResponse } from '@/types/movie';

/**
 * Facade hook for movie operations
 * Encapsulates all API calls, state management, pagination & error handling
 *
 * Follows facade pattern: single interface for complex movie browsing subsystem
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

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export function useMovies(activeTab: 'nowplaying' | 'upcoming') {
  const [page, setPage] = useState(0);
  const [movies, setMovies] = useState<BackendMovie[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
  });
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
        setPagination({
          currentPage: cached.currentPage,
          totalPages: cached.totalPages,
          totalElements: cached.totalElements,
          hasNext: cached.hasNext,
          hasPrevious: cached.hasPrevious,
        });
        setError(null);
        return;
      }

      // Fetch from API
      setIsLoading(true);
      setError(null);
      try {
        const endpoint =
          activeTab === 'nowplaying' ? endpoints.movies.browseNowPlaying : endpoints.movies.browseUpcoming;
        const url = `${buildUrl(endpoint)}?page=${pageNum}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch movies: ${response.status}`);
        }

        const responseText = await response.text();
        if (!responseText.trim()) {
          throw new Error('Empty response from server');
        }

        const data: PaginatedMovieResponse = JSON.parse(responseText);

        // Update cache
        if (!moviesCache[cacheKey]) moviesCache[cacheKey] = {};
        if (!lastFetch[cacheKey]) lastFetch[cacheKey] = {};
        moviesCache[cacheKey][pageNum] = data;
        lastFetch[cacheKey][pageNum] = now;

        setMovies(data.movies);
        setPagination({
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          totalElements: data.totalElements,
          hasNext: data.hasNext,
          hasPrevious: data.hasPrevious,
        });
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
