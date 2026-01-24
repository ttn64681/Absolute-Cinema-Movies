import MovieCardsGrid from '@/components/common/movies/MovieCardsGrid';
import WhiteSeparator from '@/components/common/WhiteSeparator';
import { MovieSummary } from '@/types/movie';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

interface MovieSectionProps {
  title: string;
  movies: MovieSummary[];
  isLoading: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  goToNextPage?: () => void;
  goToPreviousPage?: () => void;
  goToPage?: (page: number) => void;
}

export default function MovieSection({
  title,
  movies,
  isLoading,
  pagination,
  goToNextPage,
  goToPreviousPage,
  goToPage,
}: MovieSectionProps) {
  // Always show arrows if pagination props are provided
  const showArrows = pagination && goToNextPage && goToPreviousPage && goToPage;
  // Only show dots if there are multiple pages
  const showDots = pagination && pagination.totalPages > 1;

  return (
    <div className="w-screen relative px-16">
      <h2 className="text-4xl font-extrabold font-red-rose text-acm-pink mb-4">{title}</h2>
      <WhiteSeparator />
      {showArrows ? (
        <div className="flex items-center gap-4 my-4">
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

          <div className="flex-1">
            <MovieCardsGrid movies={movies} isLoading={isLoading} />
          </div>

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
      ) : (
        <MovieCardsGrid movies={movies} isLoading={isLoading} />
      )}

      {!isLoading && showDots && pagination && goToPage && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              title={`Go to page ${i + 1}`}
              onClick={() => goToPage(i)}
              className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
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
