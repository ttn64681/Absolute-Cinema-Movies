import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import SelectedMovie from './selectedMovie/SelectedMovie';
import TrailerEmbed from './TrailerEmbed';
import { MovieSummary, BackendMovie } from '@/types/movie';
import { IoPlay } from 'react-icons/io5';

interface MovieCardProps {
  movie: MovieSummary;
}

export default function MovieCard({ movie }: MovieCardProps) {
  // SelectedMovie accepts MovieSummary and fetches full details via Virtual Proxy
  const [selectedMovie, setSelectedMovie] = useState<MovieSummary | null>(null);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // CACHES: Genres array ["Action", "Drama", "Thriller"] - persists across MovieCard re-renders
  // CHANGES: Never (movie.genres is static) - BUT will recreate if MovieCard component unmounts/remounts or movie prop changes
  // WITHOUT useMemo: Array recreated on every MovieCard re-render (hover, click, parent changes)
  // WHY MATTERS: Minimal - string split is fast, mostly unnecessary optimization
  const genresArray = useMemo(() => movie.genres.split(', '), [movie.genres]);

  const handleDetailsPopup = () => {
    setSelectedMovie(movie);
  };

  const handleClose = () => {
    setSelectedMovie(null);
  };

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the card click
    setIsTrailerOpen(true);
  };

  return (
    <div className="relative">
      {/* Conditional Movie Details Popup */}
      {selectedMovie && <SelectedMovie movie={selectedMovie} onClose={handleClose} />}

      {/* Trailer Embed Popup */}
      <TrailerEmbed
        name={movie.title}
        trailerUrl={movie.trailer_link}
        isClosed={!isTrailerOpen}
        setIsClosed={(closed) => setIsTrailerOpen(!closed)}
      />

      {/* Movie Card - Clean responsive design */}
      <div
        className="group cursor-pointer bg-white rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 overflow-hidden"
        onClick={handleDetailsPopup}
      >
        {/* Movie Poster Container */}
        <div className="relative aspect-2/3 w-full">
          <Image
            src={movie.poster_link}
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            priority={false} // Lazy load images
            placeholder="blur" // Show blur while loading
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=" // Base64 blur placeholder
          />

          {/* Top Right Badges - Rating and Score */}
          <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end">
            <div className="rounded-full bg-white/90 backdrop-blur-sm px-2 py-1 text-xs font-bold text-gray-800 shadow-sm">
            {movie.rating}
          </div>
            {movie.score > 0 && (
              <div className="rounded-full bg-acm-pink/90 backdrop-blur-sm px-2 py-1 text-xs font-bold text-white shadow-sm flex items-center gap-1">
                <span>★</span>
                <span>{movie.score}/100</span>
              </div>
            )}
          </div>

          {/* Bottom Left Badge - Duration */}
          {movie.duration > 0 && (
            <div className="absolute bottom-3 left-3 z-10 rounded-full bg-black/70 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-white shadow-sm">
              {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 z-0">
            {/* Movie Info - Only show on hover, positioned at top */}
            <div className="absolute inset-0 pt-9 flex flex-col justify-start p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="text-white">
                <h3 className="text-lg font-bold mb-2 line-clamp-2">{movie.title}</h3>
                <p className="text-sm text-white/90 mb-3 line-clamp-2">{movie.synopsis}</p>
                {/* Genres */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1 flex-1 min-w-0">
                    {genresArray.slice(0, 4).map((genre, index) => (
                      <span
                        key={index}
                        className="text-xs bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full flex-shrink-0"
                      >
                        {genre}
                      </span>
                    ))}
                    {genresArray.length > 4 && (
                      <span
                        className="text-xs bg-white/15 backdrop-blur-sm px-2 py-1 rounded-full flex-shrink-0"
                        title={genresArray.slice(4).join(', ')}
                      >
                        +{genresArray.length - 4}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap flex-shrink-0">{movie.release_date}</span>
                </div>
              </div>
            </div>

            {/* Preview Button - Only show on hover, positioned at bottom */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300">
              <button
                onClick={handlePreviewClick}
                className="flex items-center gap-2 bg-acm-pink hover:bg-acm-pink/80 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105"
                title="Preview Trailer"
              >
                <IoPlay className="text-lg" />
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
