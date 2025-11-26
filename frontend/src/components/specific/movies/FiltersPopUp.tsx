'use client';

import FiltersDate from './FiltersDate';
import FiltersGenreButton from './FiltersGenreButton';
import { IoClose } from 'react-icons/io5';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { buildUrl, endpoints } from '@/config/api';
import { useFilters } from '@/contexts/FiltersContext';

interface FiltersPopUpProps {
  isClosed: boolean;
  setIsClosed: (value: boolean) => void;
}

export default function FiltersPopUp({ isClosed, setIsClosed }: FiltersPopUpProps) {
  const router = useRouter();
  // Get the currently selected filters from shared context
  const { selectedGenres, setSelectedGenres, selectedDate, setSelectedDate, resetFilters } = useFilters();

  // State for managing genres fetched from API
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);
  const [hasFetchedGenres, setHasFetchedGenres] = useState(false);

  // Memoize fetch function to prevent recreation on every render
  const fetchGenres = useCallback(async () => {
    if (hasFetchedGenres) return; // Don't fetch if already fetched

    setIsLoadingGenres(true);
    try {
      const url = buildUrl(endpoints.movies.genres);
      console.log('Fetching genres from:', url);
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const genreNames = await response.json();
      console.log('Genres received:', genreNames);
      setAllGenres(genreNames);
      setHasFetchedGenres(true); // Mark as fetched
    } catch (err) {
      console.error('Error fetching genres:', err);
      // Fallback to hardcoded genres if API fails
      setAllGenres(['Action', 'Adventure', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi']);
      setHasFetchedGenres(true); // Mark as fetched even on error
    } finally {
      setIsLoadingGenres(false);
    }
  }, [hasFetchedGenres]);

  // Fetch genres when popup opens (only once per session)
  useEffect(() => {
    if (!isClosed) {
      fetchGenres();
    }
  }, [isClosed, fetchGenres]);

  // When user clicks a genre button, add it to selection or remove it if already selected
  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
  };

  // When user clicks "Apply Filters", update URL with filter params and close popup
  const applyFilters = () => {
    // Build search parameters from selected filters
    const params = new URLSearchParams();

    // Add selected genres (comma-separated) if any are selected
    if (selectedGenres.size > 0) {
      params.set('genres', Array.from(selectedGenres).join(','));
    }

    // Add date filters if user selected a date (convert to integers for backend)
    if (selectedDate.month) params.set('month', selectedDate.month);
    if (selectedDate.day) params.set('day', selectedDate.day);
    if (selectedDate.year) params.set('year', selectedDate.year);

    const queryString = params.toString();

    // Navigate to movies page with filter params
    router.push(`/movies${queryString ? `?${queryString}` : ''}`);

    // Close the popup
    setIsClosed(true);
  };

  // When user clicks X button, reset filters and close popup
  const handleClose = () => {
    resetFilters(); // Reset all filters
    setIsClosed(true); // Close the popup
  };

  if (isClosed) return null;
  return (
    <div className="fixed inset-0 flex items-start justify-center z-50 p-4 pt-20">
      {/* Backdrop Blur Overlay - Cover entire page */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Darker Popup Container */}
      <div className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-black/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl z-10">
        {/* Close Button */}
        <button
          title="Close"
          type="button"
          className="absolute top-4 right-4 z-[60] bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full p-2 text-white hover:text-acm-pink duration-200 text-xl hover:cursor-pointer border border-white/30 hover:border-acm-pink/50"
          onClick={handleClose}
        >
          <IoClose />
        </button>

        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-acm-pink to-red-500 rounded-full"></div>
            <h1 className="text-3xl font-bold text-white">Filters</h1>
          </div>
          <div className="w-full h-[1px] bg-white/30" />
        </div>

        {/* Content - Vertical Layout */}
        <div className="px-6 pb-6">
          <div className="space-y-8">
            {/* Genre Section */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Genre</h2>
              <div className="flex flex-wrap gap-2">
                {isLoadingGenres ? (
                  <div className="text-white/60 text-sm px-3 py-2">Loading genres...</div>
                ) : (
                  allGenres.map((genre, index) => {
                    return (
                      <FiltersGenreButton
                        key={index}
                        genre={genre}
                        selected={selectedGenres.has(genre)}
                        onChange={() => toggleGenre(genre)}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Date Section */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Release Date</h2>
              <FiltersDate text="" value={selectedDate} onChange={(newDate) => setSelectedDate(newDate)} />
            </div>
          </div>
        </div>

        {/* Action Buttons - Fixed position */}
        <div className="px-6 pb-6 border-t border-white/20 pt-6">
          <div className="flex gap-3">
            <button
              type="button"
              title="Reset Filters"
              onClick={() => {
                resetFilters();
                router.push('/movies'); // Clear URL params when resetting
              }}
              className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40 text-white py-3 rounded-lg font-medium text-base transition-all duration-200 cursor-pointer hover:-translate-y-1"
            >
              Reset
            </button>
            <button
              type="button"
              title="Apply Filters"
              onClick={applyFilters}
              className="flex-1 bg-acm-pink hover:bg-acm-pink/90 text-white py-3 rounded-lg font-bold text-base transition-all duration-200 shadow-lg hover:shadow-acm-pink/25 cursor-pointer text-shadow-white hover:-translate-y-1"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
