'use client';

import Image from 'next/image';
import { FullPromo } from '@/hooks/useHomePromotions';
import { formatDiscountForSmallPromo, formatExpirationDate } from '@/utils/promotion';

interface PromoCardProps {
  promotion: FullPromo;
}

export default function PromoCard({ promotion }: PromoCardProps) {
  // const discountText = formatDiscountForSmallPromo(promotion);
  const expirationDate = formatExpirationDate(promotion.expirationDate);

  return (
    <article className="relative flex w-full overflow-hidden rounded-2xl border border-white/40 bg-linear-to-br from-black via-black to-[#2b0018] shadow-lg hover:border-acm-pink/70 hover:shadow-acm-pink/30 transition-all duration-300">
      {/* Left: image strip */}
      <div className="relative w-64 h-40 shrink-0 overflow-hidden">
        <Image
          src={promotion.imageUrl || '/cinema_seats.jpg'}
          alt={promotion.title}
          fill
          className="object-cover"
          sizes="256px"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute top-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur-sm">
          <span className="text-acm-pink uppercase tracking-wide">{promotion.discount}</span>
        </div>
      </div>

      {/* Right: content strip */}
      <div className="relative flex flex-1 flex-col justify-between px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h3 className="font-red-rose text-2xl md:text-3xl font-bold text-white leading-snug">{promotion.title}</h3>
            <p className="text-base text-white/85 leading-relaxed">{promotion.description}</p>
          </div>

          <div className="flex flex-col items-end text-right text-sm text-white/80 gap-1">
            <span className="uppercase tracking-wide">Promo code</span>
            <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-black/70 text-acm-pink font-semibold tracking-wide">
              {promotion.promoCode}
            </span>
            <span className="text-xs text-white/60">Valid until {expirationDate}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-start gap-3">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 font-medium">
              {promotion.discountTag}
            </span>
            <span className="text-white/30">•</span>
            <span>Limited time offer</span>
          </div>
        </div>
      </div>
    </article>
  );
}
