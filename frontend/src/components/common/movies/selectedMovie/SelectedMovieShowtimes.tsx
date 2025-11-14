'use client';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { IoChevronDown } from 'react-icons/io5';
import { BackendMovie } from '@/types/movie';
import { buildUrl, endpoints } from '@/config/api';
import Spinner from '@/components/common/Spinner';

interface SelectedMovieShowtimesProps {
  movie: BackendMovie;
  availableDates: string[];
  datesLoading: boolean;
  datesError: Error | null;
  onDateChange: (date: string) => void;
  currentDate: string;
  onShowtimeSelect: (showtime: string) => void;
  selectedShowtime: string | null;
}

export default function SelectedMovieShowtimes({
  movie,
  availableDates,
  datesLoading,
  datesError,
  onDateChange,
  currentDate,
  onShowtimeSelect,
  selectedShowtime,
}: SelectedMovieShowtimesProps) {
  const [openDateDropdown, setOpenDateDropdown] = useState(false);

  // Fetch times with useQuery - Automatic dependency management
  const {
    data: availableTimes = [],
    isLoading: timesLoading,
    error: timesError,
  } = useQuery({
    queryKey: ['movie-times', movie.movie_id, currentDate], // uniqueKey for system to invalidate query if movie ID or date changes
    queryFn: async () => {
      const url = new URL(buildUrl(endpoints.movies.times(movie.movie_id)));
      // Build date=YYYY-MM-DD as required by backend
      let isoDate = currentDate;
      // currentDate is in form MM/DD/YYYY, we need to convert it to YYYY-MM-DD
      if (currentDate.includes('/')) {
        const [mRaw, dRaw, yRaw] = currentDate.split('/');
        const year = (yRaw || '').length === 2 ? `20${yRaw}` : yRaw;
        const mm = (mRaw || '').padStart(2, '0'); // padStart(2, '0') pads with 0s to make it 2 digits
        const dd = (dRaw || '').padStart(2, '0'); // this results in 01, 02, 03, etc.
        isoDate = `${year}-${mm}-${dd}`;
      }
      url.searchParams.set('date', isoDate); // set the date parameter in the URL

      const resp = await fetch(url.toString());
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const payload = await resp.json();

      // Support either array of strings or array of objects with start_time
      return Array.isArray(payload)
        ? payload
            .map((t: string | { start_time: string }) => (typeof t === 'string' ? t : t?.start_time || ''))
            .filter((t: string) => !!t)
        : [];
    },
    enabled: !!currentDate, // Only fetch when date is selected
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes (shorter for times)
  });

  const handleShowDateSelect = (date: string) => {
    // Toggle date selection: if already selected, deselect; otherwise select
    if (currentDate === date) {
      onDateChange(''); // Deselect by passing empty string
    } else {
      onDateChange(date); // Select the date
    }
    setOpenDateDropdown(false);
    onShowtimeSelect('');
  };

  const handleShowtimeSelect = (time: string) => {
    // Toggle selection: if already selected, deselect; otherwise select
    if (selectedShowtime === time) {
      onShowtimeSelect(''); // Deselect by passing empty string
    } else {
      onShowtimeSelect(time); // Select the time
    }
  };

  // Reset selected showtime when times change
  useEffect(() => {
    onShowtimeSelect('');
  }, [availableTimes, onShowtimeSelect]);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-acm-pink to-red-500 rounded-full"></div>
        <h3 className="text-white font-bold text-xl">Showtimes</h3>
      </div>

      {/* Date dropdown */}
      <div className="z-50 mb-6">
        <label className="z-50 block text-white/80 text-sm font-medium mb-2">Select Date</label>
        <div
          onClick={() => setOpenDateDropdown(!openDateDropdown)}
          className="z-50 relative w-full max-w-xs h-12 rounded-xl bg-black/60 text-lg border-2 border-white/20 hover:border-acm-pink/50 flex items-center cursor-pointer transition-all duration-200 backdrop-blur-sm"
        >
          <span className=" ml-4 mr-2 text-white">{currentDate}</span>
          <IoChevronDown className="ml-auto mr-4 text-white/60 hover:text-acm-pink transition-colors" />

          {openDateDropdown && (
            <div className="absolute top-12 left-0 w-40 max-h-56 overflow-auto overscroll-contain rounded-lg shadow-xl bg-black/95 backdrop-blur-md border border-white/20 z-[60]">
              <ul className="py-1">
                {datesLoading && (
                  <li className="block px-4 py-3 text-white/60 text-sm transition-all duration-200">
                    Loading dates...
                  </li>
                )}
                {datesError && (
                  <li className="block px-4 py-3 text-red-400 text-sm transition-all duration-200">
                    {datesError instanceof Error ? datesError.message : 'Failed to load dates'}
                  </li>
                )}
                {!datesLoading &&
                  !datesError &&
                  availableDates.map((date: string) => (
                    <li key={date}>
                      <button
                        title="Select Date"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowDateSelect(date);
                        }}
                        className="z-50 block px-4 py-3 text-white text-sm transition-all duration-200 hover:bg-white/10 hover:text-acm-pink w-full text-left cursor-pointer"
                      >
                        {date}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        {/* Showtimes */}
        <div className="mb-4">
          <label className="block text-white/80 text-sm font-medium mb-3">Available Times</label>
          <div className="flex gap-3 flex-wrap">
            {timesLoading && <Spinner size="sm" color="pink" text="Loading times..." />}
            {timesError && (
              <div className="flex items-center gap-2 text-red-400">
                <span>⚠️</span>
                <span>{timesError instanceof Error ? timesError.message : 'Failed to load times'}</span>
              </div>
            )}
            {!timesLoading &&
              !timesError &&
              availableTimes.map((time) => (
                <button
                  title="Select Showtime"
                  type="button"
                  key={time}
                  onClick={() => {
                    handleShowtimeSelect(time);
                  }}
                  className={[
                    'px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 cursor-pointer', // Base styles with hover scale animation and cursor pointer
                    selectedShowtime === time
                      ? 'bg-gradient-to-r from-acm-pink to-red-500 text-white border-2 border-acm-pink shadow-lg shadow-acm-pink/25 drop-shadow-lg' // Selected state: gradient background with pink glow shadow
                      : 'bg-white/10 text-white border-2 border-white/20 hover:bg-white/20 hover:border-acm-pink/50 backdrop-blur-sm', // Default state: semi-transparent with hover effects
                  ].join(' ')}
                >
                  {time}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
