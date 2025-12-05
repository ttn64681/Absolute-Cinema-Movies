'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { movieClient } from '@/clients/movieClient';
import { MovieSummary, BackendMovie } from '@/types/movie';

/**
 * Hook for selected movie details (Virtual Proxy pattern)
 *
 * Responsibilities:
 * - React state management (currentDate, selectedShowtime)
 * - Fetching full movie details (cast, directors, producers)
 * - Fetching available showtime dates
 * - Auto-selecting first date when dates load
 *
 * Delegates to:
 * - movieClient (Facade): API calls
 *
 * Virtual Proxy pattern:
 * - Receives MovieSummary (lightweight) from parent component (MovieCard)
 * - Fetches full Movie entity (w/ cast/directors/producers) on mount
 * - Falls back to MovieSummary if fetch fails
 *
 * @param movie - MovieSummary from parent component (MovieCard)
 * @returns Movie state, dates, showtime selection state & operations
 */
export function useSelectedMovie(movie: MovieSummary) {
  // State for showtime selection
  const [currentDate, setCurrentDate] = useState<string>('');
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);

  // Virtual Proxy: Fetch full movie details (cast, directors, producers)
  const { data: fullMovie } = useQuery<BackendMovie>({
    queryKey: ['movie-details', movie.movie_id],
    queryFn: async () => {
      return await movieClient.getMovieById(movie.movie_id);
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    placeholderData: movie as BackendMovie, // Use MovieSummary as placeholder while loading
  });

  // Use full movie if available, otherwise fall back to summary (Virtual Proxy pattern)
  const displayMovie: BackendMovie = (fullMovie || movie) as BackendMovie;

  // Fetch available showtime dates
  const {
    data: availableDates = [],
    isLoading: datesLoading,
    error: datesError,
  } = useQuery({
    queryKey: ['movie-dates', movie.movie_id],
    queryFn: async () => {
      return await movieClient.getDates(movie.movie_id);
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Auto-select first date when dates load
  useEffect(() => {
    if (availableDates.length > 0 && !currentDate) {
      setCurrentDate(availableDates[0]);
    }
  }, [availableDates, currentDate]);

  return {
    displayMovie,
    availableDates,
    datesLoading,
    datesError,
    currentDate,
    selectedShowtime,
    setCurrentDate,
    setSelectedShowtime,
  };
}


