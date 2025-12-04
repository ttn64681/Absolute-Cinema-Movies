'use client';

import Link from 'next/link';
import { PiPencilSimple, PiX, PiMagnifyingGlass, PiCaretLeft, PiCaretRight } from 'react-icons/pi';
import { useState, useEffect } from 'react';
import AdminNavBar from '@/components/common/navBar/AdminNavBar';
import { Movie } from '@/types/admin';
import EditMovieFormModal, { AdminMovie } from '@/components/specific/admin/EditMovieFormModal';
import AddMovieFormModal from '@/components/specific/admin/AddMovieFormModal';
import ScheduleModal from '@/components/specific/admin/ScheduleModal';

import { useAdminMoviesList } from '@/hooks/useAdminMoviesList';
import { useAdminMovie } from '@/hooks/useAdminMovie';

export default function AdminMoviesPage() {

  // Paged movies and pagination controls from useAdminMovies hook
  const {
    adminMovies,
    isLoading,
    pagination,
    goToNextPage,
    goToPreviousPage,
    goToThisPage,
  } = useAdminMoviesList();

  const { deleteMovie } = useAdminMovie(0);

  // Use adminMovies if available; otherwise, fall back to fallbackMoviesList
  const moviesList = adminMovies && adminMovies.length > 0 ? adminMovies : [];
  /*console.log(moviesList);
  console.log(pagination.currentPage);
  console.log("HasPreviousPage is " + pagination.hasNext );
  console.log("HasNextPage is " + pagination.hasNext );*/


  const [movies, setMovies] = useState(moviesList); // movies list
  const [showAddModal, setShowAddModal] = useState(false); // add movie popup visibility
  const [showEditModal, setShowEditModal] = useState(false); // edit movie popup visibility
  const [editingMovieId, setEditingMovieId] = useState(0); // movie currently being edited, if any
  const [showScheduleModal, setShowScheduleModal] = useState(false); // schedule movie show popup visibility
  const [schedulingMovie, setSchedulingMovie] = useState<Movie | null>(null); // movie currently being scheduled
  const [searchQuery, setSearchQuery] = useState(''); // user input for searching movies
  const [currentPage, setCurrentPage] = useState(1); // current page of movies to show
  const moviesPerPage = 10; // # of movies to display on one page

  

  // Update movies list whenever movies from backend change
  useEffect(() => {
    if (typeof window === 'undefined') return;
      setMovies(adminMovies && adminMovies.length > 0 ? adminMovies : []);
  }, [adminMovies]);

  // Delete movie function
  const remove = async (movie_id: number) => {
    const movieToDelete = movies.find((movie) => movie.movie_id === movie_id);
    const deleteMovieStatus = movieToDelete?.status;
    
    if (deleteMovieStatus == 'now_playing') {
      return;
    }

    if (movie_id) {
      await deleteMovie(movie_id);
    } 
    
    const updatedMovies = movies.filter((movie) => movie.movie_id !== movie_id);
    setMovies(updatedMovies);
  };

  // Function to open add movie menu
  const openAddModal = () => {
    setShowAddModal(true);
  };

  // Function to open edit movie menu
  const openEditModal = (movieId: number) => {
    // console.log("Movie ID passed in: " + movieId);
    setEditingMovieId(movieId);
    setShowEditModal(true);
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
      return updated;
    });
  };

  // Function to update the movie's status when an upcoming movie gets scheduled
  const updateMovieStatus = (movieId: number) => {
    setMovies((prevMovies) => {
      const index = prevMovies.findIndex((m) => m.movie_id === movieId);
      const scheduledMovie = prevMovies[index];

      let updated: AdminMovie[];
      updated = [...prevMovies];

      if (scheduledMovie) {
        scheduledMovie.status = "now_playing";
        updated[index] = scheduledMovie;
      } 
      return updated;
    });
  }

  // Function to open menu for scheduling movie shows
  const openScheduleModal = (movie: Movie) => {
    setSchedulingMovie(movie);
    setShowScheduleModal(true);
  };

  const totalPages = Math.ceil(movies.length / moviesPerPage);
  const startIndex = 0;
  const endIndex = moviesPerPage;
  const paginatedMovies = movies.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getStatusLabel = (status: String) => {
    if (status == "now_playing") {
      return "Now Playing";
    } else {
      return "Upcoming";
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

      {/* List of Movies Container */}
      <div className="relative max-w-[80rem] mx-auto min-h">
          
          {/* Labels */}
          <li className="flex items-center py-3 sm:py-4">

            <div className="flex-1 text-gray-200 font-afacad px-25 min-h-[1.5rem] text-xl"
              style={{textAlign: 'center', color: '#FF478B', }}
            >
              Movie
            </div>
            <div
              className="flex-1 text-gray-200 font-afacad px-25 min-h-[1.5rem] text-xl"
              style={{ textAlign: 'center', color: '#FF478B', }}
            >
              Movie Status
            </div>
            <div
              className="flex-1 text-gray-200 font-afacad px-25 min-h-[1.5rem] text-xl"
              style={{textAlign: 'center', color: '#FF478B', }}
            >
              Controls
            </div>

          </li>
          
        <div
          className="border rounded-md p-4 sm:p-6 relative overflow-y-auto h-full"
          style={{
            borderColor: '#FF478B',
            backgroundColor: '#242424',
            scrollbarWidth: 'thin',
            scrollbarColor: '#9CA3AF #E5E7EB',
          }}
        >

          {/* Movies List */}
          <ul className="h-[400px]">
            {paginatedMovies.length === 0 ? (
              <li className="text-center text-white/60 font-afacad py-8">
                {searchQuery ? 'No movies found matching your search.' : 'Loading movies...'}
              </li>
            ) : (
              paginatedMovies.map((movie) => {
              
              const hasShowtimes = movie.status == "now_playing";

              const deleteButtonTitle = (hasShowtimes)
                ? 'Cannot delete movie with scheduled showtimes.' 
                : 'Remove';
              const deleteButtonClassName = (hasShowtimes) 
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
                    {getStatusLabel(movie.status)}
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
                      onClick={() => openEditModal(movie.movie_id)}
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

      <EditMovieFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSaved={onMovieSaved}
        initialMovieId={editingMovieId}
      />

      <AddMovieFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSaved={onMovieSaved}
      />

      {schedulingMovie && (
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setSchedulingMovie(null);
          }}
          movieId={schedulingMovie.movie_id}
          movieTitle={schedulingMovie.title}
          onSchedule={updateMovieStatus}
        />
      )}
    </div>
  );
}
