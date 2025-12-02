/**
 * Movie Show Client - Facade for movie show API operations
 *
 * Used by: useSeats hook
 */

import { buildUrl, endpoints } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

/**
 * Generic request helper - Standardizes all API calls
 */
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();

  const response = await fetch(buildUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

interface Auditorium {
  id: number;
  name: string;
  capacity: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Movie Show Client API
 *
 * Provides methods for movie show-related operations:
 * - Get auditorium information by movie show ID
 */
export const movieShowClient = {
  /**
   * Get auditorium (ShowRoom) by movie show ID
   * Used by booking flow to get correct seat layout
   *
   * @param movieShowId - Movie show ID
   * @returns Auditorium information (name, capacity)
   */
  async getAuditoriumByMovieShowId(movieShowId: number): Promise<Auditorium> {
    return request<Auditorium>(endpoints.movieShows.getAuditorium(movieShowId));
  },
};

