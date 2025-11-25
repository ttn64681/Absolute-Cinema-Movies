import MovieCardsGrid from '@/components/common/movies/MovieCardsGrid';
import { MovieSummary } from '@/types/movie';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

interface MovieTabsSectionProps {
  movies: MovieSummary[];
  sampleMovies: MovieSummary[];
  activeTab: 'nowplaying' | 'upcoming';
  setActiveTab: (tab: 'nowplaying' | 'upcoming') => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  goToPage: (page: number) => void;
}

export default function MovieTabsSection({
  movies,
  sampleMovies,
  activeTab,
  setActiveTab,
  pagination,
  goToNextPage,
  goToPreviousPage,
  goToPage,
}: MovieTabsSectionProps) {
  // TabButton component - setActiveTab function comes from parent
  // This function is stable thanks to useCallback in the parent component
  const TabButton = ({ tab, label }: { tab: 'nowplaying' | 'upcoming'; label: string }) => (
    <div className="flex flex-col items-center">
      <button
        title={label}
        type="button"
        className={`text-4xl font-extrabold font-red-rose ${activeTab === tab ? 'text-acm-pink' : 'text-white'} mb-2 hover:cursor-pointer`}
        onClick={() => setActiveTab(tab)}
      >
        {label}
      </button>
      {activeTab === tab && <div className="h-[4px] bg-acm-pink rounded-full w-1/4" />}
    </div>
  );

  return (
    <div className="p-16">
      <div className="flex flex-row gap-x-6">
        <TabButton tab="nowplaying" label="Now Playing" />
        <TabButton tab="upcoming" label="Upcoming" />
      </div>

      {/* Navigation controls outside the grid */}
      <div className="flex items-center gap-4 my-4">
        {/* Left navigation button */}
        <button
          type="button"
          onClick={goToPreviousPage}
          disabled={!pagination.hasPrevious}
          className={`transition-all duration-200 transform ${
            pagination.hasPrevious ? 'hover:scale-110 cursor-pointer' : 'opacity-30 cursor-not-allowed'
          }`}
          aria-label="Previous page"
        >
          <div className={`w-16 h-16 ${pagination.hasPrevious ? 'text-acm-pink' : 'text-white/30'}`}>
            <IoChevronBack className="w-full h-full" />
          </div>
        </button>

        {/* Movie cards grid */}
        <div className="flex-1">
          <MovieCardsGrid movies={movies.length > 0 ? movies : sampleMovies} />
        </div>

        {/* Right navigation button */}
        <button
          type="button"
          onClick={goToNextPage}
          disabled={!pagination.hasNext}
          className={`transition-all duration-200 transform ${
            pagination.hasNext ? 'hover:scale-110 cursor-pointer' : 'opacity-30 cursor-not-allowed'
          }`}
          aria-label="Next page"
        >
          <div className={`w-16 h-16 ${pagination.hasNext ? 'text-acm-pink' : 'text-white/30'}`}>
            <IoChevronForward className="w-full h-full" />
          </div>
        </button>
      </div>

      {/* Pagination dots */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToPage(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === pagination.currentPage ? 'bg-acm-pink w-8' : 'bg-gray-600 hover:bg-gray-500'
              }`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
