'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import NavBar from '@/components/common/navBar/NavBar';
import WhiteSeparator from '@/components/common/WhiteSeparator';
import HeroSection from '@/components/specific/home/HeroSection';
import HeroPromoSection from '@/components/specific/home/HeroPromoSection';
import MovieTabsSection from '@/components/specific/home/MovieTabsSection';

// Only lazy load components that are below the fold or not immediately needed
const GenresSection = dynamic(() => import('@/components/common/genres/GenresSection'), {
  loading: () => <div className="text-white/60 text-center py-8">Loading genres...</div>,
});

const SmallPromoSection = dynamic(() => import('@/components/common/promos/SmallPromoSection'), {
  loading: () => <div className="text-white/60 text-center py-8">Loading promotions...</div>,
});

const Footer = dynamic(() => import('@/components/common/Footer'), {
  loading: () => <div className="h-32 bg-black" />,
});

import { sampleMovies, promotions } from '@/constants/movieData';
import { useMovies } from '@/hooks/useMovies';
import { useGenres } from '@/hooks/useGenres';

function Home() {
  // Tabs state
  const [activeTab, setActiveTab] = useState<'nowplaying' | 'upcoming'>('nowplaying');

  // Custom hooks for data fetching
  // useMovies hook will re-run when activeTab changes due to useCallback dependency
  const {
    movies,
    isLoading: isLoadingMovies,
    pagination,
    goToNextPage,
    goToPreviousPage,
    goToPage,
  } = useMovies(activeTab);
  const { genres, isLoadingGenres } = useGenres();

  return (
    <div className="flex flex-col">
      <NavBar />

      <HeroSection />

      <HeroPromoSection />

      <MovieTabsSection
        movies={movies.length > 0 ? movies : sampleMovies}
        sampleMovies={sampleMovies}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pagination={pagination}
        goToNextPage={goToNextPage}
        goToPreviousPage={goToPreviousPage}
        goToPage={goToPage}
      />

      <div className="px-16 opacity-30 my-8">
        <WhiteSeparator />
      </div>

      <GenresSection genres={genres} isLoading={isLoadingGenres} />
      <SmallPromoSection promotions={promotions} />

      <div className="px-16 opacity-30 my-8">
        <WhiteSeparator />
      </div>

      <Footer />
    </div>
  );
}

export default Home;
