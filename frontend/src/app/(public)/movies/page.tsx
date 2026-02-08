'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import NavBar from '@/components/common/navBar/NavBar';
import MoviesSearchSection from '@/components/specific/movies/MoviesSearchSection';
import MovieSection from '@/components/specific/movies/MovieSection';
import { useMovieSearch } from '@/hooks/useMovieSearch';
import { useSearchLogic } from '@/hooks/useSearchLogic';

const Footer = dynamic(() => import('@/components/common/Footer'), {
  loading: () => <div className="h-32 bg-black" />,
});

function MoviesPageContent() {
  // Custom hooks for clean separation of concerns
  const { searchQuery, setSearchQuery, handleSearch, handleKeyPress } = useSearchLogic();

  const {
    nowPlayingMovies,
    upcomingMovies,
    isLoadingNowPlaying,
    isLoadingUpcoming,
    nowPlayingPagination,
    upcomingPagination,
    goToNextPageNowPlaying,
    goToPreviousPageNowPlaying,
    goToPageNowPlaying,
    goToNextPageUpcoming,
    goToPreviousPageUpcoming,
    goToPageUpcoming,
  } = useMovieSearch();

  return (
    <div className="overflow-x-hidden min-w-0">
      <NavBar />

      {/* Filters Popup is rendered globally via FiltersContext Portal */}

      <MoviesSearchSection
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={handleSearch}
        onKeyPress={handleKeyPress}
      />

      <MovieSection
        title="Now Playing"
        movies={nowPlayingMovies}
        isLoading={isLoadingNowPlaying}
        pagination={nowPlayingPagination}
        goToNextPage={goToNextPageNowPlaying}
        goToPreviousPage={goToPreviousPageNowPlaying}
        goToPage={goToPageNowPlaying}
      />

      <MovieSection
        title="Upcoming"
        movies={upcomingMovies}
        isLoading={isLoadingUpcoming}
        pagination={upcomingPagination}
        goToNextPage={goToNextPageUpcoming}
        goToPreviousPage={goToPreviousPageUpcoming}
        goToPage={goToPageUpcoming}
      />

      <Footer />
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <MoviesPageContent />
    </Suspense>
  );
}
