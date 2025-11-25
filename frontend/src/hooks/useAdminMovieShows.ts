'use client';
import { useState, useEffect, useCallback } from 'react';
import { ShowTime, BackendMovieShow } from '@/types/admin';
import { getMovieDetails, createNewMovie, editExistingMovie } from '@/clients/adminMovieClient';
import { getMovieShowsForMovie, createMovieShow } from '@/clients/adminMovieShowClient';


// AdminSelectedMovie hook: Used to get ALL movie information when the admin selects a movie to edit.
export function useAdminMovieShows(movieId: number) {
  const [movieShows, setMovieShows] = useState<ShowTime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    
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
      console.log("isLoading is " + isLoading );
    }
  }

  // Schedule a movie show
  const scheduleMovieShow = async (movieShow: BackendMovieShow) => {
    const createdMovieShow = await createMovieShow(movieShow);

        if (createdMovieShow) {
          console.log("Movie created successfully.");
          return true;
        } else {
          console.log("Failed to schedule new movie show.");
          return false;
        }
  }

      // Fetch the movie shows when movieId (the selected movie) changes
      useEffect(() => {
        fetchMovieShows(movieId);
      }, [movieId]);
    
  return { movieShows, isLoading, error, scheduleMovieShow };

}
