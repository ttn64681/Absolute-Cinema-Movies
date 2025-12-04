'use client';

import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-white/10 bg-black/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white/90">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-pacifico acm-gradient leading-none">acm</span>
            <span className="text-white/70">Actual Cinema Movies</span>
          </div>

          {/* Links relevant to this project */}
          <nav className="flex flex-wrap items-center gap-4 text-sm">
            <Link href="/movies" className="hover:text-acm-pink transition-colors">
              Movies
            </Link>
            <Link href="/promos" className="hover:text-acm-pink transition-colors">
              Promotions
            </Link>
            {/* <Link href="/movies" className="hover:text-acm-pink transition-colors">
              Book Tickets
            </Link> */}
            <Link href="/auth/register" className="hover:text-acm-pink transition-colors">
              Join
            </Link>
          </nav>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-white/60">
          <p>© {year} ACM. All rights reserved.</p>
          <p>Built for the ACM Cinema e-booking project.</p>
        </div>
      </div>
    </footer>
  );
}
