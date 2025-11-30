'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminMovie, PaginatedMovieResponse } from '@/types/admin';
import { fetchMoviesPaginated } from '@/clients/adminMovieClient';

/**
 * Hook for admin movie list operations
 *
 * Responsibilities:
 * - React state management (movies, pagination, loading, error)
 * - Fetching paginated movie list for admin
 * - Pagination navigation
 *
 * Delegates to:
 * - adminMovieClient: API calls for movie list
 *
 * @returns Movie list state, pagination info, and navigation operations
 */
export function useAdminMoviesList() {
    const [page, setPage] = useState(0);
      const [adminMovies, setMovies] = useState<AdminMovie[]>([]);
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
      const fetchMovies = async (pageNum: number) => {
            setIsLoading(true);
            console.log("isLoading is " + isLoading );
            try {
                const data = await fetchMoviesPaginated(pageNum);    
                if (data) {
                    setMovies(data.movies);
                    setPagination({
                        currentPage: data.currentPage,
                        totalPages: data.totalPages,
                        totalElements: data.totalElements,
                        hasNext: data.hasNext,
                        hasPrevious: data.hasPrevious,
                    });
                }
            } catch (err) {
                console.error('Error fetching movies:', err);
                const errorMessage = err instanceof Error ? err.message : 'Failed to load movies';
                setError(errorMessage);
                setMovies([]);
            } finally {
                setIsLoading(false);
                console.log("isLoading is " + isLoading );
            }
        }
    
      // Fetch movies when page changes
      useEffect(() => {
        fetchMovies(page);
      }, [page]);
    
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
    
      const goToThisPage = useCallback(
        (pageNum: number) => {
          if (pageNum >= 0 && pageNum < pagination.totalPages && pageNum !== page) {
            setPage(pageNum);
          }
        },
        [pagination.totalPages]
      );
    
      return {
        adminMovies,
        isLoading,
        error,
        pagination,
        goToNextPage,
        goToPreviousPage,
        goToThisPage,
        refreshMovies: () => fetchMovies(page),
      };

}
