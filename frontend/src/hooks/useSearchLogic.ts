import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFilters } from '@/contexts/FiltersContext';

/**
 * Hook for search logic and filter management
 *
 * Responsibilities:
 * - React state management (search query)
 * - Prevent duplicate searches
 * - Build search URL with filters
 * - Navigate to movies page with search params
 *
 * Delegates to:
 * - useFilters context: Global filter state
 * - Next.js router: Navigation
 *
 * @returns Search query state and search handler function
 */
export function useSearchLogic() {
  const router = useRouter();
  // Get global filter state from context
  const { selectedGenres, selectedDate, isFiltersOpen, setIsFiltersOpen } = useFilters();

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

  // Prevent duplicate searches
  const lastSearchRef = useRef<string>('');

  // Handle search from movies page search bar
  const handleSearch = () => {
    // Build the search parameters
    const params = new URLSearchParams();

    // Add movie title if user typed something
    if (searchQuery.trim()) {
      params.set('title', searchQuery.trim());
    }

    // Add selected genres (comma-separated) if any are selected (same as navbar)
    if (selectedGenres.size > 0) {
      params.set('genres', Array.from(selectedGenres).join(','));
    }

    // Add date filters if user selected a date (same as navbar)
    if (selectedDate.month) params.set('month', selectedDate.month);
    if (selectedDate.day) params.set('day', selectedDate.day);
    if (selectedDate.year) params.set('year', selectedDate.year);

    const queryString = params.toString();

    // Console log the API request details (same as navbar)
    console.log('=== SEARCH REQUEST ===');
    console.log('Search Query:', searchQuery.trim());
    console.log('Selected Genres:', Array.from(selectedGenres));
    console.log('Selected Date:', selectedDate);
    console.log('Query String:', queryString);
    console.log('=====================');

    // Check if this is the same search as the last one
    if (queryString === lastSearchRef.current) {
      return;
    }

    lastSearchRef.current = queryString;

    router.push(`/movies${queryString ? `?${queryString}` : ''}`);
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    handleSearch,
    handleKeyPress,
  };
}
