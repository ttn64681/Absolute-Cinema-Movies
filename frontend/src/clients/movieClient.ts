/**
 * Movie Client - Facade for movie API operations
 *
 * Centralizes all movie-related API calls with standardized error handling,
 * authentication, and request configuration.
 *
 * Follows Facade pattern: Single interface to complex movie API subsystem
 *
 * Usage:
 *   const movies = await movieClient.getNowPlaying(0);
 *   const movie = await movieClient.getMovieById(123);
 */

import { buildUrl, endpoints } from '@/config/api';
import { BackendMovie, PaginatedMovieResponse } from '@/types/movie';
import { getAuthToken } from '@/utils/auth';

/**
 * Generic request helper - Standardizes all API calls
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const url = buildUrl(path);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[movieClient] API Error [${response.status}]:`, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`[movieClient] Request failed for ${url}:`, error);
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`Network error: Unable to reach backend at ${url}.`);
    }
    throw error;
  }
}

/**
 * Movie Client API
 *
 * Provides methods for all movie-related operations:
 * - Browse movies (paginated, with filters)
 * - Search movies
 * - Get movie details
 * - Get genres
 * - Get showtimes
 */
export const movieClient = {
  /**
   * Get paginated Now Playing movies
   *
   * @param page - Page number (0-indexed)
   * @returns Paginated response with MovieSummary objects
   */
  async getNowPlaying(page: number): Promise<PaginatedMovieResponse> {
    return request<PaginatedMovieResponse>(`${endpoints.movies.browseNowPlaying}?page=${page}`);
  },

  /**
   * Get paginated Upcoming movies
   *
   * @param page - Page number (0-indexed)
   * @returns Paginated response with MovieSummary objects
   */
  async getUpcoming(page: number): Promise<PaginatedMovieResponse> {
    return request<PaginatedMovieResponse>(`${endpoints.movies.browseUpcoming}?page=${page}`);
  },

  /**
   * Search Now Playing movies with filters
   *
   * @param params - Search parameters (title, genres, date)
   * @param page - Page number (0-indexed)
   * @returns Paginated response with matching movies
   */
  async searchNowPlaying(
    params: {
      title?: string;
      genres?: string;
      month?: number;
      day?: number;
      year?: number;
    },
    page: number
  ): Promise<PaginatedMovieResponse> {
    const queryParams = new URLSearchParams();
    if (params.title) queryParams.set('title', params.title);
    if (params.genres) queryParams.set('genres', params.genres);
    if (params.month !== undefined) queryParams.set('month', params.month.toString());
    if (params.day !== undefined) queryParams.set('day', params.day.toString());
    if (params.year !== undefined) queryParams.set('year', params.year.toString());
    queryParams.set('page', page.toString());

    return request<PaginatedMovieResponse>(`${endpoints.movies.searchNowPlaying}?${queryParams.toString()}`);
  },

  /**
   * Search Upcoming movies with filters
   *
   * @param params - Search parameters (title, genres, date)
   * @param page - Page number (0-indexed)
   * @returns Paginated response with matching movies
   */
  async searchUpcoming(
    params: {
      title?: string;
      genres?: string;
      month?: number;
      day?: number;
      year?: number;
    },
    page: number
  ): Promise<PaginatedMovieResponse> {
    const queryParams = new URLSearchParams();
    if (params.title) queryParams.set('title', params.title);
    if (params.genres) queryParams.set('genres', params.genres);
    if (params.month !== undefined) queryParams.set('month', params.month.toString());
    if (params.day !== undefined) queryParams.set('day', params.day.toString());
    if (params.year !== undefined) queryParams.set('year', params.year.toString());
    queryParams.set('page', page.toString());

    return request<PaginatedMovieResponse>(`${endpoints.movies.searchUpcoming}?${queryParams.toString()}`);
  },

  /**
   * Get full movie details by ID (Virtual Proxy pattern)
   *
   * Returns complete Movie entity including:
   * - All MovieSummary fields
   * - cast_names (full cast list)
   * - directors (full director list)
   * - producers (full producer list)
   *
   * Use this when user clicks on a movie for detailed view.
   * For browsing/lists, use getNowPlaying/getUpcoming instead.
   *
   * @param movieId - Movie ID
   * @returns Full movie entity with cast/crew details
   */
  async getMovieById(movieId: number): Promise<BackendMovie> {
    return request<BackendMovie>(endpoints.movies.byId(movieId));
  },

  /**
   * Get all available genres
   *
   * @returns Array of genre strings
   */
  async getGenres(): Promise<string[]> {
    return request<string[]>(endpoints.movies.genres);
  },

  /**
   * Get available showtime dates for a movie
   *
   * @param movieId - Movie ID
   * @returns Array of date strings (YYYY-MM-DD format)
   */
  async getDates(movieId: number): Promise<string[]> {
    return request<string[]>(endpoints.movies.dates(movieId));
  },

  /**
   * Get available showtimes for a movie on a specific date
   *
   * @param movieId - Movie ID
   * @param date - Date string (YYYY-MM-DD format)
   * @returns Array of time strings (HH:MM format)
   */
  async getTimes(movieId: number, date: string): Promise<string[]> {
    const url = new URL(buildUrl(endpoints.movies.times(movieId)));
    url.searchParams.set('date', date);

    return request<string[]>(url.toString());
  },

  /**
   * Get movie_show.id from movieId, date, and time
   * Used by booking flow to identify which show to book
   *
   * @param movieId - Movie ID
   * @param date - Date string (YYYY-MM-DD format)
   * @param time - Time string (HH:MM:SS format - 24-hour format)
   * @returns Movie show ID (number) or null if not found
   */
  async getShowId(movieId: number, date: string, time: string): Promise<number | null> {
    const url = new URL(buildUrl(endpoints.movies.showId(movieId)));
    url.searchParams.set('date', date);
    url.searchParams.set('time', time);

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        return null; // Show not found
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // Handle both formats: {showId: number, success: boolean} or just number
      if (typeof data === 'object' && data.showId !== undefined) {
        return data.showId as number;
      } else if (typeof data === 'number') {
        return data;
      }
      return null;
    } catch (error) {
      console.error('Error fetching showId:', error);
      return null;
    }
  },
};
