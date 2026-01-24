'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { RxDoubleArrowRight } from 'react-icons/rx';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import WhiteSeparator from '@/components/common/WhiteSeparator';
import SkeletonBlock from '@/components/common/skeletons/SkeletonBlock';
import { useHomePromotions } from '@/hooks/useHomePromotions';
import { useCarousel } from '@/hooks/useCarousel';
import { heroPromotions } from '@/constants/movieData';

/**
 * Hero Promotion Section Component
 * Displays featured promotions in a carousel format
 *
 * Responsibilities:
 * - Display hero promotions from hook / fallback to placeholder promos when backend has none
 * - On fallback promos, show "This offer is no longer available" in description (different color)
 * - Render carousel UI with animations
 *
 * Delegates to:
 * - useHomePromotions hook: Data fetching and transformation
 * - useCarousel hook: Carousel navigation and state management
 */
export default function HeroPromoSection() {
  const { heroPromos, isLoading } = useHomePromotions();
  const displayPromos = heroPromos.length > 0 ? heroPromos : heroPromotions;
  const isUsingFallback = heroPromos.length === 0;

  const {
    currentIndex,
    currentItem: currentPromo,
    direction,
    goToPrevious,
    goToNext,
    goToIndex,
  } = useCarousel(displayPromos, 5000);

  if (isLoading && displayPromos.length === 0) {
    return (
      <section className="relative -mt-40 z-20 px-4">
        <div className="mx-auto flex flex-row w-full max-w-5xl grid-cols-1 gap-10 rounded-xl p-5 md:grid-cols-2">
          <SkeletonBlock className="relative aspect-16/10 w-full overflow-hidden rounded-lg" />
          <div className="flex flex-col w-[80vw] justify-center content-start gap-3 text-white">
            <SkeletonBlock className="h-8 w-3/4 rounded-lg" />
            <SkeletonBlock className="h-4 w-2/3 rounded-lg" />
            <SkeletonBlock className="h-6 w-1/2 rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  if (displayPromos.length === 0 || !currentPromo) {
    return null;
  }

  // Variants for slide animations
  const slideVariants = {
    enter: (dir: 1 | -1) => ({ x: dir === 1 ? 60 : -60, opacity: 0, filter: 'blur(12px)' }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (dir: 1 | -1) => ({ x: dir === 1 ? -60 : 60, opacity: 0, filter: 'blur(12px)' }),
  };

  const contentVariants = {
    enter: (dir: 1 | -1) => ({ x: dir === 1 ? 30 : -30, opacity: 0, filter: 'blur(8px)' }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (dir: 1 | -1) => ({ x: dir === 1 ? -30 : 30, opacity: 0, filter: 'blur(8px)' }),
  };

  return (
    <section className="relative -mt-40 z-20 px-4">
      {/* Left Arrow */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-3 text-white hover:text-acm-pink duration-200 text-2xl cursor-pointer border border-white/30 hover:border-acm-pink/50 z-30"
        aria-label="Previous promotion"
      >
        <IoChevronBack />
      </button>

      {/* Right Arrow */}
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full p-3 text-white hover:text-acm-pink duration-200 text-2xl cursor-pointer border border-white/30 hover:border-acm-pink/50 z-30"
        aria-label="Next promotion"
      >
        <IoChevronForward />
      </button>

      {/* Main Content Container - Slightly smaller to avoid touching arrows */}
      <div className="mx-auto flex flex-col lg:flex-row w-[95%] max-w-[95%] gap-8 lg:gap-12 rounded-xl p-6 lg:p-8">
        {/* Image Section - overflow-visible to allow border animations */}
        <div className="relative aspect-16/10 w-full lg:w-1/2 overflow-visible">
          {isLoading ? (
            <div className="w-full h-full bg-gray-800 animate-pulse rounded-lg"></div>
          ) : (
          <AnimatePresence initial={false} mode="wait" custom={direction}>
            <motion.div
              key={currentPromo.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.4, ease: 'easeOut' }}
              whileHover={{ borderColor: 'rgba(236, 72, 153, 1)' }}
              className="absolute inset-0 rounded-lg border-[0.5px] border-white/60 overflow-hidden"
            >
              <Image
                src={currentPromo.image}
                alt={currentPromo.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </motion.div>
          </AnimatePresence>
          )}

          {/* Carousel Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
            {displayPromos.map((_, index) => (
              <button
                title={`Go to promotion ${index + 1}`}
                type="button"
                key={index}
                onClick={() => goToIndex(index)}
                className={`h-2 rounded-full transition-all duration-200 cursor-pointer ${
                  index === currentIndex ? 'bg-acm-pink w-8' : 'bg-white/50 hover:bg-white/70 w-2'
                }`}
                aria-label={`Go to promotion ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Content Section */}
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={`content-${currentPromo.id}`}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col w-full lg:w-1/2 justify-center gap-4 text-white"
          >
            <h3 className="font-redRose text-acm-pink text-3xl lg:text-4xl font-bold">{currentPromo.title}</h3>
            <WhiteSeparator />
            <p className="text-base lg:text-lg text-white/90">{currentPromo.description}</p>
            {isUsingFallback && (
              <p className="text-sm font-semibold text-amber-600 mt-2" title="Promotion unavailable">
                ( This offer is no longer available )
              </p>
            )}
            <div className="pt-2">
              {!isUsingFallback ? (
              <Link
                href={currentPromo.link}
                aria-label={currentPromo.ctaText}
                className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-acm-pink to-acm-orange px-5 py-2.5 text-white font-semibold shadow-lg ring-1 ring-white/20 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-transform drop-shadow-lg"
              >
                <span>{currentPromo.ctaText}</span>
                <span className="text-xl leading-none">
                  <RxDoubleArrowRight />
                </span>
              </Link>
              ) : (
                <button disabled className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-acm-pink/50 to-acm-orange/50 px-5 py-2.5 text-white/50 font-semibold shadow-lg ring-1 ring-white/20 active:translate-y-0 transition-transform drop-shadow-lg cursor-not-allowed">
                  <span>{currentPromo.ctaText}</span>
                  <span className="text-xl leading-none">
                    <RxDoubleArrowRight />
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
