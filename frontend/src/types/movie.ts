/**
 * Shared Movie Types
 * These interfaces match the backend data structure exactly
 */

// Backend movie data interface (matches your Java backend)
export interface BackendMovie {
  movie_id: number;
  title: string;
  status: string;
  genres: string;
  rating: string;
  release_date: string;
  synopsis: string;
  trailer_link: string;
  poster_link: string;
  cast_names: string;
  directors: string;
  producers: string;
}

// Paginated movie response from backend
export interface PaginatedMovieResponse {
  movies: BackendMovie[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  pageSize: number;
}
