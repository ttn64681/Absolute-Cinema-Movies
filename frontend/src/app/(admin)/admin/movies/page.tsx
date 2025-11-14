'use client';

import Link from 'next/link';
import { PiPencilSimple, PiX, PiMagnifyingGlass, PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import { useState, useEffect } from 'react';
import AdminNavBar from '@/components/common/navBar/AdminNavBar';
import { Movie } from '@/types/admin';
import MovieFormModal, { AdminMovie } from '@/components/specific/admin/MovieFormModal';
import ScheduleModal from '@/components/specific/admin/ScheduleModal';

// hardcoded movies for now
const moviesList: Movie[] = [
  {
    id: 1,
    title: 'Oldboy',
    date: '12/15/2024',
    time: '7:30PM',
    _meta: {
      showtimes: [
        { date: '12/15/2024', time: '7:30', ampm: 'PM', room: 'A' },
        { date: '12/16/2024', time: '8:00', ampm: 'PM', room: 'B' },
        { date: '12/17/2024', time: '7:30', ampm: 'PM', room: 'C' },
      ],
    },
  },
  {
    id: 2,
    title: 'Him',
    date: '12/20/2024',
    time: '8:00PM',
    _meta: {
      showtimes: [
        { date: '12/20/2024', time: '8:00', ampm: 'PM', room: 'A' },
        { date: '12/21/2024', time: '9:00', ampm: 'PM', room: 'B' },
      ],
    },
  },
  {
    id: 3,
    title: 'Beauty and the Beast',
    date: '12/18/2024',
    time: '6:45PM',
    _meta: {
      showtimes: [
        { date: '12/18/2024', time: '6:45', ampm: 'PM', room: 'A' },
        { date: '12/19/2024', time: '7:00', ampm: 'PM', room: 'C' },
        { date: '12/20/2024', time: '6:45', ampm: 'PM', room: 'B' },
      ],
    },
  },
  {
    id: 4,
    title: 'Godzilla',
    date: '12/22/2024',
    time: '9:15PM',
    _meta: {
      showtimes: [
        { date: '12/22/2024', time: '9:15', ampm: 'PM', room: 'A' },
        { date: '12/23/2024', time: '9:30', ampm: 'PM', room: 'B' },
      ],
    },
  },
  {
    id: 5,
    title: 'Superman',
    date: '12/16/2024',
    time: '7:00PM',
    _meta: {
      showtimes: [
        { date: '12/16/2024', time: '7:00', ampm: 'PM', room: 'A' },
        { date: '12/17/2024', time: '7:15', ampm: 'PM', room: 'B' },
        { date: '12/18/2024', time: '7:00', ampm: 'PM', room: 'C' },
      ],
    },
  },
  {
    id: 6,
    title: 'Tron',
    date: '12/19/2024',
    time: '8:30PM',
    _meta: {
      showtimes: [
        { date: '12/19/2024', time: '8:30', ampm: 'PM', room: 'B' },
        { date: '12/20/2024', time: '8:45', ampm: 'PM', room: 'C' },
      ],
    },
  },
  {
    id: 7,
    title: 'The Conjuring',
    date: '12/21/2024',
    time: '10:00PM',
    _meta: {
      showtimes: [
        { date: '12/21/2024', time: '10:00', ampm: 'PM', room: 'A' },
        { date: '12/22/2024', time: '10:15', ampm: 'PM', room: 'B' },
      ],
    },
  },
  {
    id: 8,
    title: 'Demon Slayer',
    date: '12/17/2024',
    time: '6:30PM',
    _meta: {
      showtimes: [
        { date: '12/17/2024', time: '6:30', ampm: 'PM', room: 'C' },
        { date: '12/18/2024', time: '6:45', ampm: 'PM', room: 'A' },
        { date: '12/19/2024', time: '6:30', ampm: 'PM', room: 'B' },
      ],
    },
  },
  {
    id: 9,
    title: 'The Long Walk',
    date: '12/23/2024',
    time: '7:45PM',
    _meta: {
      showtimes: [
        { date: '12/23/2024', time: '7:45', ampm: 'PM', room: 'A' },
        { date: '12/24/2024', time: '8:00', ampm: 'PM', room: 'B' },
        { date: '01/01/2025', time: '7:45', ampm: 'PM', room: 'C' },
      ],
    },
  },
  {
    id: 10,
    title: 'Good Boy',
    date: '12/24/2024',
    time: '5:30PM',
    _meta: {
      showtimes: [
        { date: '12/24/2024', time: '5:30', ampm: 'PM', room: 'C' },
        { date: '12/25/2024', time: '5:45', ampm: 'PM', room: 'A' },
        { date: '01/02/2025', time: '5:30', ampm: 'PM', room: 'B' },
      ],
    },
  },
  {
    id: 11,
    title: 'Downton Abbey',
    date: '12/25/2024',
    time: '4:00PM',
    _meta: {
      showtimes: [
        { date: '12/25/2024', time: '4:00', ampm: 'PM', room: 'B' },
        { date: '12/26/2024', time: '4:15', ampm: 'PM', room: 'C' },
        { date: '01/03/2025', time: '4:00', ampm: 'PM', room: 'A' },
      ],
    },
  },
];

function parseTime(time: string, ampm: string) {
  const [hours, minutes] = time.split(':').map(Number);
  let totalMinutes = hours * 60 + minutes;
  if (ampm === 'PM' && hours !== 12) totalMinutes += 12 * 60;
  if (ampm === 'AM' && hours === 12) totalMinutes -= 12 * 60;
  return totalMinutes;
}

function getAmpmFromTime(time: string): 'AM' | 'PM' {
  if (time.toUpperCase().includes('AM')) {
    return 'AM';
  }
  return 'PM';
}

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState(moviesList);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<AdminMovie | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingMovie, setSchedulingMovie] = useState<Movie | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 10;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedMovies = sessionStorage.getItem('movies');
    if (savedMovies) {
      try {
        const parsedMovies = JSON.parse(savedMovies);
        const baselineById = new Map(moviesList.map(m => [m.id, m]));
        parsedMovies.forEach((savedMovie: Movie) => {
          baselineById.set(savedMovie.id, savedMovie as AdminMovie);
        });
        const merged = Array.from(baselineById.values());
        const savedOnly = parsedMovies.filter((s: Movie) => !moviesList.some(b => b.id === s.id));
        const result = [...merged, ...savedOnly];
        setMovies(result);
      } catch (error) {
        console.log('error parsing movies:', error);
      }
    }
  }, []);

  // delete a movie
  const remove = (movieId: number) => {
    const movieToDelete = movies.find((movie) => movie.id === movieId);
    const hasShowtimes = movieToDelete?._meta?.showtimes && movieToDelete._meta.showtimes.length > 0;
    
    if (hasShowtimes) {
      return;
    }
    
    const updatedMovies = movies.filter((movie) => movie.id !== movieId);
    setMovies(updatedMovies);
    const nonInitialMovies = updatedMovies.filter(
      (movie) => !moviesList.some((initialMovie) => initialMovie.id === movie.id)
    );
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('movies', JSON.stringify(nonInitialMovies));
    }
  };

  const openAddModal = () => {
    setEditingMovie(null);
    setShowModal(true);
  };

  const openEditModal = (movie: Movie) => {
    const existingShowtimes = movie._meta?.showtimes;
    const defaultShowtime = {
      date: movie.date,
      time: movie.time.replace(/\s?(AM|PM)$/i, '').trim(),
      ampm: getAmpmFromTime(movie.time),
    };
    
    setEditingMovie({
      id: movie.id,
      title: movie.title,
      date: movie.date,
      time: movie.time,
      _meta: {
        ...movie._meta,
        showtimes: existingShowtimes || [defaultShowtime],
      },
    });
    setShowModal(true);
  };

  const onMovieSaved = (savedMovie: AdminMovie) => {
    setMovies((prevMovies) => {
      const existingIndex = prevMovies.findIndex((m) => m.id === savedMovie.id);
      let updated: AdminMovie[];
      
      if (existingIndex >= 0) {
        updated = [...prevMovies];
        updated[existingIndex] = savedMovie;
      } else {
        updated = [...prevMovies, savedMovie];
      }
      
      if (typeof window !== 'undefined') {
        const nonInitialMovies = updated.filter(
          (movie) => !moviesList.some((initialMovie) => initialMovie.id === movie.id)
        );
        sessionStorage.setItem('movies', JSON.stringify(nonInitialMovies));
      }
      
      return updated;
    });
  };

  const openScheduleModal = (movie: Movie) => {
    setSchedulingMovie(movie);
    setShowScheduleModal(true);
  };

  const handleSchedule = (date: string, time: string, showRoomId: number) => {
    if (!schedulingMovie) return;

    const timeParts = time.trim().split(/\s+/);
    const timeValue = timeParts[0];
    const ampm = timeParts[1] || 'PM';

    const roomNames: { [key: number]: string } = { 1: 'A', 2: 'B', 3: 'C' };
    const roomName = roomNames[showRoomId] || '';

    const newShowtime = {
      date,
      time: timeValue,
      ampm,
      room: roomName,
    };
    setMovies((prevMovies) => {
      const movieIndex = prevMovies.findIndex((m) => m.id === schedulingMovie.id);
      if (movieIndex === -1) return prevMovies;

      const updatedMovies = [...prevMovies];
      const movie = updatedMovies[movieIndex];
      const existingShowtimes = movie._meta?.showtimes || [
        {
          date: movie.date,
          time: movie.time.replace(/\s?(AM|PM)$/i, '').trim(),
          ampm: getAmpmFromTime(movie.time),
        },
      ];

      const updatedShowtimes = [...existingShowtimes, newShowtime];
      updatedMovies[movieIndex] = {
        ...movie,
        _meta: {
          ...movie._meta,
          showtimes: updatedShowtimes,
        },
      } as AdminMovie;
      if (typeof window !== 'undefined') {
        const nonInitialMovies = updatedMovies.filter(
          (movie) => !moviesList.some((initialMovie) => initialMovie.id === movie.id)
        );
        sessionStorage.setItem('movies', JSON.stringify(nonInitialMovies));
      }

      return updatedMovies;
    });
  };

  const totalPages = Math.ceil(movies.length / moviesPerPage);
  const startIndex = (currentPage - 1) * moviesPerPage;
  const endIndex = startIndex + moviesPerPage;
  const paginatedMovies = movies.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="text-white pb-16" style={{ backgroundColor: '#1C1C1C', minHeight: '100vh' }}>
      <AdminNavBar />
      <div style={{ height: '120px' }} />

      {/* Tabs */}
      <div className="flex items-center justify-center gap-10 text-[30px] font-red-rose mt-2 mb-18">
        <Link href="/admin/movies" className="relative" style={{ color: '#FF478B', fontWeight: 'bold' }}>
          Manage Movies
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-acm-pink rounded-full" />
        </Link>
        <Link
          href="/admin/pricing"
          className="text-gray-300 hover:text-white transition-colors"
          style={{ fontWeight: 'bold' }}
        >
          Manage Promotions
        </Link>
        <Link
          href="/admin/users"
          className="text-gray-300 hover:text-white transition-colors"
          style={{ fontWeight: 'bold' }}
        >
          Manage Users
        </Link>
      </div>

      {/* Search Bar */}
      <div className="max-w-[65rem] mx-auto mb-4 px-4 flex justify-center">
        <div className="relative max-w-md w-full">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/10 backdrop-blur-md border border-white/30 text-white/30 placeholder-white/30 px-3 py-1.5 sm:px-4 sm:py-2 pl-8 sm:pl-10 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/30 focus:border-white/30 transition-all text-sm sm:text-base"
          />
          <PiMagnifyingGlass className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white/30 text-2xl pointer-events-none" />
        </div>
      </div>

      {/* List */}
      <div className="relative max-w-[65rem] mx-auto h-[400px]">
        <div
          className="border rounded-md p-4 sm:p-6 relative overflow-y-auto h-full"
          style={{
            borderColor: '#FF478B',
            backgroundColor: '#242424',
            scrollbarWidth: 'thin',
            scrollbarColor: '#9CA3AF #E5E7EB',
          }}
        >
          <ul>
            {paginatedMovies.length === 0 ? (
              <li className="text-center text-white/60 font-afacad py-8">
                {searchQuery ? 'No movies found matching your search.' : 'No movies available.'}
              </li>
            ) : (
              paginatedMovies.map((movie) => {
              const allShowtimes = movie._meta?.showtimes || [
                { date: movie.date, time: movie.time, ampm: getAmpmFromTime(movie.time), room: undefined },
              ];
              const hasShowtimes = movie._meta?.showtimes && movie._meta.showtimes.length > 0;

              if (allShowtimes.length === 0) return null;
              
              const sorted = [...allShowtimes].sort((a, b) => {
                const dateA = new Date(a.date.split('/').reverse().join('-'));
                const dateB = new Date(b.date.split('/').reverse().join('-'));
                
                if (dateA.getTime() !== dateB.getTime()) {
                  return dateA.getTime() - dateB.getTime();
                }
                
                const timeA = parseTime(a.time, a.ampm);
                const timeB = parseTime(b.time, b.ampm);
                return timeA - timeB;
              });
              
              const nextShowtime = sorted[0];
              if (!nextShowtime) return null;

              const deleteButtonTitle = hasShowtimes 
                ? 'Cannot delete movie with scheduled showtimes.' 
                : 'Remove';
              const deleteButtonClassName = hasShowtimes 
                ? 'transition-colors opacity-50' 
                : 'transition-colors hover:text-white cursor-pointer';

              return (
                <li key={movie.id} className="flex items-center py-3 sm:py-4">
                  <div className="flex-1 text-gray-200 font-afacad px-25 min-h-[1.5rem]">
                    {movie.title}
                  </div>
                  <div
                    className="absolute left-1/2 transform -translate-x-1/2 text-gray-300 hidden sm:block font-afacad"
                    style={{ textAlign: 'center' }}
                  >
                    {nextShowtime.date} {nextShowtime.time} {nextShowtime.ampm}
                    {nextShowtime.room && ` - Room ${nextShowtime.room}`}
                  </div>
                  <div className="flex items-center gap-3 text-gray-300 px-25 ml-auto min-w-[4rem]">
                    <button
                      title="Schedule showtime"
                      className="hover:text-white transition-colors text-sm font-afacad px-3 py-1 rounded border border-white/30 hover:bg-white/10"
                      onClick={() => openScheduleModal(movie)}
                      style={{ background: 'none', cursor: 'pointer' }}
                    >
                      Schedule
                    </button>
                    <button
                      title="Edit movie"
                      className="hover:text-white transition-colors"
                      onClick={() => openEditModal(movie)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      <PiPencilSimple className="text-xl" />
                    </button>
                    <button
                      title={deleteButtonTitle}
                      className={deleteButtonClassName}
                      onClick={() => remove(movie.id)}
                      disabled={hasShowtimes}
                      style={{ background: 'none', border: 'none' }}
                    >
                      <PiX className="text-xl" />
                    </button>
                  </div>
                </li>
              );
            })
            )}
          </ul>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="max-w-[65rem] mx-auto mt-4 px-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={currentPage === 1 
              ? 'px-4 py-2 rounded-md font-afacad transition-colors bg-white/5 text-white/30'
              : 'px-4 py-2 rounded-md font-afacad transition-colors bg-white/10 text-white hover:bg-white/20 cursor-pointer'
            }
            title="Previous page"
          >
            <PiCaretLeft className="text-xl" />
          </button>
          <span className="text-white font-afacad">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={currentPage === totalPages
              ? 'px-4 py-2 rounded-md font-afacad transition-colors bg-white/5 text-white/30'
              : 'px-4 py-2 rounded-md font-afacad transition-colors bg-white/10 text-white hover:bg-white/20 cursor-pointer'
            }
            title="Next page"
          >
            <PiCaretRight className="text-xl" />
          </button>
        </div>
      )}

      {/* Add movie button */}
      <div className="flex justify-center mt-8">
        <button
          type="button"
          title="Add movie"
          onClick={openAddModal}
          className="text-black px-5 py-2 rounded-full transition-colors hover:opacity-90 font-afacad font-bold"
          style={{ background: 'linear-gradient(to right, #FF478B, #FF5C33)' }}
        >
          Add Movie
        </button>
      </div>

      <MovieFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSaved={onMovieSaved}
        initialMovie={editingMovie}
      />

      {schedulingMovie && (
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setSchedulingMovie(null);
          }}
          onSchedule={handleSchedule}
          movieId={schedulingMovie.id}
          movieTitle={schedulingMovie.title}
          existingShowtimes={schedulingMovie._meta?.showtimes || []}
        />
      )}
    </div>
  );
}
