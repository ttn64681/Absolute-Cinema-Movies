'use client';
import Image from 'next/image';
import { useState } from 'react';
import { BackendMovie } from '@/types/movie';
import Spinner from '@/components/common/Spinner';

interface SelectedMovieInfoProps {
  movie: BackendMovie;
}

export default function SelectedMovieInfo({ movie }: SelectedMovieInfoProps) {
  const [imageLoading, setImageLoading] = useState(true);

  // Format duration (in minutes) to hours and minutes
  const formatDuration = (minutes: number): string => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${mins}m`;
  };

  return (
    <div className="w-1/2 h-full relative overflow-hidden rounded-l-3xl">
      {/* Poster with proper containment - blur only applied to poster layer */}
      <div className="w-full h-full relative">
        {/* Loading Spinner */}
        {imageLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-md rounded-l-3xl">
            <Spinner size="xl" color="pink" text="Loading poster..." overlay={false} />
          </div>
        )}

        {/* Poster image with blur only on this layer */}
        <div className="w-full h-full relative backdrop-blur-sm">
          <Image
            src={movie.poster_link}
            alt={movie.title}
            className="object-cover rounded-l-3xl"
            fill
            sizes="45vw"
            onLoad={() => setImageLoading(false)}
            onError={() => setImageLoading(false)}
          />
        </div>

        {/* Darker gradient overlay - darker at bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent rounded-l-3xl pointer-events-none" />
      </div>

      {/* Content positioned at bottom - No blur applied here */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        {/* Movie Title, Rating, Release Date, Score, Duration - Compact */}
        <div className="mb-4">
          <h2 className="text-3xl font-bold text-white leading-tight mb-2">{movie.title || 'No Title'}</h2>
          <div className="flex items-center gap-4 text-lg text-white/90 flex-wrap">
            <span>{movie.rating ? `Rated ${movie.rating}` : 'No Rating'}</span>
            <span>{movie.release_date || 'No Date'}</span>
            {movie.score > 0 && (
              <span className="flex items-center gap-1">
                <span className="text-acm-pink">★</span>
                <span>{movie.score}/100</span>
              </span>
            )}
            {movie.duration && <span>{formatDuration(movie.duration)}</span>}
          </div>
        </div>

        {/* Genre Bubbles - Compact */}
        <div className="flex flex-wrap gap-2 mb-4">
          {movie.genres.split(', ').map((genre, index) => (
            <span key={index} className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white">
              {genre}
            </span>
          ))}
        </div>

        {/* Description - Limited height, no scroll */}
        <div className="text-sm text-white/90 leading-relaxed">
          <p className="line-clamp-4">{movie.synopsis}</p>
        </div>
      </div>
    </div>
  );
}
