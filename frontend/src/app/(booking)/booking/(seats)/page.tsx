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
  const { selectedSeats:selectedSeats, selectedSeatIds, rows, toggleSeat, resetSeats, reserveSelectedSeats, loading, error, auditorium } = useSeats(showId);

  const goBack = () => {
    router.back();
  };

  // Check if reservation expired or was cancelled
  useEffect(() => {
    if (reservationExpired) {
      alert('Your reservation has expired. Please select your seats again.');
      clearReservation();
      // Clear local selection
      resetSeats();
    }
    // Don't clear selections just because there's no active reservation
    // Users should be able to select seats even without an active reservation
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
            console.error('Show not found:', data);
          }
        } else {
          console.error('Failed to fetch showId:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Error looking up showId:', error);
      }
    };

    lookupShowId();
  }, [showId, movieIdParam, date, time]);

  const submitSelection = async () => {
    if (selectedSeats.length > 0 && showId) {
      console.log('Selected seats:', selectedSeats);
      // Reserve seats before navigating
      try {
        const success = await reserveSelectedSeats(showId);
        if (success) {
          // Start reservation timer immediately after successfully reserving seats
          // Pass navigation params so we can navigate back to seat selection when canceling
          startReservation(showId, selectedSeats, {
            movieId: movieIdParam || null,
            title: movieTitle || null,
            date: date || null,
            time: time || null
          });
          console.log('Reservation started - timer should now be visible');
          
          // Navigate to ticket-age page with showId
          router.push(`/booking/ticket-age?showId=${showId}&movieId=${movieIdParam || ''}&seats=${selectedSeats.length}&seatIds=${selectedSeats.join(',')}&title=${encodeURIComponent(movieTitle)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`);
        } else {
          alert('Failed to reserve seats. Please try again.');
        }
      } catch (error) {
        console.error('Error reserving seats:', error);
        alert('Failed to reserve seats. Please try again.');
      }
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
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {auditorium && (
                  <p className="text-sm sm:text-base text-white/80 font-semibold">{auditorium.name}</p>
                )}
                <p className="text-sm sm:text-base text-white/80">{date} • {time}</p>
              </div>
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
