'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { buildUrl, endpoints } from '@/config/api';
import { BackendMovie, PaginatedMovieResponse } from '@/types/movie';

// Cache for paginated search results (per search query + page)
const searchCache: Record<string, Record<string, Record<number, PaginatedMovieResponse>>> = {
  nowplaying: {},
  upcoming: {},
};
const lastSearchFetch: Record<string, Record<string, Record<number, number>>> = {
  nowplaying: {},
  upcoming: {},
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export function useMovieSearch() {
  const searchParams = useSearchParams();

  // Separate state for Now Playing and Upcoming movies
  const [nowPlayingMovies, setNowPlayingMovies] = useState<BackendMovie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<BackendMovie[]>([]);

  // Pagination state for each section
  const [nowPlayingPagination, setNowPlayingPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
  });
  const [upcomingPagination, setUpcomingPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
    hasNext: false,
    hasPrevious: false,
  });

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
          setNowPlayingPagination({
            currentPage: cached.currentPage,
            totalPages: cached.totalPages,
            totalElements: cached.totalElements,
            hasNext: cached.hasNext,
            hasPrevious: cached.hasPrevious,
          });
        } else {
          setUpcomingMovies(cached.movies);
          setUpcomingPagination({
            currentPage: cached.currentPage,
            totalPages: cached.totalPages,
            totalElements: cached.totalElements,
            hasNext: cached.hasNext,
            hasPrevious: cached.hasPrevious,
          });
        }
        return;
      }

      // Fetch from API
      if (type === 'nowplaying') {
        setIsLoadingNowPlaying(true);
      } else {
        setIsLoadingUpcoming(true);
      }

      try {
        const endpoint = type === 'nowplaying' ? endpoints.movies.searchNowPlaying : endpoints.movies.searchUpcoming;
        const url = `${buildUrl(endpoint)}?${queryString}&page=${pageNum}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: PaginatedMovieResponse = await response.json();

        // Update cache
        if (!searchCache[type]) searchCache[type] = {};
        if (!lastSearchFetch[type]) lastSearchFetch[type] = {};
        if (!searchCache[type][queryString]) searchCache[type][queryString] = {};
        if (!lastSearchFetch[type][queryString]) lastSearchFetch[type][queryString] = {};
        searchCache[type][queryString][pageNum] = data;
        lastSearchFetch[type][queryString][pageNum] = now;

        if (type === 'nowplaying') {
          setNowPlayingMovies(data.movies);
          setNowPlayingPagination({
            currentPage: data.currentPage,
            totalPages: data.totalPages,
            totalElements: data.totalElements,
            hasNext: data.hasNext,
            hasPrevious: data.hasPrevious,
          });
        } else {
          setUpcomingMovies(data.movies);
          setUpcomingPagination({
            currentPage: data.currentPage,
            totalPages: data.totalPages,
            totalElements: data.totalElements,
            hasNext: data.hasNext,
            hasPrevious: data.hasPrevious,
          });
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
