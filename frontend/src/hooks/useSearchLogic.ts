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

  const [searchQuery, setSearchQuery] = useState('');

  // Prevent duplicate searches
  const lastSearchRef = useRef<string>('');

  // Handle search from movies page search bar
  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set('title', searchQuery.trim());
    }

    if (selectedGenres.size > 0) {
      params.set('genres', Array.from(selectedGenres).join(','));
    }

    if (selectedDate.month) params.set('month', selectedDate.month);
    if (selectedDate.day) params.set('day', selectedDate.day);
    if (selectedDate.year) params.set('year', selectedDate.year);

    const queryString = params.toString();

    console.log('=== SEARCH REQUEST ===');
    console.log('Search Query:', searchQuery.trim());
    console.log('Selected Genres:', Array.from(selectedGenres));
    console.log('Selected Date:', selectedDate);
    console.log('Query String:', queryString);
    console.log('=====================');

    // Check if this is same search as last
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
