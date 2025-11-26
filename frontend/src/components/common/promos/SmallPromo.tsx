import Image from 'next/image';
import { motion } from 'framer-motion';

interface SmallPromoProps {
  discount: string;
  promo: string;
  imageUrl?: string;
}

export default function SmallPromo({ discount, promo, imageUrl }: SmallPromoProps) {
  return (
    <motion.div
      className="bg-black border-2 border-white/60 flex flex-row rounded-xl max-h-40 w-[400px] flex-shrink-0 overflow-hidden"
      whileHover={{ borderColor: '#ec4899', scale: 1.02 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ paddingBottom: '16px' }}
    >
      <div className="relative w-40 h-40 border-r-2 border-white/60">
        <Image
          src={imageUrl ?? '/cinema_seats.jpg'}
          alt="Promotion Image"
          fill
          priority
          className="object-cover"
          sizes="160px"
        />
      </div>
      <div className="flex flex-col justify-center px-6 flex-1">
        <h2 className="text-acm-pink text-2xl font-bold font-afacad">{discount}</h2>
        <h3 className="text-white text-lg font-afacad">{promo}</h3>
      </div>
    </motion.div>
  );
}
