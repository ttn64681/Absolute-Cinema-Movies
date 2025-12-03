'use client';

import PromoCard from '@/components/common/promos/PromoCard';
import { BackendPromotion, DiscountType, PromotionStatus } from '@/types/promotion';
import NavBar from '@/components/common/navBar/NavBar';
import dynamic from 'next/dynamic';
import PromosHero from '@/components/specific/promos/PromosHero';

const Footer = dynamic(() => import('@/components/common/Footer'), {
  loading: () => <div className="h-32 bg-black" />,
});

const mockPromotions: BackendPromotion[] = [
  {
    id: 1,
    promoCode: 'FIRST20',
    title: 'FIRST-TIME WATCHER PROMO',
    description: 'Get a 20% discount for first time acm movie theater watchers',
    imageLink: '/cinema_people.jpg',
    discountValue: 20,
    discountType: DiscountType.percentage,
    status: PromotionStatus.active,
    expirationDate: '2025-12-30',
  },
  {
    id: 2,
    promoCode: 'MEAL15',
    title: 'CONCESSION COMBO PROMO',
    description: 'Get a 15% discount on combo meals bought at concessions',
    imageLink: '/cinema_seats.jpg',
    discountValue: 15,
    discountType: DiscountType.percentage,
    status: PromotionStatus.active,
    expirationDate: '2025-12-31',
  },
  {
    id: 3,
    promoCode: '3PLUS',
    title: '3+ FAMILY MEMBERS PROMO',
    description: 'Get a 10% discount when you buy 3 or more tickets',
    imageLink: '/cinema_seats.jpg',
    discountValue: 10,
    discountType: DiscountType.percentage,
    status: PromotionStatus.active,
    expirationDate: '2026-01-15',
  },
];

export default function PromosPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <NavBar />
      <PromosHero />

      <main className="relative flex-1">
        <div className="max-w-6xl mx-auto px-8 pb-16 -mt-20 relative z-10">
          <section className="flex flex-col gap-6">
            {mockPromotions.map((promotion) => (
              <PromoCard key={promotion.id} promotion={promotion} />
            ))}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
