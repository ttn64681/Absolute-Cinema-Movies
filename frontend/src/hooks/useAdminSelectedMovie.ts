'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminMovie, PaginatedMovieResponse} from '@/types/admin';
import { getMovieDetails } from '@/clients/adminMovieClient';


const dummyMovie: AdminMovie = {
  movie_id: 0,
  title: "",
  status: "upcoming",
  genres: "",
  rating: "",
  release_date: "",
  synopsis: "",
  trailer_link: "",
  poster_link: "",
  cast_names: "",
  directors: "",
  producers: "",
  score: 0,
  duration: 0
}

// AdminSelectedMovie hook: Used to get ALL movie information when the admin selects a movie to edit.
export function useAdminSelectedMovie(movieId: number) {
  const [selectedMovie, setMovie] = useState<AdminMovie>(dummyMovie);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
    
      // Fetch movies for current page
      const fetchMovieInfo = async (movieId: number) => {
            setIsLoading(true);
            console.log("isLoading is " + isLoading );
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
                console.log("isLoading is " + isLoading );
            }
        }
    
      // Fetch a movie when movieId changes
      useEffect(() => {
        fetchMovieInfo(movieId);
      }, [movieId]);
    
      return {
        selectedMovie,
        isLoading,
        error
      };

}
