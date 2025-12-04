'use client';

import { IoClose } from 'react-icons/io5';
import SelectedMovieBookButton from './SelectedMovieBookButton';
import SelectedMovieInfo from './SelectedMovieInfo';
import SelectedMovieShowtimes from './SelectedMovieShowtimes';
import SelectedMovieCredits from './SelectedMovieCredits';
import SelectedMovieTrailer from './SelectedMovieTrailer';

import { MovieSummary } from '@/types/movie';
import { useSelectedMovie } from '@/hooks/useSelectedMovie';

interface MovieDetailProps {
  movie: MovieSummary; // Receives MovieSummary from MovieCard, fetches BackendMovie via Virtual Proxy
  onClose: () => void;
}

/**
 * Displays full movie details
 *
 * Presentation component - delegates all state & API logic to useSelectedMovie hook
 *
 * Virtual Proxy pattern (implemented in hook):
 * - Receives MovieSummary (lightweight) from parent component (MovieCard)
 * - Fetches full Movie entity (w/ cast/directors/producers) on mount
 * - Falls back to MovieSummary if fetch fails
 *
 * This ensures fast browsing (MovieSummary) while providing complete
 * details (Movie) when user shows interest by clicking.
 */
export default function SelectedMovie({ movie, onClose }: MovieDetailProps) {
  // Delegate all state & API logic to hook (follows facade client pattern)
  const {
    displayMovie,
    availableDates,
    datesLoading,
    datesError,
    currentDate,
    selectedShowtime,
    setCurrentDate,
    setSelectedShowtime,
  } = useSelectedMovie(movie);

  // Decorator pattern: Conditionally render based on movie status
  const isUpcoming = displayMovie.status?.toLowerCase() === 'upcoming';
  
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
          className="absolute top-5 right-6 z-60 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-2 text-white hover:text-acm-pink duration-200 text-2xl hover:cursor-pointer border border-white/20 hover:border-acm-pink/50"
        >
          <IoClose />
        </button>

        {/* Left Side - Movie Poster + Details */}
        <SelectedMovieInfo movie={displayMovie} />

        {/* Right Side - trailer, showtimes, cast */}
        <div className="w-1/2 h-full p-6 flex flex-col overflow-y-auto bg-linear-to-br from-black/90 to-gray-900/90 backdrop-blur-sm">
          {/* Trailer Section */}
          <SelectedMovieTrailer movie={displayMovie} />

          {/* Decorator: Only render showtimes for NOW_PLAYING movies */}
          {!isUpcoming && (
            <SelectedMovieShowtimes
              movie={displayMovie}
              availableDates={availableDates}
              datesLoading={datesLoading}
              datesError={datesError}
              onDateChange={setCurrentDate}
              currentDate={currentDate}
              onShowtimeSelect={setSelectedShowtime}
              selectedShowtime={selectedShowtime}
            />
          )}

          {/* Movie Credits Section - Shows loading state if MovieSummary, full credits if BackendMovie */}
          <SelectedMovieCredits movie={displayMovie} />

          {/* Decorator: Only render checkout button for NOW_PLAYING movies */}
          {!isUpcoming && (
            <SelectedMovieBookButton
              selectedShowtime={selectedShowtime ?? ''}
              movie={displayMovie}
              currentDate={currentDate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
