'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminMovie, PaginatedMovieResponse } from '@/types/admin';
import { getMovieDetails, createNewMovie, editExistingMovie } from '@/clients/adminMovieClient';

const dummyMovie: AdminMovie = {
  movie_id: 0,
  title: '',
  status: 'upcoming',
  genres: '',
  rating: '',
  release_date: '',
  synopsis: '',
  trailer_link: '',
  poster_link: '',
  cast_names: '',
  directors: '',
  producers: '',
  score: 0,
  duration: 0,
};

/**
 * Hook for admin movie detail operations
 *
 * Responsibilities:
 * - React state management (selected movie, loading, error)
 * - Fetching full movie details when admin selects a movie to edit
 * - Creating new movies
 * - Updating existing movies
 *
 * Delegates to:
 * - adminMovieClient: API calls for movie CRUD operations
 *
 * @param movieId - Movie ID to fetch/edit (0 means no movie selected)
 * @returns Movie state, loading status, error state, and CRUD operations
 */
export function useAdminMovie(movieId: number) {
  const [selectedMovie, setMovie] = useState<AdminMovie>(dummyMovie);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // get ALL movie information when the admin selects a movie to edit
  const fetchMovieInfo = async (movieId: number) => {
    // If the ID is 0, there is no selected movie. Don't bother calling the API.
    if (movieId == 0) {
      setMovie(dummyMovie);
      return;
    }
    setIsLoading(true);
    console.log('isLoading is ' + isLoading);
    try {
      const data = await getMovieDetails(movieId);
      if (data) {
        setMovie(data);
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load movies';
      setError(errorMessage);
      setMovie(dummyMovie);
    } finally {
      setIsLoading(false);
      console.log('isLoading is ' + isLoading);
    }
  };

  // Add a new movie
  const addMovie = async (movie: Partial<AdminMovie>) => {
    const createdMovie = await createNewMovie(movie);

    if (createdMovie) {
      console.log('Movie created successfully.');
      return true;
    } else {
      console.log('Failed to create new movie.');
      return false;
    }
  };

  // Edit an existing movie
  const editMovie = async (movie: Partial<AdminMovie>, movieId: number) => {
    const updatedMovie = await editExistingMovie(movie, movieId);

    if (updatedMovie) {
      console.log('Movie created successfully.');
      return true;
    } else {
      console.log('Failed to create new movie.');
      return false;
    }
  };

  // Fetch a movie when movieId changes
  useEffect(() => {
    fetchMovieInfo(movieId);
  }, [movieId]);

  return { selectedMovie, isLoading, error, addMovie, editMovie };
}
