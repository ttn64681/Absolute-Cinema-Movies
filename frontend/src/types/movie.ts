/**
 * Shared Movie Types
 * These interfaces match the backend data structure exactly
 */

// Movie summary (matches backend MovieSummary DTO)
// For browsing lists (homepage, movies page)
export interface MovieSummary {
  movie_id: number;
  title: string;
  status: string;
  genres: string;
  rating: string;
  release_date: string;
  synopsis: string;
  trailer_link: string;
  poster_link: string;
  score: number;
  duration: number; // Duration in minutes
  // Note: cast_names, directors, producers NOT included (loaded on-demand via Virtual Proxy)
}

// Full movie details (matches backend Movie entity)
// For full movie details (includes cast, directors, producers)
// score and duration are already in MovieSummary
export interface BackendMovie extends MovieSummary {
  cast_names: string;
  directors: string;
  producers: string;
}

// Paginated movie response from backend
// Returns MovieSummary[] for list endpoints (/browse/now-playing, /browse/upcoming)
export interface PaginatedMovieResponse {
  movies: MovieSummary[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  pageSize: number;
}
