/**
 * Shared Admin Types
 * These interfaces are used for admin functionality
 */

// Movie interface for admin movie management (duplicate of inline type, keeping as is)
export interface AdminMovie {
  movie_id: number;
  title: string;
  date: string;
  time: string;
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
  reviews: string;
  duration: number;
  score: number;
  _meta?: {
    showtimes?: Array<{ date: string; time: string; ampm: string; room?: string }>;
  };
}

// Alias for Movie type used in admin movies page
export type Movie = AdminMovie;

// Paginated movie response from backend
export interface PaginatedMovieResponse {
  movies: AdminMovie[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
  pageSize: number;
}

// User interface for admin user management
export interface StoredUser {
  id: number;
  name: string;
  type: 'admin' | 'member';
  status?: 'active' | 'inactive' | 'suspended';
}
