'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function HeroSection() {
  // Animation variants for title - fade from below with blur
  const titleVariants = {
    initial: {
      y: 60,
      opacity: 0,
      filter: 'blur(12px)',
    },
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

  // Animation variants for subtitle - fade from below with blur, delayed
  const subtitleVariants = {
    initial: {
      y: 40,
      opacity: 0,
      filter: 'blur(8px)',
    },
    animate: {
      y: 0,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.7,
        delay: 0.3, // Start after title animation begins
        ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number], // Custom cubic-bezier easing
      },
    },
  };

  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      {/* Background image */}
      <Image
        src="/cinema_seats.jpg"
        alt="Cinema seats"
        fill
        className="object-cover brightness-150"
        priority
        sizes="100vw"
      />

      {/* Dark overlay + bottom gradient fade to bg-dark */}
      <div className="pointer-events-none absolute inset-0 bg-black/40" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0a0a]" />

      {/* Centered text */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
        <motion.h1
          variants={titleVariants}
          initial="initial"
          animate="animate"
          className="font-pacifico text-8xl bg-gradient-to-r bg-clip-text text-transparent from-acm-pink to-acm-orange drop-shadow-lg"
        >
          ACM Cinema
        </motion.h1>
        <motion.p
          variants={subtitleVariants}
          initial="initial"
          animate="animate"
          className="mt-3 font-red-rose font-extrabold text-2xl text-white/90 drop-shadow"
        >
          Actual Cinema Movies
        </motion.p>
      </div>
    </section>
  );
}
