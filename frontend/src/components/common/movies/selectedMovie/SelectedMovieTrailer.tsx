import { BackendMovie } from '@/types/movie';

interface SelectedMovieTrailerProps {
  movie: BackendMovie;
}

export default function SelectedMovieTrailer({ movie }: SelectedMovieTrailerProps) {
  const trailer = movie.trailer_link || 'https://youtu.be/xvFZjo5PgG0?si=m8MvlXG6nrugG0nO';

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-6 bg-linear-to-b from-acm-pink to-red-500 rounded-full"></div>
        <h3 className="text-white font-bold text-xl">Watch Trailer</h3>
      </div>
      <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-white/10 hover:border-acm-pink/30 transition-all duration-300 bg-black/50">
        <iframe
          className="w-full h-full"
          src={trailer ? trailer.replace('watch?v=', 'embed/') : 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none"></div>
      </div>
    </div>
  );
}
