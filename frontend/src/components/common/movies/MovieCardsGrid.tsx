import MovieCard from './MovieCard';
import { MovieSummary } from '@/types/movie';

interface MovieCardsGridProps {
  movies: MovieSummary[];
}

// 5 movies per row 
export default function MovieCardsGrid({ movies }: MovieCardsGridProps) {
  return (
    <section className="py-12">
      <div className="w-full">
        {/* Movies Grid - 5 max per row (10 movies = 2 rows) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.movie_id} movie={movie} />
          ))}
        </div>

        {/* Empty State */}
        {movies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/70 text-lg">No movies available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
