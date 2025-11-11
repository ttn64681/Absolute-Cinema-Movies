/**
 * Shared Admin Types
 * These interfaces are used for admin functionality
 */

// Movie interface for admin movie management (duplicate of inline type, keeping as is)
export interface AdminMovie {
  id: number;
  title: string;
  date: string;
  time: string;
  _meta?: {
    showtimes?: Array<{ date: string; time: string; ampm: string; room?: string }>;
  };
}

// Alias for Movie type used in admin movies page
export type Movie = AdminMovie;

// User interface for admin user management
export interface StoredUser {
  id: number;
  name: string;
  type: 'admin' | 'member';
  status?: 'active' | 'inactive' | 'suspended';
}
