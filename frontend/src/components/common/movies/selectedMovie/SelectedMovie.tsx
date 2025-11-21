'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { IoClose } from 'react-icons/io5';
import SelectedMovieBookButton from './SelectedMovieBookButton';
import SelectedMovieInfo from './SelectedMovieInfo';
import SelectedMovieShowtimes from './SelectedMovieShowtimes';
import SelectedMovieCredits from './SelectedMovieCredits';
import SelectedMovieTrailer from './SelectedMovieTrailer';

import { BackendMovie } from '@/types/movie';
import { movieClient } from '@/clients/movieClient';

interface MovieDetailProps {
  movie: BackendMovie;
  onClose: () => void;
}

/**
 * Selected Movie Modal - Displays full movie details
 *
 * Implements Virtual Proxy pattern:
 * - Receives MovieSummary (lightweight) from parent
 * - Fetches full Movie entity (with cast/directors/producers) on mount
 * - Falls back to MovieSummary if fetch fails
 *
 * This ensures fast browsing (MovieSummary) while providing complete
 * details (Movie) when user shows interest by clicking.
 */
export default function SelectedMovie({ movie, onClose }: MovieDetailProps) {
  // State for showtime selection
  const [currentDate, setCurrentDate] = useState<string>('');
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);

  // Virtual Proxy: Fetch full movie details (cast, directors, producers)
  const { data: fullMovie } = useQuery({
    queryKey: ['movie-details', movie.movie_id],
    queryFn: async () => {
      return await movieClient.getMovieById(movie.movie_id);
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    placeholderData: movie, // Use MovieSummary as placeholder while loading
  });

  // Fetch available showtime dates
  const {
    data: availableDates = [],
    isLoading: datesLoading,
    error: datesError,
  } = useQuery({
    queryKey: ['movie-dates', movie.movie_id],
    queryFn: async () => {
      return await movieClient.getDates(movie.movie_id);
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Auto-select first date when dates load
  useEffect(() => {
    if (availableDates.length > 0 && !currentDate) {
      setCurrentDate(availableDates[0]);
    }
  }, [availableDates, currentDate]);

  return (
    <div className="fixed inset-0 flex z-50 items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Main Popup Container */}
      <div className="relative w-[90vw] max-w-6xl h-[85vh] backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden flex">
        {/* Close Button */}
        <button
          title="Close"
          type="button"
          onClick={onClose}
          className="absolute top-5 right-6 z-[60] bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-2 text-white hover:text-acm-pink duration-200 text-2xl hover:cursor-pointer border border-white/20 hover:border-acm-pink/50"
        >
          <IoClose />
        </button>

        {/* Left Side - Movie Poster + Details */}
        <SelectedMovieInfo movie={fullMovie || movie} />

        {/* Right Side - trailer, showtimes, cast */}
        <div className="w-1/2 h-full p-6 flex flex-col overflow-y-auto bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-sm">
          {/* Trailer Section */}
          <SelectedMovieTrailer movie={fullMovie || movie} />

          {/* Showtimes Section */}
          <SelectedMovieShowtimes
            movie={fullMovie || movie}
            availableDates={availableDates}
            datesLoading={datesLoading}
            datesError={datesError}
            onDateChange={setCurrentDate}
            currentDate={currentDate}
            onShowtimeSelect={setSelectedShowtime}
            selectedShowtime={selectedShowtime}
          />

          {/* Movie Credits Section - Now has real cast/directors/producers! */}
          <SelectedMovieCredits movie={fullMovie || movie} />

          <SelectedMovieBookButton
            selectedShowtime={selectedShowtime ?? ''}
            movie={fullMovie || movie}
            currentDate={currentDate}
          />
        </div>
      </div>
    </div>
  );
}
