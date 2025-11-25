'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RxDoubleArrowRight } from 'react-icons/rx';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import WhiteSeparator from '@/components/common/WhiteSeparator';
import { useHomePromotions } from '@/hooks/useHomePromotions';
import { heroPromotions } from '@/constants/movieData';

/**
 * Hero Promotion Section Component
 * Displays featured promotions in a carousel format
 *
 * Responsibilities:
 * - Carousel navigation and animations
 * - Display hero promotions from hook / fallback to placeholders
 *
 * Delegates to:
 * - useHomePromotions hook: Data fetching and transformation
 */
export default function HeroPromoSection() {
  const { heroPromos, isLoading } = useHomePromotions();
  // Use backend promotions if available, otherwise use placeholder promotions
  const displayPromos = heroPromos.length > 0 ? heroPromos : heroPromotions;
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  const currentPromo = displayPromos[currentPromoIndex];
  const [direction, setDirection] = useState<1 | -1>(1);

  const goToPrevious = useCallback(() => {
    setDirection(-1);
    setCurrentPromoIndex((prev) => (prev === 0 ? displayPromos.length - 1 : prev - 1));
  }, [displayPromos.length]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentPromoIndex((prev) => (prev === displayPromos.length - 1 ? 0 : prev + 1));
  }, [displayPromos.length]);

  // Handle indicator clicks - set direction based on click
  const goToIndex = useCallback(
    (index: number) => {
      if (index > currentPromoIndex) {
        setDirection(1);
      } else if (index < currentPromoIndex) {
        setDirection(-1);
      } else {
        return; // Same index, do nothing
      }
      setCurrentPromoIndex(index);
    },
    [currentPromoIndex]
  );

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(goToNext, 5000);
    return () => clearInterval(interval);
  }, [goToNext]);

  // Show loading skeleton while fetching (only if no placeholders to show)
  if (isLoading && displayPromos.length === 0) {
    return (
      <section className="relative -mt-40 z-20 px-4">
        <div className="mx-auto flex flex-row w-[100%] max-w-5xl grid-cols-1 gap-10 rounded-xl p-5 md:grid-cols-2">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg border-1 bg-gray-800 animate-pulse"></div>
          <div className="flex flex-col w-[80vw] justify-center content-start gap-3 text-white">
            <div className="h-8 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-6 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </section>
    );
  }

  // Always render - use placeholders if no backend promotions
  if (displayPromos.length === 0) {
    return null; // Should never happen due to fallback, but safety check
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
        <div className="relative aspect-[16/10] w-full lg:w-1/2 overflow-visible">
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
                className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                  index === currentPromoIndex ? 'bg-acm-pink scale-125' : 'bg-white/50 hover:bg-white/70'
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
            <div className="pt-2">
              <Link
                href={currentPromo.link}
                aria-label={currentPromo.ctaText}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-acm-pink to-acm-orange px-5 py-2.5 text-white font-semibold shadow-lg ring-1 ring-white/20 hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-transform drop-shadow-lg"
              >
                <span>{currentPromo.ctaText}</span>
                <span className="text-xl leading-none">
                  <RxDoubleArrowRight />
                </span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
