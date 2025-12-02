'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { movieClient } from '@/clients/movieClient';
import { MovieSummary, PaginatedMovieResponse } from '@/types/movie';
import { CACHE_DURATION, initialPaginationState, createPaginationState } from '@/utils/pagination';

/**
 * Hook for movie search operations
 *
 * Responsibilities:
 * - React state management for search results (Now Playing & Upcoming)
 * - Client-side caching (5min TTL, keyed by search query)
 * - Pagination navigation for both sections
 *
 * Delegates to:
 * - movieClient (Facade): API calls
 * - pagination utils: Pagination helpers
 *
 * @returns Search results state, pagination info & operations for both sections
 */

// Cache for paginated search results (per search query + page)
const searchCache: Record<string, Record<string, Record<number, PaginatedMovieResponse>>> = {
  nowplaying: {},
  upcoming: {},
};
const lastSearchFetch: Record<string, Record<string, Record<number, number>>> = {
  nowplaying: {},
  upcoming: {},
};

export function useMovieSearch() {
  const searchParams = useSearchParams();

  // Separate state for Now Playing and Upcoming movies
  const [nowPlayingMovies, setNowPlayingMovies] = useState<MovieSummary[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<MovieSummary[]>([]);

  // Pagination state for each section
  const [nowPlayingPagination, setNowPlayingPagination] = useState(initialPaginationState);
  const [upcomingPagination, setUpcomingPagination] = useState(initialPaginationState);

  // Page state for each section
  const [nowPlayingPage, setNowPlayingPage] = useState(0);
  const [upcomingPage, setUpcomingPage] = useState(0);

  // Loading states
  const [isLoadingNowPlaying, setIsLoadingNowPlaying] = useState(false);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(false);

  // Build search query string from params
  const buildSearchQuery = useCallback(() => {
    const title = searchParams.get('title');
    const genres = searchParams.get('genres');
    const month = searchParams.get('month');
    const day = searchParams.get('day');
    const year = searchParams.get('year');

    const params = new URLSearchParams();
    if (title) params.set('title', title);
    if (genres) params.set('genres', genres);
    if (month) params.set('month', month);
    if (day) params.set('day', day);
    if (year) params.set('year', year);

    return { queryString: params.toString(), hasParams: title || genres || month || day || year };
  }, [searchParams]);

  // Fetch paginated search results
  const fetchSearchResults = useCallback(
    async (type: 'nowplaying' | 'upcoming', pageNum: number) => {
      const { queryString, hasParams } = buildSearchQuery();

      if (!hasParams) {
        if (type === 'nowplaying') {
          setNowPlayingMovies([]);
          setNowPlayingPagination(initialPaginationState);
        } else {
          setUpcomingMovies([]);
          setUpcomingPagination(initialPaginationState);
        }
        return;
      }

      const now = Date.now();
      const cached = searchCache[type]?.[queryString]?.[pageNum];
      const lastFetchTime = lastSearchFetch[type]?.[queryString]?.[pageNum] || 0;

      // Check cache
      if (now - lastFetchTime < CACHE_DURATION && cached) {
        console.log(`Using cached ${type} search results page ${pageNum}`);
        if (type === 'nowplaying') {
          setNowPlayingMovies(cached.movies);
          setNowPlayingPagination(createPaginationState(cached));
        } else {
          setUpcomingMovies(cached.movies);
          setUpcomingPagination(createPaginationState(cached));
        }
        return;
      }

      // Fetch from API using movieClient facade
      if (type === 'nowplaying') {
        setIsLoadingNowPlaying(true);
      } else {
        setIsLoadingUpcoming(true);
      }

      try {
        // Parse query params for client
        const searchFilters = {
          title: searchParams.get('title') || undefined,
          genres: searchParams.get('genres') || undefined,
          month: searchParams.get('month') ? parseInt(searchParams.get('month')!) : undefined,
          day: searchParams.get('day') ? parseInt(searchParams.get('day')!) : undefined,
          year: searchParams.get('year') ? parseInt(searchParams.get('year')!) : undefined,
        };

        const data =
          type === 'nowplaying'
            ? await movieClient.searchNowPlaying(searchFilters, pageNum)
            : await movieClient.searchUpcoming(searchFilters, pageNum);

        // Update cache
        if (!searchCache[type]) searchCache[type] = {};
        if (!lastSearchFetch[type]) lastSearchFetch[type] = {};
        if (!searchCache[type][queryString]) searchCache[type][queryString] = {};
        if (!lastSearchFetch[type][queryString]) lastSearchFetch[type][queryString] = {};
        searchCache[type][queryString][pageNum] = data;
        lastSearchFetch[type][queryString][pageNum] = now;

        if (type === 'nowplaying') {
          setNowPlayingMovies(data.movies);
          setNowPlayingPagination(createPaginationState(data));
        } else {
          setUpcomingMovies(data.movies);
          setUpcomingPagination(createPaginationState(data));
        }
      } catch (err) {
        console.error(`Error searching ${type} movies:`, err);
        if (type === 'nowplaying') {
          setNowPlayingMovies([]);
          setNowPlayingPagination({
            currentPage: 0,
            totalPages: 0,
            totalElements: 0,
            hasNext: false,
            hasPrevious: false,
          });
        } else {
          setUpcomingMovies([]);
          setUpcomingPagination({
            currentPage: 0,
            totalPages: 0,
            totalElements: 0,
            hasNext: false,
            hasPrevious: false,
          });
        }
      } finally {
        if (type === 'nowplaying') {
          setIsLoadingNowPlaying(false);
        } else {
          setIsLoadingUpcoming(false);
        }
      }
    },
    [buildSearchQuery]
  );

  // Reset pages when search params change
  useEffect(() => {
    setNowPlayingPage(0);
    setUpcomingPage(0);
  }, [searchParams]);

  // Fetch results when pages or search params change
  useEffect(() => {
    fetchSearchResults('nowplaying', nowPlayingPage);
  }, [nowPlayingPage, searchParams, fetchSearchResults]);

  useEffect(() => {
    fetchSearchResults('upcoming', upcomingPage);
  }, [upcomingPage, searchParams, fetchSearchResults]);

  // Navigation functions for Now Playing
  const goToNextPageNowPlaying = useCallback(() => {
    if (nowPlayingPagination.hasNext) {
      setNowPlayingPage((prev) => prev + 1);
    }
  }, [nowPlayingPagination.hasNext]);

  const goToPreviousPageNowPlaying = useCallback(() => {
    if (nowPlayingPagination.hasPrevious) {
      setNowPlayingPage((prev) => prev - 1);
    }
  }, [nowPlayingPagination.hasPrevious]);

  const goToPageNowPlaying = useCallback(
    (pageNum: number) => {
      if (pageNum >= 0 && pageNum < nowPlayingPagination.totalPages) {
        setNowPlayingPage(pageNum);
      }
    },
    [nowPlayingPagination.totalPages]
  );

  // Navigation functions for Upcoming
  const goToNextPageUpcoming = useCallback(() => {
    if (upcomingPagination.hasNext) {
      setUpcomingPage((prev) => prev + 1);
    }
  }, [upcomingPagination.hasNext]);

  const goToPreviousPageUpcoming = useCallback(() => {
    if (upcomingPagination.hasPrevious) {
      setUpcomingPage((prev) => prev - 1);
    }
  }, [upcomingPagination.hasPrevious]);

  const goToPageUpcoming = useCallback(
    (pageNum: number) => {
      if (pageNum >= 0 && pageNum < upcomingPagination.totalPages) {
        setUpcomingPage(pageNum);
      }
    },
    [upcomingPagination.totalPages]
  );

  return {
    nowPlayingMovies,
    upcomingMovies,
    isLoadingNowPlaying,
    isLoadingUpcoming,
    nowPlayingPagination,
    upcomingPagination,
    goToNextPageNowPlaying,
    goToPreviousPageNowPlaying,
    goToPageNowPlaying,
    goToNextPageUpcoming,
    goToPreviousPageUpcoming,
    goToPageUpcoming,
  };
}
