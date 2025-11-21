/**
 * Pagination Utilities
 * Shared utilities for pagination logic across hooks
 */

import { PaginatedMovieResponse } from '@/types/movie';

// Cache duration: 5 minutes
export const CACHE_DURATION = 5 * 60 * 1000;

/**
 * Initial pagination state
 */
export const initialPaginationState = {
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  hasNext: false,
  hasPrevious: false,
};

/**
 * Creates pagination state from API response
 */
export function createPaginationState(data: PaginatedMovieResponse) {
  return {
    currentPage: data.currentPage,
    totalPages: data.totalPages,
    totalElements: data.totalElements,
    hasNext: data.hasNext,
    hasPrevious: data.hasPrevious,
  };
}

/**
 * Checks if cached data is still valid
 */
export function isCacheValid(lastFetchTime: number, now: number = Date.now()): boolean {
  return now - lastFetchTime < CACHE_DURATION;
}

/**
 * Navigation functions factory
 */
export function createPaginationNavigation(
  setPage: (updater: (prev: number) => number) => void,
  pagination: typeof initialPaginationState
) {
  return {
    goToNextPage: () => {
      if (pagination.hasNext) {
        setPage((prev) => prev + 1);
      }
    },
    goToPreviousPage: () => {
      if (pagination.hasPrevious) {
        setPage((prev) => prev - 1);
      }
    },
    goToPage: (pageNum: number) => {
      if (pageNum >= 0 && pageNum < pagination.totalPages) {
        setPage(pageNum);
      }
    },
  };
}

