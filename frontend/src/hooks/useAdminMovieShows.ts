'use client';
import { useState, useEffect, useCallback } from 'react';
import { ShowTime, BackendMovieShow } from '@/types/admin';
import { getMovieDetails, createNewMovie, editExistingMovie } from '@/clients/adminMovieClient';
import { getMovieShowsForMovie, createMovieShow } from '@/clients/adminMovieShowClient';
import { useToast } from '@/contexts/ToastContext';

/**
 * Hook for admin movie show operations
 *
 * Responsibilities:
 * - React state management (movie shows, loading, error)
 * - Fetching movie shows for a specific movie
 * - Creating new movie shows (scheduling)
 *
 * Delegates to:
 * - adminMovieShowClient: API calls for movie show operations
 *
 * @param movieId - Movie ID to fetch/create shows for (0 means no movie selected)
 * @returns Movie shows state, loading status, error state, and scheduling operations
 */
export function useAdminMovieShows(movieId: number) {
  const [movieShows, setMovieShows] = useState<ShowTime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  // get all movie shows for the selected movie
  const fetchMovieShows = async (movieId: number) => {
    // If the ID is 0, there is no selected movie. Don't bother calling the API.
    if (movieId == 0) {
      setMovieShows([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getMovieShowsForMovie(movieId);
      if (data) {
        setMovieShows(data);
      }
    } catch (err) {
      console.error('Error fetching movie shows:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load movie shows';
      setError(errorMessage);
      setMovieShows([]);
    } finally {
      setIsLoading(false);
      console.log('isLoading is ' + isLoading);
    }
  };

  // Schedule a movie show
  const scheduleMovieShow = async (movieShow: BackendMovieShow, movieTitle: string, date: string, time: string, roomId: number) => {
    const createdMovieShow = await createMovieShow(movieShow);

    if (createdMovieShow) {
      console.log('Movie show scheduled successfully.');
      showToast("Movie show for \" " + movieTitle + "\"  on " + date + " at " + time + " in Showroom " + roomId + " successfully scheduled.", 'success', 8000);
      return true;
    } else {
      console.log('Failed to schedule new movie show.');
      showToast("Movie show schedule conflict. Check that there isn't another show at the same time in the same room.", 'error', 8000);
      return false;
    }
  };

  // Fetch the movie shows when movieId (the selected movie) changes
  useEffect(() => {
    fetchMovieShows(movieId);
  }, [movieId]);

  return { movieShows, isLoading, error, scheduleMovieShow };
}
