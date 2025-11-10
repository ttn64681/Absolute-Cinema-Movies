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
import { buildUrl, endpoints } from '@/config/api';

interface MovieDetailProps {
  movie: BackendMovie;
  onClose: () => void;
}

// MOVIE DETAILS POP-UP
export default function SelectedMovie({ movie, onClose }: MovieDetailProps) {
  // Dummy data for show dates and times
  // const availableDates = ["10/10/25", "10/11/25", "10/12/25"];
  // const availableTimes = ["8:00 PM", "9:15 PM", "10:00 PM"];

  // State for showtime selection
  const [currentDate, setCurrentDate] = useState<string>('');
  const [selectedShowtime, setSelectedShowtime] = useState<string | null>(null);

  // Fetch dates with useQuery
  const {
    data: availableDates = [],
    isLoading: datesLoading,
    error: datesError,
  } = useQuery({
    queryKey: ['movie-dates', movie.movie_id], // uniqueKey for system to invalidate query if movie ID changes
    queryFn: async () => {
      const url = buildUrl(endpoints.movies.dates(movie.movie_id));
      const resp = await fetch(url);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return resp.json();
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
        <SelectedMovieInfo movie={movie} />

        {/* Right Side - trailer, showtimes, cast */}
        <div className="w-1/2 h-full p-6 flex flex-col overflow-y-auto bg-gradient-to-br from-black/90 to-gray-900/90 backdrop-blur-sm">
          {/* Trailer Section */}
          <SelectedMovieTrailer movie={movie} />

          {/* Showtimes Section */}
          <SelectedMovieShowtimes
            movie={movie}
            availableDates={availableDates}
            datesLoading={datesLoading}
            datesError={datesError}
            onDateChange={setCurrentDate}
            currentDate={currentDate}
            onShowtimeSelect={setSelectedShowtime}
            selectedShowtime={selectedShowtime}
          />

          {/* Movie Credits Section */}
          <SelectedMovieCredits movie={movie} />

          <SelectedMovieBookButton selectedShowtime={selectedShowtime ?? ''} movie={movie} currentDate={currentDate} />
        </div>
      </div>
    </div>
  );
}
