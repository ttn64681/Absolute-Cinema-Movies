import Link from 'next/link';
import { BackendMovie } from '@/types/movie';
import { RxDoubleArrowRight } from 'react-icons/rx';

interface SelectedMovieBookButtonProps {
  selectedShowtime: string;
  movie: BackendMovie;
  currentDate: string;
}

export default function SelectedMovieBookButton({
  selectedShowtime,
  movie,
  currentDate,
}: SelectedMovieBookButtonProps) {
  return (
    <>
      {/* Book Tickets Section */}
      <div className="mt-auto pt-6 border-t border-white/10">
        {selectedShowtime ? (
          <Link
            href={`/booking?movieId=${encodeURIComponent(movie.movie_id ?? '')}&title=${encodeURIComponent(movie.title ?? '')}&time=${encodeURIComponent(selectedShowtime ?? '')}&date=${encodeURIComponent(currentDate ?? '')}`}
          >
            <button
              title="Book Tickets"
              type="button"
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-acm-pink to-red-500 hover:from-red-600 hover:to-pink-600 transition-all duration-300 rounded-2xl text-white font-bold text-lg transform hover:scale-105 shadow-lg shadow-acm-pink/25 drop-shadow-lg cursor-pointer"
            >
              <span>BOOK TICKETS</span>
              <RxDoubleArrowRight className="text-xl" />
            </button>
          </Link>
        ) : (
          <button
            type="button"
            title="Book Tickets (Select a showtime)"
            disabled
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gray-700/50 rounded-2xl text-white/40 font-bold text-lg cursor-not-allowed border border-gray-600/50"
          >
            <span>SELECT SHOWTIME</span>
            <RxDoubleArrowRight className="text-xl" />
          </button>
        )}
      </div>
    </>
  );
}
