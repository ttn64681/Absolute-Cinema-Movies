/**
 * Shared Movie Types
 * These interfaces match the backend data structure exactly
 */

// Movie summary (matches backend MovieSummary DTO)
// Virtual Proxy: Lightweight version for browsing, full details loaded on-click of card
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
// Virtual Proxy: Loaded on-demand when user clicks movie (see useSelectedMovie hook)
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
