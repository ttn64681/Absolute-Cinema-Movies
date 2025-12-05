'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminMovie, PaginatedMovieResponse } from '@/types/admin';
import { getMovieDetails, createNewMovie, editExistingMovie, deleteExistingMovie } from '@/clients/adminMovieClient';
import { useToast } from '@/contexts/ToastContext';

// Dummy movie data to use when there isn't a selected movie
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
  const [selectedMovieLoading, setSelectedMovieLoading] = useState(false);
  const [selectedMovieError, setSelectedMovieError] = useState<string | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0); 
  const { showToast } = useToast();

  // get ALL movie information when the admin selects a movie to edit
  const fetchMovieInfo = async (movieId: number) => {

    // If the ID is 0, there is no selected movie. Don't bother calling the API.
    if (movieId == 0) {
      setMovie(dummyMovie);
      return;
    }
    setSelectedMovieLoading(true);
    console.log('isLoading is ' + selectedMovieLoading);
    try {
      const data = await getMovieDetails(movieId);
      if (data) {
        setMovie(data);
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load movies';
      setSelectedMovieError(errorMessage);
      setMovie(dummyMovie);
    } finally {
      setSelectedMovieLoading(false);
    }
  };

  // Add a new movie
  const addMovie = async (movie: Partial<AdminMovie>) => {
    setSelectedMovieLoading(true);
    try {
      const createdMovie = await createNewMovie(movie);
      if (createdMovie) {
        console.log('Movie created successfully.');
        // Show success message
        showToast('Movie \"' + createdMovie.title + '\" with ID ' + createdMovie.movie_id +  ' created successfully.', 'success', 8000);
        return createdMovie.movie_id;
      }

    } catch (error) {
      console.error('Error creating movie:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create movie';
      setSelectedMovieError(errorMessage);
      // Show failure message
      showToast('Error creating movie: ' + errorMessage, 'error');
      return null;
    } finally {
      setSelectedMovieLoading(false);
    }
  };

  // Edit an existing movie
  const editMovie = async (movie: Partial<AdminMovie>, movieId: number) => {
    setSelectedMovieLoading(true);
    try {
      const updatedMovie = await editExistingMovie(movie, movieId);
      if (updatedMovie) {
        console.log('Movie updated successfully.');
        // Show success message
        showToast('Info for movie \"' + updatedMovie.title + '\" with ID ' + updatedMovie.movie_id +  ' updated successfully.', 'success', 8000);
        return updatedMovie.movie_id;
      }

    } catch (error) {
      console.error('Error updating movie:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update movie';
      setSelectedMovieError(errorMessage);
      // Show failure message
      showToast('Error creating movie: ' + errorMessage, 'error');
      return null;
    } finally {
      setSelectedMovieLoading(false);
    }
  };

  // Delete an (upcoming) movie
  const deleteMovie = async (movieId: number) => {
    setSelectedMovieLoading(true);
    try {
      await deleteExistingMovie(movieId);
      showToast("Movie deleted.", 'success', 8000);

    } catch (error) {
      console.error('Error deleting movie:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete movie';
      setSelectedMovieError(errorMessage);
      return null;
    } finally {
      setSelectedMovieLoading(false);
    }
  };

  // Set a flag to fetch the movie data for the same selected movie after it has changed
  const refreshMovie = () => {
    setRefreshFlag(prev => prev + 1);
  }

  // Fetch movie data when the selected movie changes or movie data of the selected movie is changed
  useEffect(() => {
    fetchMovieInfo(movieId);
  }, [movieId, refreshFlag]);

  return { selectedMovie, selectedMovieLoading, selectedMovieError, addMovie, editMovie, deleteMovie, refreshMovie };
}
