'use client';

import { useReservation } from '@/contexts/ReservationContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const RESERVATION_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export default function ReservationTimerToast() {
  const { timeRemaining, isExpired, formatTime, selectedSeats, showId, reservationStartTime, cancelReservation, getSeatSelectionUrl } = useReservation();
  const [isVisible, setIsVisible] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();

  // Show toast when there's an active reservation
  useEffect(() => {
    // Check if reservation was cancelled
    const isCancelled = sessionStorage.getItem('reservationCancelled') === 'true';
    
    // Show timer if:
    // 1. Not cancelled
    // 2. Has showId and seats
    // 3. Has a start time (reservation actually started)
    // 4. Not expired
    // 5. Has time remaining (greater than 0)
    const hasActiveReservation = !isCancelled 
      && showId !== null 
      && selectedSeats.length > 0 
      && reservationStartTime !== null // CRITICAL: Ensure reservation actually started
      && !isExpired 
      && timeRemaining > 0;
    
    // Debug logging
    if (hasActiveReservation !== isVisible) {
      console.log('Timer visibility changed:', {
        isVisible: hasActiveReservation,
        isCancelled,
        showId,
        selectedSeatsCount: selectedSeats.length,
        reservationStartTime,
        isExpired,
        timeRemaining,
        timeRemainingMinutes: Math.floor(timeRemaining / 60000)
      });
    }
    
    setIsVisible(hasActiveReservation);
  }, [showId, selectedSeats, reservationStartTime, isExpired, timeRemaining, isVisible]);

  if (!isVisible) {
    return null;
  }

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const isWarning = minutes < 2; // Show warning when less than 2 minutes remain

  return (
    <div
      className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      } ${
        isWarning 
          ? 'bg-red-500/90 backdrop-blur-sm border-red-400 text-white' 
          : 'bg-yellow-500/90 backdrop-blur-sm border-yellow-400 text-white'
      }`}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {isWarning ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-[140px]">
          <p className="text-xs font-medium mb-1">Reservation Timer</p>
          <p className={`text-xl font-bold ${isWarning ? 'text-red-100' : 'text-yellow-100'}`}>
            {formatTime(timeRemaining)}
          </p>
          <p className="text-xs text-white/80 mt-0.5">
            {selectedSeats.length} seat{selectedSeats.length !== 1 ? 's' : ''} reserved
          </p>
        </div>
        <button
          onClick={async () => {
            if (isCancelling) return;
            setIsCancelling(true);
            
            // Get seat selection URL BEFORE canceling (since canceling clears state)
            const seatSelectionUrl = getSeatSelectionUrl();
            
            try {
              // Cancel the reservation (releases seats and clears state)
              await cancelReservation();
              
              // Small delay to ensure state updates and timer stops completely
              await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
              console.error('Error cancelling reservation:', error);
              // Continue to navigation even if cancellation had an error
            } finally {
              // Navigate to seat selection page (not just back)
              if (seatSelectionUrl) {
                router.push(seatSelectionUrl);
              } else {
                // Fallback: navigate to booking page
                router.push('/booking');
              }
              setIsCancelling(false);
            }
          }}
          disabled={isCancelling}
          className="flex-shrink-0 ml-2 text-white/80 hover:text-white transition-colors disabled:opacity-50"
          title="Cancel reservation and return to seat selection"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

