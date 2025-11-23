'use client';

import Link from 'next/link';
import { PiPencilSimple, PiX, PiMagnifyingGlass, PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import { useState, useEffect } from 'react';
import AdminNavBar from '@/components/common/navBar/AdminNavBar';
import { Movie } from '@/types/admin';
import MovieFormModal, { AdminMovie } from '@/components/specific/admin/EditMovieFormModal';
import ScheduleModal from '@/components/specific/admin/ScheduleModal';

import { useAdminMovies } from '@/hooks/useAdminMovies';


interface MoviesListProps {
    movies: AdminMovie[];
    setMovies: (savedMovie: AdminMovie[]) => void;
}

export default function MoviesList({ movies, setMovies, }: MoviesListProps) {

    // Delete movie function
    const remove = (movie_id: number) => {
        const movieToDelete = movies.find((movie) => movie.movie_id === movie_id);
        const hasShowtimes = movieToDelete?._meta?.showtimes && movieToDelete._meta.showtimes.length > 0;
        
        if (hasShowtimes) {
        return;
        }
        
        const updatedMovies = movies.filter((movie) => movie.movie_id !== movie_id);
        setMovies(updatedMovies);
        const nonInitialMovies = updatedMovies.filter(
        (movie) => !moviesList.some((initialMovie) => initialMovie.movie_id === movie.movie_id)
        );
        if (typeof window !== 'undefined') {
        sessionStorage.setItem('movies', JSON.stringify(nonInitialMovies));
        }
    };

    // Function to open add movie menu
    const openAddModal = () => {
        setEditingMovie(null);
        setShowModal(true);
    };

    // Function to open edit movie menu
    const openEditModal = (movie: Movie) => {
        /*const existingShowtimes = movie._meta?.showtimes;
        const defaultShowtime = {
        date: movie.date || '',
        time: movie.time.replace(/\s?(AM|PM)$/i, '').trim() || '',
        ampm: /*getAmpmFromTime(movie.time) || 'AM',
        };*/
        
        setEditingMovie({
        movie_id: movie.movie_id,
        title: movie.title,
        date: movie.date || '',
        time: movie.time || '',
        _meta: {
            ...movie._meta,
            showtimes: movie._meta?.showtimes || [{ date: '', time: '', ampm: 'AM', room: undefined }],
        },
        });
        setShowModal(true);
    };

    // Function to update movies list with a new or edited movie
    const onMovieSaved = (savedMovie: AdminMovie) => {
        setMovies((prevMovies) => {
        const existingIndex = prevMovies.findIndex((m) => m.movie_id === savedMovie.movie_id);
        let updated: AdminMovie[];
        
        if (existingIndex >= 0) {
            updated = [...prevMovies];
            updated[existingIndex] = savedMovie;
        } else {
            updated = [...prevMovies, savedMovie];
        }
        
        if (typeof window !== 'undefined') {
            const nonInitialMovies = updated.filter(
            (movie) => !moviesList.some((initialMovie) => initialMovie.movie_id === movie.movie_id)
            );
            sessionStorage.setItem('movies', JSON.stringify(nonInitialMovies));
        }
        
        return updated;
        });
    };

    // Function to open menu for scheduling movie shows
    const openScheduleModal = (movie: Movie) => {
        setSchedulingMovie(movie);
        setShowScheduleModal(true);
    };

    // Add and save a new movie show
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
        const movieIndex = prevMovies.findIndex((m) => m.movie_id === schedulingMovie.movie_id);
        if (movieIndex === -1) return prevMovies;

        const updatedMovies = [...prevMovies];
        const movie = updatedMovies[movieIndex];
        const existingShowtimes = movie._meta?.showtimes || [
            {
            date: movie.date || '',
            time: movie.time.replace(/\s?(AM|PM)$/i, '').trim() || '',
            ampm: /*getAmpmFromTime(movie.time) ||*/ 'AM',
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
            (movie) => !moviesList.some((initialMovie) => initialMovie.movie_id === movie.movie_id)
            );
            sessionStorage.setItem('movies', JSON.stringify(nonInitialMovies));
        }

        return updatedMovies;
        });
    };

    const totalPages = Math.ceil(movies.length / moviesPerPage);
    const startIndex = 0;
    const endIndex = moviesPerPage;
    const paginatedMovies = movies.slice(startIndex, endIndex);
    console.log(startIndex, endIndex);

    const goToPage = (page: number) => {
        if (page >= 0 && page <= totalPages) {
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
                    { date: movie.date, time: movie.time, ampm: /*getAmpmFromTime(movie.time) ||*/ 'AM', room: undefined },
                ];
                const hasShowtimes = movie._meta?.showtimes && movie._meta.showtimes.length > 0;

                if (allShowtimes.length === 0) return null;
                
                const sorted = [...allShowtimes].sort((a, b) => {
                    const dateA = new Date(a.date.split('/').reverse().join('-'));
                    const dateB = new Date(b.date.split('/').reverse().join('-'));
                    
                    if (dateA.getTime() !== dateB.getTime()) {
                    return dateA.getTime() - dateB.getTime();
                    }
                    
                    const timeA = parseTime(a.time, a.ampm) || 50;
                    const timeB = parseTime(b.time, b.ampm) || 30;
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
                    <li key={movie.movie_id} className="flex items-center py-3 sm:py-4">
                    <div className="flex-1 text-gray-200 font-afacad px-25 min-h-[1.5rem]">
                        {movie.title}
                    </div>
                    <div
                        className="absolute left-1/2 transform -translate-x-1/2 text-gray-300 hmovie_idden sm:block font-afacad"
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
                        onClick={() => remove(movie.movie_id)}
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

        {(
            <div className="max-w-[65rem] mx-auto mt-4 px-4 flex items-center justify-center gap-4">
            <button
                type="button"
                onClick={() => goToPreviousPage()}
                disabled={!pagination.hasPrevious}
                className={!pagination.hasPrevious 
                ? 'px-4 py-2 rounded-md font-afacad transition-colors bg-white/5 text-white/30'
                : 'px-4 py-2 rounded-md font-afacad transition-colors bg-white/10 text-white hover:bg-white/20 cursor-pointer'
                }
                title="Previous page"
            >
                <PiCaretLeft className="text-xl" />
            </button>
            <span className="text-white font-afacad">
                Page {pagination.currentPage+1}
            </span>
            <button
                type="button"
                onClick={() => goToNextPage()}
                disabled={!pagination.hasNext}
                className={!pagination.hasNext
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
            movieId={schedulingMovie.movie_id}
            movieTitle={schedulingMovie.title}
            existingShowtimes={schedulingMovie._meta?.showtimes || []}
            />
        )}
        </div>
    );
}