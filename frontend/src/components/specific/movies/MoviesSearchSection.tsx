import Image from 'next/image';
import { PiMagnifyingGlass } from 'react-icons/pi';
import { IoFilterOutline } from 'react-icons/io5';
import { useFilters } from '@/contexts/FiltersContext';

interface MoviesSearchSectionProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

export default function MoviesSearchSection({
  searchQuery,
  setSearchQuery,
  onSearch,
  onKeyPress,
}: MoviesSearchSectionProps) {
  // Get global filter state from context
  const { setIsFiltersOpen } = useFilters();
  return (
    <div className="w-screen h-[60vh] relative flex flex-col items-center gap-8 py-36 overflow-hidden">
      <Image
        src="/search_background.jpg"
        alt="Search background"
        fill
        sizes="100vw"
        className="object-cover z-0"
        priority
      />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/60 to-[#0a0a0a] z-10" />
      <h2 className="text-7xl font-pacifico font-regular z-10">Movies</h2>
      <div className="flex flex-row items-center z-10 w-1/2">
        <button
          type="button"
          onClick={onSearch}
          className="mr-3 p-2 cursor-pointer text-white rounded-md transition-colors duration-200"
          title="Search movies"
        >
          <PiMagnifyingGlass className="text-white text-4xl" />
        </button>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={onKeyPress}
            className="w-full p-3 pl-4 text-lg border duration-200 border-white/30 hover:border-white/60 focus:border-white outline-none rounded-md backdrop-blur-sm backdrop-brightness-125 bg-white/10 text-white placeholder-white/70 cursor-text"
          />
        </div>
        <button title="Filter" type="button" className="ml-5 cursor-pointer" onClick={() => setIsFiltersOpen(true)}>
          <IoFilterOutline className="text-white text-4xl hover:text-acm-pink hover:scale-105 transition-all" />
        </button>
      </div>
    </div>
  );
}
