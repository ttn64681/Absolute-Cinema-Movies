import MovieCard from './MovieCard';
import SkeletonBlock from '@/components/common/skeletons/SkeletonBlock';
import { MovieSummary } from '@/types/movie';

interface MovieCardsGridProps {
  movies: MovieSummary[];
  isLoading?: boolean;
}

// 5 movies per row
export default function MovieCardsGrid({ movies, isLoading = false }: MovieCardsGridProps) {
  const skeletonItems = Array.from({ length: 10 });
  const showSkeleton = isLoading;

  return (
    <section className="py-12">
      <div className="w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {showSkeleton
            ? skeletonItems.map((_, idx) => <SkeletonBlock key={idx} className="w-full aspect-2/3 rounded-xl" />)
            : movies.map((movie) => <MovieCard key={movie.movie_id} movie={movie} />)}
        </div>

        {!showSkeleton && movies.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/70 text-lg">No movies available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
