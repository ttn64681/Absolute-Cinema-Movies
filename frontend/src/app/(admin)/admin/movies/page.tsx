'use client';

import Link from 'next/link';
import { PiPencilSimple, PiX } from 'react-icons/pi';
import { useState, useEffect } from 'react';
import AdminNavBar from '@/components/common/navBar/AdminNavBar';
import { Movie } from '@/types/admin';
import MovieFormModal, { AdminMovie } from '@/components/specific/admin/MovieFormModal';

// hardcoded movies for now
const moviesList: Movie[] = [
  { id: 1, title: 'Oldboy', date: '12/15/2025', time: '7:30PM' },
  { id: 2, title: 'Him', date: '12/20/2025', time: '8:00PM' },
  { id: 3, title: 'Beauty and the Beast', date: '12/18/2024', time: '6:45PM' },
  { id: 4, title: 'Godzilla', date: '12/22/2025', time: '9:15PM' },
  { id: 5, title: 'Superman', date: '12/16/2025', time: '7:00PM' },
  { id: 6, title: 'Tron', date: '12/19/2025', time: '8:30PM' },
  { id: 7, title: 'The Conjuring', date: '12/21/2025', time: '10:00PM' },
  { id: 8, title: 'Demon Slayer', date: '12/17/2025', time: '6:30PM' },
  { id: 9, title: 'The Long Walk', date: '12/23/2025', time: '7:45PM' },
  { id: 10, title: 'Good Boy', date: '12/24/2025', time: '5:30PM' },
  { id: 11, title: 'Downton Abbey', date: '12/25/2025', time: '4:00PM' },
];

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState(moviesList);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState<AdminMovie | null>(null);

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
      ampm: movie.time.toUpperCase().includes('AM') ? 'AM' : 'PM',
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
        // Update existing movie
        updated = [...prevMovies];
        updated[existingIndex] = savedMovie;
      } else {
        // Add new movie
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

  return (
    <div className="text-white" style={{ backgroundColor: '#1C1C1C', minHeight: '100vh' }}>
      <AdminNavBar />
      <div style={{ height: '120px' }} />

      {/* Tabs */}
      <div className="flex items-center justify-center gap-10 text-[30px] font-red-rose mt-2 mb-18">
        <Link href="/admin/movies" className="relative" style={{ color: '#FF478B', fontWeight: 'bold' }}>
          Movies & Showtimes
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-acm-pink rounded-full" />
        </Link>
        <Link
          href="/admin/pricing"
          className="text-gray-300 hover:text-white transition-colors"
          style={{ fontWeight: 'bold' }}
        >
          Pricing & Promotions
        </Link>
        <Link
          href="/admin/users"
          className="text-gray-300 hover:text-white transition-colors"
          style={{ fontWeight: 'bold' }}
        >
          Users & Admins
        </Link>
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
            {movies.flatMap((movie) => {
              // get showtimes or use default
              const showtimes = movie._meta?.showtimes || [
                { date: movie.date, time: movie.time, ampm: movie.time.includes('AM') ? 'AM' : 'PM' },
              ];

              return showtimes.map((showtime, showtimeIndex) => {
                const isFirst = showtimeIndex === 0;

                return (
                  <li key={`${movie.id}-${showtimeIndex}`} className="flex items-center py-3 sm:py-4">
                    <div className="flex-1 text-gray-200 font-afacad px-25 min-h-[1.5rem]">
                      {isFirst ? movie.title : ''}
                    </div>
                    <div
                      className="absolute left-1/2 transform -translate-x-1/2 text-gray-300 hidden sm:block font-afacad"
                      style={{ textAlign: 'center' }}
                    >
                      {showtime.date} {showtime.time} {showtime.ampm}
                    </div>
                    <div className="flex items-center gap-3 text-gray-300 px-25 ml-auto min-w-[4rem]">
                      {isFirst && (
                        <>
                          <button
                            title="Edit movie"
                            className="hover:text-white transition-colors"
                            onClick={() => openEditModal(movie)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <PiPencilSimple className="text-xl" />
                          </button>
                          <button
                            title="Remove"
                            className="hover:text-white transition-colors"
                            onClick={() => remove(movie.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <PiX className="text-xl" />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                );
              });
            })}
          </ul>
        </div>
      </div>

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
    </div>
  );
}
