"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/common/navBar/NavBar';
import CinemaLayout from '@/components/specific/booking/CinemaLayout';
import PromoBanner from '@/components/common/promos/PromoBanner';
import { useSeats } from '@/hooks/useSeats';
import styles from './seats.module.css';

function SeatingPageContent() { 
  const router = useRouter(); 
  const searchParams = useSearchParams(); 
  
  // Custom hook for seat management
  const { selectedSeats:selectedSeats, rows, toggleSeat, resetSeats } = useSeats();
  
  // Movie details from URL params
  const [movieTitle, setMovieTitle] = useState(searchParams.get('title') || 'Oldboy');
  const [date, setDate] = useState(searchParams.get('date') || '10/29/2025');
  const [time, setTime] = useState(searchParams.get('time') || '2:30-4:00PM');

  const goBack = () => {
    router.back();
  };

  useEffect(() => {
    const title = searchParams.get('title');
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    
    if (title) setMovieTitle(title);
    if (date) setDate(date);
    if (time) setTime(time);
  }, [searchParams]);

  const submitSelection = () => {
    if (selectedSeats.length > 0) {
      console.log('Selected seats:', selectedSeats);

    } 
  };

  return (
    <div className="min-h-screen bg-black">
        <Navbar />

        {/* Header */}
        <div className="pt-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Back Button */}
              <button
                type='button'
                onClick={goBack}
                className="bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 text-white hover:text-acm-pink transition-all duration-200 flex items-center gap-2 border border-white/20 hover:border-acm-pink/50"
                title="Back"
              >
                <span>←</span>
                <span>Back</span>
              </button>
            </div>
            {/* Movie Info Card */}
            <div className="mt-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-acm-pink">{movieTitle}</h1>
              <p className="text-sm sm:text-base text-white/80 mt-1">{date} • {time}</p>
            </div>
          </div>
        </div>

          <main className="flex-grow p-6">
            <div className="max-w-5xl mx-auto">
              <CinemaLayout 
                rows={rows}
                selectedSeats={selectedSeats}
                onToggleSeat={toggleSeat}
              />
              
              {/* Action Buttons - Reset and Continue */}
                  <div className="flex justify-between items-center mt-6">
                  <button
                    type="button"
                    onClick={resetSeats}
                    disabled={selectedSeats.length === 0}
                    className={styles.resetButton}
                  >
                    Reset Selection
                  </button>
                <Link href={`booking/ticket-age?seats=${encodeURIComponent(selectedSeats.length ?? 0)}&seatIds=${encodeURIComponent(selectedSeats.join(','))}&title=${encodeURIComponent(movieTitle)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`}>
                      <button 
                          type='button'
                          id="submitBtn" 
                          onClick={submitSelection} 
                          className={selectedSeats.length > 0 ? styles.continueButton : styles.continueButtonDisabled}
                          disabled={selectedSeats.length === 0}
                          title="Continue with X seats"
                      >
                      Continue with {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''}
                      </button>
                    </Link>
              </div>
            </div>
          </main>


          <PromoBanner 
            title="Limited-Time Discount: Save 20% on your order"
            description="Apply your discount now to lock it in at checkout."
            buttonText="Apply Now!"
            buttonHref="/booking/checkout"
          />
      </div>
  );
}

export default function SeatingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <SeatingPageContent />
    </Suspense>
  );
}
