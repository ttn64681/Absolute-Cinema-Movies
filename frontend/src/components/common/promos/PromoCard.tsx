'use client';

import Image from 'next/image';
import { BackendPromotion } from '@/types/promotion';
import { formatDiscountForSmallPromo, formatExpirationDate } from '@/utils/promotion';

interface PromoCardProps {
  promotion: BackendPromotion;
}

export default function PromoCard({ promotion }: PromoCardProps) {
  const discountText = formatDiscountForSmallPromo(promotion);
  const expirationDate = formatExpirationDate(promotion.expirationDate);

  return (
    <div className="w-full border border-white rounded-lg overflow-hidden">
      <div className="flex flex-row h-32">
        <div className="relative w-64 h-32 flex-shrink-0 border-r border-white">
          <Image
            src={promotion.imageLink || '/cinema_seats.jpg'}
            alt={promotion.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 256px"
          />
        </div>

        <div className="flex flex-1 flex-row gap-4 px-6">
          <div className="flex-shrink-0 min-w-[200px] flex items-center py-3">
            <div>
              <div className="text-acm-pink font-afacad font-bold text-2xl mb-1 leading-tight">
                {discountText}
              </div>
              <div className="text-white font-afacad text-sm uppercase tracking-wide">
                {promotion.title}
              </div>
            </div>
          </div>

          <div className="flex-1 border-l border-r border-white px-4 py-3 flex items-center justify-center">
            <div className="text-white font-afacad text-base leading-relaxed text-center">
              {promotion.description}
            </div>
          </div>

          <div className="flex-shrink-0 min-w-[180px] flex items-center justify-center py-3">
            <div className="text-center">
              <div className="text-acm-pink font-afacad font-bold text-xl mb-1">
                CODE: {promotion.promoCode}
              </div>
              <div className="text-white font-afacad text-sm">
                EXP {expirationDate}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

