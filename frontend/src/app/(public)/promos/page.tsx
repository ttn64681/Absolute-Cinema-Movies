'use client';

import PromoCard from '@/components/common/promos/PromoCard';
import { useHomePromotions } from '@/hooks/useHomePromotions';
import NavBar from '@/components/common/navBar/NavBar';
import dynamic from 'next/dynamic';
import PromosHero from '@/components/specific/promos/PromosHero';
import Spinner from '@/components/common/Spinner';

const Footer = dynamic(() => import('@/components/common/Footer'), {
  loading: () => <div className="h-32 bg-black" />,
});

export default function PromosPage() {

  const { fullPromos, isLoading } = useHomePromotions();

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <NavBar />
      <PromosHero />

      <main className="relative flex-1">
        <div className="max-w-6xl mx-auto px-8 pb-16 -mt-20 relative z-10">
          <section className="flex flex-col gap-6">
            {isLoading ? (
              <div className="flex justify-center content-center">
                <Spinner size="xl" color="pink" />
              </div>
            ) : fullPromos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <p className="text-white/60 text-lg mb-2">No promotions available at the moment.</p>
                <p className="text-white/40 text-sm">
                  Check back later for new offers and deals.
                </p>
              </div>
            ) : (
              fullPromos.map((promotion) => (
                <PromoCard key={promotion.id} promotion={promotion} />
              ))
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
