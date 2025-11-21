import { BackendMovie } from '@/types/movie';

interface SelectedMovieCreditsProps {
  movie: BackendMovie;
}

/**
 * Movie Credits Component
 * 
 * Displays cast, directors, and producers from full Movie entity.
 * Note: MovieSummary (from browsing) doesn't include these fields,
 * they're loaded via Virtual Proxy when user clicks on movie.
 */
export default function SelectedMovieCredits({ movie }: SelectedMovieCreditsProps) {
  // Parse cast, producer, director from full movie data
  const cast = movie.cast_names ? movie.cast_names.split(', ') : [];
  const producers = movie.producers || '';
  const directors = movie.directors || '';

  // If no credits data available yet (MovieSummary, not full Movie)
  if (!movie.cast_names && !movie.producers && !movie.directors) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 bg-gradient-to-b from-acm-pink to-red-500 rounded-full"></div>
          <h3 className="text-white font-bold text-xl">Credits</h3>
        </div>
        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <p className="text-white/60 text-sm italic">Loading cast and crew information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 bg-gradient-to-b from-acm-pink to-red-500 rounded-full"></div>
        <h3 className="text-white font-bold text-xl">Credits</h3>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Directors */}
        {directors && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <h4 className="text-acm-pink font-semibold text-sm mb-2 uppercase tracking-wide">Directors</h4>
            <p className="text-white/90 text-sm leading-relaxed">{directors}</p>
          </div>
        )}

        {/* Producers */}
        {producers && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <h4 className="text-acm-pink font-semibold text-sm mb-2 uppercase tracking-wide">Producers</h4>
            <p className="text-white/90 text-sm leading-relaxed">{producers}</p>
          </div>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <h4 className="text-acm-pink font-semibold text-sm mb-2 uppercase tracking-wide">Cast</h4>
            <p className="text-white/90 text-sm leading-relaxed">{cast.join(', ')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
