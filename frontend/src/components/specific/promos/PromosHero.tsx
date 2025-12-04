'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function PromosHero() {
  const titleVariants = {
    initial: { y: 60, opacity: 0, filter: 'blur(12px)' },
    animate: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.8,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    },
  };

  const subtitleVariants = {
    initial: { y: 40, opacity: 0, filter: 'blur(8px)' },
    animate: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.7,
        delay: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      },
    },
  };

  return (
    <section className="relative h-[60vh] w-full overflow-hidden bg-black">
      <Image
        src="/cinema_promotional_bg.jpg"
        alt="Cinema tickets and popcorn"
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />

      <div className="pointer-events-none absolute inset-0 bg-black/40" />
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-black/40 to-transparent" />
      <div className="pointer-events-none inset-0 absolute bg-linear-to-b from-transparent via-black/40 to-[#0a0a0a]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
        <motion.h1
          variants={titleVariants}
          initial="initial"
          animate="animate"
          className="font-pacifico text-7xl bg-linear-to-r from-acm-pink to-acm-orange bg-clip-text text-transparent drop-shadow-xl"
        >
          Promotions
        </motion.h1>
        <motion.p
          variants={subtitleVariants}
          initial="initial"
          animate="animate"
          className="mt-4 max-w-xl text-base sm:text-lg text-white/85"
        >
          Save on every ticket, snack, and special event. Discover curated deals that make your next movie night even
          better.
        </motion.p>
      </div>
    </section>
  );
}
