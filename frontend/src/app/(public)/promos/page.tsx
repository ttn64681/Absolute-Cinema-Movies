'use client';

import PromoCard from '@/components/common/promos/PromoCard';
import { BackendPromotion, DiscountType, PromotionStatus } from '@/types/promotion';
import NavBar from '@/components/common/navBar/NavBar';
import dynamic from 'next/dynamic';

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
    <div>
      <NavBar />
      <div className="min-h-screen bg-[#1C1C1C]">
        <div className="max-w-7xl mx-auto px-8 pt-28 pb-12">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold font-red-rose text-white pb-4">Promotions</h1>
            <div className="mx-auto w-[250px] border-b border-white"></div>
          </div>

          <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            {mockPromotions.map((promotion) => (
              <PromoCard key={promotion.id} promotion={promotion} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
