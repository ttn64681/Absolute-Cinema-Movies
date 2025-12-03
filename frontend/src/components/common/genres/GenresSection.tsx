import React from 'react';
import Genre from './Genre';
import SkeletonBlock from '@/components/common/skeletons/SkeletonBlock';
import WhiteSeparator from '@/components/common/WhiteSeparator';

interface GenresSectionProps {
  genres: string[];
  isLoading?: boolean;
}

export default function GenresSection({ genres, isLoading = false }: GenresSectionProps) {
  return (
    <>
      <div className="text-4xl font-extrabold font-red-rose text-white mb-2 px-20">Genres</div>
      <div className="relative">
        <div className="flex flex-row overflow-x-scroll scrollbar-hide py-4 gap-x-4 px-28">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonBlock key={idx} className="relative w-64 h-32 rounded-lg" />
            ))
          ) : genres.length > 0 ? (
            genres.map((genreName, index) => <Genre key={`${genreName}-${index}`} text={genreName} />)
          ) : (
            <div className="text-white/60 text-lg px-4 py-8">No genres available</div>
          )}
        </div>
        <div className="pointer-events-none absolute top-0 left-0 h-full w-1/3 bg-linear-to-r from-[#0a0a0a] to-transparent z-20 duration-200" />
        <div className="pointer-events-none absolute top-0 right-0 h-full w-1/3 bg-linear-to-l from-[#0a0a0a] to-transparent z-20" />
      </div>

      <div className="px-16 opacity-30 my-8">
        <WhiteSeparator />
      </div>
    </>
  );
}
