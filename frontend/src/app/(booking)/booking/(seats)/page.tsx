"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/common/navBar/NavBar';
import CinemaLayout from '@/components/specific/booking/CinemaLayout';
import PromoBanner from '@/components/common/promos/PromoBanner';
import { useSeats } from '@/hooks/useSeats';
import { useReservation } from '@/contexts/ReservationContext';
import styles from './seats.module.css';

function SeatingPageContent() { 
  const router = useRouter(); 
  const searchParams = useSearchParams(); 
  
  // Get parameters from URL
  const showIdParam = searchParams.get('showId');
  const movieIdParam = searchParams.get('movieId');
  const [showId, setShowId] = useState<number | undefined>(
    showIdParam ? parseInt(showIdParam) : undefined
  );
  
  // Movie details from URL params
  const [movieTitle, setMovieTitle] = useState(searchParams.get('title') || 'Oldboy');
  const [date, setDate] = useState(searchParams.get('date') || '10/29/2025');
  const [time, setTime] = useState(searchParams.get('time') || '2:30-4:00PM');
  
  // Reservation context
  const { startReservation, clearReservation, isExpired: reservationExpired, showId: reservationShowId, selectedSeats: reservationSeats } = useReservation();
  
  // Custom hook for seat management (needs reservation context to know which seats are user's reserved seats)
  const { selectedSeats:selectedSeats, selectedSeatIds, rows, toggleSeat, resetSeats, reserveSelectedSeats, loading, error } = useSeats(showId);
  
  // Check if reservation expired
  useEffect(() => {
    if (reservationExpired) {
      alert('Your reservation has expired. Please select your seats again.');
      clearReservation();
      // Clear local selection
      resetSeats();
    }
  }, [reservationExpired, clearReservation, resetSeats]);
  
  // Look up showId (movie_show.id) if not provided but we have movieId, date, and time
  useEffect(() => {
    const lookupShowId = async () => {
      // If showId is already provided, don't look it up
      if (showId || !movieIdParam || !date || !time) {
        return;
      }
      
      try {
        // Convert date from MM/DD/YYYY to YYYY-MM-DD
        let isoDate = date;
        if (date.includes('/')) {
          const [mRaw, dRaw, yRaw] = date.split('/');
          const year = (yRaw || '').length === 2 ? `20${yRaw}` : yRaw;
          const mm = (mRaw || '').padStart(2, '0');
          const dd = (dRaw || '').padStart(2, '0');
          isoDate = `${year}-${mm}-${dd}`;
        }
        
        // Convert time from various formats to "HH:MM:SS"
        // Formats: "2:30-4:00PM", "2:30 PM", "14:30:00", "14:30"
        let isoTime = time;
        
        // If already in HH:MM:SS format, use it directly
        if (/^\d{2}:\d{2}:\d{2}$/.test(time)) {
          isoTime = time;
        } else {
          // Extract start time (before dash, space, or end)
          const timeMatch = time.match(/(\d{1,2}):(\d{2})/);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = timeMatch[2];
            // Check if PM/AM
            const upperTime = time.toUpperCase();
            if (upperTime.includes('PM') && hours !== 12) {
              hours += 12;
            } else if (upperTime.includes('AM') && hours === 12) {
              hours = 0;
            }
            isoTime = `${hours.toString().padStart(2, '0')}:${minutes}:00`;
          } else {
            console.error('Could not parse time format:', time);
            return; // Can't proceed without valid time
          }
        }
        
        console.log('Converted time:', time, '->', isoTime);
        
        // Call API to get movie_show.id
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/movies/${movieIdParam}/show-id?date=${isoDate}&time=${isoTime}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.showId) {
            console.log('Found movie_show.id:', data.showId);
            setShowId(data.showId);
          } else {
            console.error('Failed to find movie_show.id:', data);
          }
        } else {
          console.error('Error looking up movie_show.id:', response.status);
        }
      } catch (err) {
        console.error('Error looking up movie_show.id:', err);
      }
    };
    
    lookupShowId();
  }, [showId, movieIdParam, date, time]);

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

  const submitSelection = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent default navigation
    
    if (selectedSeats.length === 0 || !showId) {
      alert('Please select at least one seat before continuing.');
      return;
    }

    // Check if seats are already in active reservation
    const seatsAlreadyReserved = reservationShowId === showId && 
      selectedSeats.every(seat => reservationSeats.includes(seat)) &&
      selectedSeats.length === reservationSeats.length;

    if (seatsAlreadyReserved) {
      // Seats are already reserved - just navigate (timer is already running)
      console.log('Seats already reserved, navigating without re-reserving');
      router.push(`/booking/ticket-age?seats=${encodeURIComponent(selectedSeats.length)}&seatIds=${encodeURIComponent(selectedSeats.join(','))}&showId=${encodeURIComponent(showId.toString())}&title=${encodeURIComponent(movieTitle)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`);
      return;
    }

    // Reserve seats before navigating (only if not already reserved)
    const success = await reserveSelectedSeats();
    if (success) {
      // Start/update the reservation timer in context
      startReservation(showId, selectedSeats);
      
      // Navigate to next page with seat display IDs (e.g., "1A,2B") - NOT database IDs
      // The backend will find seats by showId + row/number when creating the booking
      router.push(`/booking/ticket-age?seats=${encodeURIComponent(selectedSeats.length)}&seatIds=${encodeURIComponent(selectedSeats.join(','))}&showId=${encodeURIComponent(showId.toString())}&title=${encodeURIComponent(movieTitle)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`);
    }
    // Note: Error messages are already shown in reserveSelectedSeats, so no need to show another alert here
    // If reservation fails, alert is shown in reserveSelectedSeats, so don't navigate
  };

  // Debug: Log button state and showId
  useEffect(() => {
    console.log('Button state check:', {
      selectedSeatsLength: selectedSeats.length,
      showId: showId,
      showIdType: typeof showId,
      showIdIsValid: showId !== undefined && showId !== null && !isNaN(Number(showId)),
      buttonEnabled: selectedSeats.length > 0 && showId
    });
  }, [selectedSeats, showId]);

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
              {loading && (
                <div className="text-white text-center py-8">Loading seats...</div>
              )}
              {error && (
                <div className="text-red-500 text-center py-8">{error}</div>
              )}
              {!loading && !error && (
                <CinemaLayout 
                  rows={rows}
                  selectedSeats={selectedSeats}
                  onToggleSeat={toggleSeat}
                />
              )}
              
              {/* Action Buttons - Reset and Continue */}
                  <div className="flex justify-between items-center mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      resetSeats();
                      // Clear reservation if user manually resets
                      if (reservationShowId === showId) {
                        clearReservation();
                      }
                    }}
                    disabled={selectedSeats.length === 0}
                    className={styles.resetButton}
                  >
                    Reset Selection
                  </button>
                <button 
                    type='button'
                    id="submitBtn" 
                    onClick={submitSelection} 
                    className={selectedSeats.length > 0 && showId ? styles.continueButton : styles.continueButtonDisabled}
                    disabled={selectedSeats.length === 0 || !showId}
                    title={
                      !showId 
                        ? "Missing show information" 
                        : selectedSeats.length === 0 
                          ? "No seats selected" 
                          : `Continue with ${selectedSeats.length} seat${selectedSeats.length !== 1 ? 's' : ''}`
                    }
                >
                  Continue with {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''}
                </button>
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
