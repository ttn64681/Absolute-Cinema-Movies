'use client';

import FiltersDate from './FiltersDate';
import FiltersGenreButton from './FiltersGenreButton';
import { IoClose } from 'react-icons/io5';
import { useState, useCallback, useEffect } from 'react';
import { buildUrl, endpoints } from '@/config/api';
import { useFilters } from '@/contexts/FiltersContext';

interface FiltersPopUpProps {
  isClosed: boolean;
  setIsClosed: (value: boolean) => void;
}

export default function FiltersPopUp({ isClosed, setIsClosed }: FiltersPopUpProps) {
  // Get the currently selected filters from shared context
  const { selectedGenres, setSelectedGenres, selectedDate, setSelectedDate } = useFilters();

  // State for managing genres fetched from API
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);
  const [hasFetchedGenres, setHasFetchedGenres] = useState(false);

  // Memoize fetch function to prevent recreation on every render
  // When would this recreate? Never (empty dependency array)
  // When would it recreate without this? Every time FiltersPopUp re-renders
  // (which happens when isClosed state changes, parent re-renders, etc.)
  // Performance impact: Prevents unnecessary function recreation and potential re-fetching
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

  // const months: string[] = [
  //   "January", "February", "March", "April", "May", "June",
  //   "July", "August", "September", "October", "November", "December"
  // ];
  // const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());

  // When user clicks a genre button, add it to selection or remove it if already selected
  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(genre)) next.delete(genre);
      else next.add(genre);
      return next;
    });
  };

  // When user clicks "Apply Filters", just close the popup (filters stay selected for search)
  const applyFilters = () => {
    setIsClosed(true); // Close the popup, filters remain selected
  };

  if (isClosed) return null;
  return (
    <>
      {/* blurry overlay over ENTIRE background - HIGHEST z-index to cover everything including BokehBackground */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-999" />
      {/* Popup Container */}
      <div className="fixed top-16 left-0 right-0 flex items-center justify-center z-1000 p-4">
        {/* Popup Window */}
        <div className="flex flex-col items-center gap-y-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative rounded-3xl shadow-2xl z-10 border border-white/20 bg-black/80">
          {/* Close Button */}
          <button
            title="Close"
            type="button"
            className="absolute top-6 right-6 z-60 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-2 text-white hover:text-acm-pink duration-200 text-2xl hover:cursor-pointer border border-white/20 hover:border-acm-pink/50"
            onClick={() => setIsClosed(true)}
          >
            <IoClose />
          </button>
          <div className="flex flex-col w-full">
            <h1 className="text-7xl font-bold font-afacad p-6">Filters</h1>
            <div className="w-full h-[2px] bg-white/15" />
          </div>
          <div className="flex flex-row w-full justify-items-stretch gap-4 pb-8">
            <div className="flex flex-col gap-2 basis-1/2 px-4 py-2">
              <h1 className="text-3xl font-bold font-afacad">Genre</h1>
              <div className="flex flex-wrap gap-2">
                {isLoadingGenres ? (
                  <div className="text-white/60 text-lg px-4 py-2">Loading genres...</div>
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

            <div className="flex flex-col gap-2 basis-1/2 px-4 py-2">
              <h1 className="text-3xl font-bold font-afacad">Date</h1>
              <FiltersDate
                text={'Release Date'}
                value={selectedDate}
                onChange={(newDate) => setSelectedDate(newDate)}
              />
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="flex justify-center pb-6">
            <button
              type="button"
              title="Apply Filters"
              onClick={applyFilters}
              className="bg-acm-pink hover:bg-acm-pink/80 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
