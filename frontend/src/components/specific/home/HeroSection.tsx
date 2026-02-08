'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IoLogoYoutube, IoLogoGithub } from 'react-icons/io5';

const ease = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];

const titleVariants = {
  initial: { y: 60, opacity: 0, filter: 'blur(12px)' },
  animate: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease },
  },
};

const subtitleVariants = {
  initial: { y: 40, opacity: 0, filter: 'blur(8px)' },
  animate: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.7, delay: 0.3, ease },
  },
};

const belowSubtitleVariants = {
  initial: { y: 24, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, delay: 0.5, ease },
  },
};

export default function HeroSection() {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden">
      <Image
        src="/cinema_seats.jpg"
        alt="Cinema seats"
        fill
        className="object-cover brightness-150"
        priority
        sizes="100vw"
      />
      <div className="pointer-events-none absolute inset-0 bg-black/40" />
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-[#0a0a0a]" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center text-center px-4">
        <motion.h1
          variants={titleVariants}
          initial="initial"
          animate="animate"
          className="font-pacifico text-8xl bg-linear-to-r bg-clip-text text-transparent hover:scale-105 transition-all duration-300 from-acm-pink to-acm-orange drop-shadow-lg"
        >
          ACM Cinema
        </motion.h1>
        <motion.p
          variants={subtitleVariants}
          initial="initial"
          animate="animate"
          className="mt-3 font-red-rose font-extrabold text-2xl text-white/90 hover:scale-105 transition-all duration-300"
        >
          Absolute Cinema Movies
        </motion.p>

        <motion.div
          variants={belowSubtitleVariants}
          initial="initial"
          animate="animate"
          className="mt-4 flex flex-row items-center justify-center gap-4"
        >
          <span className="inline-block px-5 py-2 rounded-full font-red-rose font-bold text-sm text-acm-orange/80 border border-acm-orange/70 hover:border-acm-orange hover:text-acm-orange hover:scale(1.05) transition-all duration-300 backdrop-blur-sm shadow-md">
            "Top Class Projects"
          </span>
          <div className="flex items-center justify-center gap-2">
            <Link
              href="https://youtu.be/92fEVh5wNyI"
              target="_blank"
              title="YouTube"
              aria-label="YouTube"
              className="text-white/40 hover:text-acm-pink transition-colors cursor-pointer text-2xl"
            >
              <IoLogoYoutube />
            </Link>
            <Link
              href="https://github.com/ttn64681/Absolute-Cinema-Movies"
              target="_blank"
              title="GitHub"
              aria-label="GitHub"
              className="text-white/40 hover:text-acm-pink transition-colors cursor-pointer text-2xl"
            >
              <IoLogoGithub />
            </Link>
          </div>
        </motion.div>

        <motion.p
          variants={subtitleVariants}
          initial="initial"
          animate="animate"
          className="text-sm text-white/30 translate-y-[1rem] group hover:text-white/60 transition-all duration-300"
        >
          Hosted on{' '}
          <span className="text-acm-orange/30 group-hover:text-acm-orange transition-all duration-300 font-medium">
            Render
          </span>
          : server may take 1–3 min+ to cold-boot.
        </motion.p>
      </div>
    </section>
  );
}
