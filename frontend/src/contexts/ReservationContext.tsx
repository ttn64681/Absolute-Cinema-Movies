'use client';

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { endpoints } from '@/config/api';

interface ReservationContextType {
  showId: number | null;
  selectedSeats: string[];
  reservationStartTime: number | null;
  timeRemaining: number;
  isExpired: boolean;
  startReservation: (showId: number, selectedSeats: string[]) => void;
  clearReservation: () => void;
  cancelReservation: () => Promise<void>;
  formatTime: (ms: number) => string;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

const RESERVATION_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

// Helper function to get initial state from sessionStorage
function getInitialReservationState() {
  if (typeof window === 'undefined') {
    return {
      showId: null,
      selectedSeats: [],
      reservationStartTime: null,
      timeRemaining: RESERVATION_DURATION,
      isExpired: false
    };
  }

  // Check if reservation was cancelled - if so, don't restore
  // DON'T clear the flag here - let it persist until a new reservation starts
  const isCancelled = sessionStorage.getItem('reservationCancelled');
  if (isCancelled === 'true') {
    // Clear any stale reservation data but keep the cancellation flag
    sessionStorage.removeItem('activeReservation');
    return {
      showId: null,
      selectedSeats: [],
      reservationStartTime: null,
      timeRemaining: RESERVATION_DURATION,
      isExpired: false
    };
  }

  const stored = sessionStorage.getItem('activeReservation');
  if (stored) {
    try {
      const reservation = JSON.parse(stored);
      const { showId: storedShowId, selectedSeats: storedSeats, startTime } = reservation;
      
      // Calculate elapsed time from the original start time
      const elapsed = Date.now() - startTime;
      const remaining = RESERVATION_DURATION - elapsed;

      if (remaining > 0) {
        return {
          showId: storedShowId,
          selectedSeats: storedSeats,
          reservationStartTime: startTime,
          timeRemaining: remaining,
          isExpired: false
        };
      }
    } catch (e) {
      console.error('Error loading reservation from sessionStorage:', e);
      sessionStorage.removeItem('activeReservation');
    }
  }

  return {
    showId: null,
    selectedSeats: [],
    reservationStartTime: null,
    timeRemaining: RESERVATION_DURATION,
    isExpired: false
  };
}

export function ReservationProvider({ children }: { children: React.ReactNode }) {
  const initialState = getInitialReservationState();
  const [showId, setShowId] = useState<number | null>(initialState.showId);
  const [selectedSeats, setSelectedSeats] = useState<string[]>(initialState.selectedSeats);
  const [reservationStartTime, setReservationStartTime] = useState<number | null>(initialState.reservationStartTime);
  const [timeRemaining, setTimeRemaining] = useState(initialState.timeRemaining);
  const [isExpired, setIsExpired] = useState(initialState.isExpired);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  // Track if we restored from initial state (to avoid double-loading in useEffect)
  const hasRestoredRef = useRef(initialState.reservationStartTime !== null);
  // Track if reservation was cancelled to prevent timer from restarting
  // Initialize from sessionStorage to persist across re-renders
  const isCancelledRef = useRef(
    typeof window !== 'undefined' && sessionStorage.getItem('reservationCancelled') === 'true'
  );

  // Define clearReservation first so it can be used in handleExpiredReservation
  const clearReservation = useCallback(() => {
    // Mark as cancelled to prevent timer from restarting
    isCancelledRef.current = true;
    
    // Stop timer FIRST to prevent any further updates
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Mark as cancelled in sessionStorage to prevent restoration on navigation
    sessionStorage.setItem('reservationCancelled', 'true');
    
    // Clear sessionStorage immediately to prevent restoration
    sessionStorage.removeItem('activeReservation');
    
    // Then clear all state
    setShowId(null);
    setSelectedSeats([]);
    setReservationStartTime(null);
    setIsExpired(false);
    setTimeRemaining(RESERVATION_DURATION);
  }, []);

  // Handle expired reservation (defined early so it can be used in useEffect)
  const handleExpiredReservation = useCallback(async (expiredShowId: number, expiredSeats: string[]) => {
    try {
      // Convert seat display IDs to seat row/number objects
      const seatSelections = expiredSeats.map(displayId => {
        const match = displayId.match(/^(\d+)([A-Z]+)$/);
        if (match) {
          return {
            seatRow: match[1],
            seatNumber: match[2]
          };
        }
        return null;
      }).filter(seat => seat !== null);

      if (seatSelections.length > 0) {
        // Release seats from reservation
        await api.post(endpoints.seats.releaseBySelection, {
          showId: expiredShowId,
          seats: seatSelections
        });

        console.log('Seats released due to timer expiration');
      }
    } catch (error: any) {
      console.error('Error releasing seats:', error);
    } finally {
      // Clear reservation state
      clearReservation();
    }
  }, [clearReservation]);

  // Listen for user logout event to clear reservation
  useEffect(() => {
    const handleUserLogout = () => {
      console.log('User logged out - clearing reservation and releasing seats');
      if (showId && selectedSeats.length > 0) {
        // Release seats when user logs out
        handleExpiredReservation(showId, selectedSeats);
      } else {
        clearReservation();
      }
    };

    window.addEventListener('userLogout', handleUserLogout);
    return () => {
      window.removeEventListener('userLogout', handleUserLogout);
    };
  }, [showId, selectedSeats, handleExpiredReservation, clearReservation]);

  // Load reservation from sessionStorage on mount (only if not already restored)
  useEffect(() => {
    // Check if reservation was cancelled - if so, don't restore
    // Keep the cancellation flag - don't clear it here
    const isCancelled = sessionStorage.getItem('reservationCancelled');
    if (isCancelled === 'true') {
      // Update ref to match sessionStorage
      isCancelledRef.current = true;
      // Clear any stale reservation data but keep the cancellation flag
      sessionStorage.removeItem('activeReservation');
      // Ensure state is cleared
      if (showId !== null || selectedSeats.length > 0 || reservationStartTime !== null) {
        setShowId(null);
        setSelectedSeats([]);
        setReservationStartTime(null);
        setIsExpired(false);
        setTimeRemaining(RESERVATION_DURATION);
      }
      return;
    }
    
    // Skip if we already restored from initial state
    if (hasRestoredRef.current || reservationStartTime !== null) {
      return;
    }

    const stored = sessionStorage.getItem('activeReservation');
    if (stored) {
      try {
        const reservation = JSON.parse(stored);
        const { showId: storedShowId, selectedSeats: storedSeats, startTime } = reservation;
        
        // Calculate elapsed time from the original start time
        const elapsed = Date.now() - startTime;
        const remaining = RESERVATION_DURATION - elapsed;

        console.log('Restoring reservation from sessionStorage:', {
          startTime,
          elapsed: elapsed / 1000 + ' seconds',
          remaining: remaining / 1000 + ' seconds',
          remainingMinutes: Math.floor(remaining / 60000)
        });

        if (remaining > 0) {
          // Restore reservation with original start time
          setShowId(storedShowId);
          setSelectedSeats(storedSeats);
          setReservationStartTime(startTime); // Use original start time, not current time
          setTimeRemaining(remaining); // Set remaining time based on elapsed time
          setIsExpired(false);
          hasRestoredRef.current = true;
        } else {
          // Reservation expired, clear it
          console.log('Reservation expired on page load');
          sessionStorage.removeItem('activeReservation');
          handleExpiredReservation(storedShowId, storedSeats);
        }
      } catch (e) {
        console.error('Error loading reservation from sessionStorage:', e);
        sessionStorage.removeItem('activeReservation');
      }
    }
  }, [handleExpiredReservation, reservationStartTime, showId, selectedSeats]);

  // Timer logic
  useEffect(() => {
    // Check cancellation flag from sessionStorage as well (in case of navigation)
    const isCancelledStorage = sessionStorage.getItem('reservationCancelled') === 'true';
    
    // Don't start timer if reservation was cancelled
    if (isCancelledRef.current || isCancelledStorage) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Clear state if cancelled
      if (isCancelledStorage && (showId !== null || selectedSeats.length > 0)) {
        setShowId(null);
        setSelectedSeats([]);
        setReservationStartTime(null);
        setIsExpired(false);
        setTimeRemaining(RESERVATION_DURATION);
      }
      return;
    }
    
    if (reservationStartTime === null) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Calculate initial remaining time
    const elapsed = Date.now() - reservationStartTime;
    const remaining = RESERVATION_DURATION - elapsed;

    if (remaining <= 0) {
      setIsExpired(true);
      setTimeRemaining(0);
      handleExpiredReservation(showId!, selectedSeats);
      return;
    }

    setTimeRemaining(remaining);

    // Start timer
    timerRef.current = setInterval(() => {
      // Check cancellation flag from sessionStorage as well
      const isCancelledStorage = sessionStorage.getItem('reservationCancelled') === 'true';
      
      // Check if cancelled before updating state
      if (isCancelledRef.current || isCancelledStorage) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }
      
      const elapsed = Date.now() - reservationStartTime;
      const remaining = RESERVATION_DURATION - elapsed;

      if (remaining <= 0) {
        setTimeRemaining(0);
        setIsExpired(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        handleExpiredReservation(showId!, selectedSeats);
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000); // Update every second

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [reservationStartTime, showId, selectedSeats, handleExpiredReservation]);

  const startReservation = useCallback((newShowId: number, newSelectedSeats: string[]) => {
    // Reset cancelled flag when starting a new reservation
    isCancelledRef.current = false;
    
    // Clear cancelled flag from sessionStorage
    sessionStorage.removeItem('reservationCancelled');
    
    const startTime = Date.now();
    setShowId(newShowId);
    setSelectedSeats(newSelectedSeats);
    setReservationStartTime(startTime);
    setIsExpired(false);
    setTimeRemaining(RESERVATION_DURATION);

    // Save to sessionStorage
    sessionStorage.setItem('activeReservation', JSON.stringify({
      showId: newShowId,
      selectedSeats: newSelectedSeats,
      startTime
    }));
  }, []);

  // Cancel reservation manually (user-initiated)
  const cancelReservation = useCallback(async () => {
    // Store values before clearing (since we'll clear them)
    const currentShowId = showId;
    const currentSeats = [...selectedSeats];
    
    // CRITICAL: Mark as cancelled FIRST - this prevents all timer updates
    isCancelledRef.current = true;
    sessionStorage.setItem('reservationCancelled', 'true');
    
    // Stop timer IMMEDIATELY - must be synchronous
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Clear sessionStorage to prevent restoration
    sessionStorage.removeItem('activeReservation');
    
    // Clear all state IMMEDIATELY - these are synchronous React state updates
    // Use functional updates to ensure they happen even if state is stale
    setShowId(() => null);
    setSelectedSeats(() => []);
    setReservationStartTime(() => null);
    setIsExpired(() => false);
    setTimeRemaining(() => RESERVATION_DURATION);
    
    console.log('Reservation cancelled - timer stopped and state cleared');
    
    // Then release seats from backend (if we had a reservation)
    // This is async but state is already cleared
    if (currentShowId && currentSeats.length > 0) {
      try {
        // Convert seat display IDs to seat row/number objects
        const seatSelections = currentSeats.map(displayId => {
          const match = displayId.match(/^(\d+)([A-Z]+)$/);
          if (match) {
            return {
              seatRow: match[1],
              seatNumber: match[2]
            };
          }
          return null;
        }).filter(seat => seat !== null);

        if (seatSelections.length > 0) {
          // Release seats from reservation
          await api.post(endpoints.seats.releaseBySelection, {
            showId: currentShowId,
            seats: seatSelections
          });

          console.log('Seats released - reservation cancelled by user');
        }
      } catch (error: any) {
        console.error('Error cancelling reservation:', error);
        // State is already cleared, so we can continue
      }
    }
  }, [showId, selectedSeats]);

  const formatTime = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return (
    <ReservationContext.Provider
      value={{
        showId,
        selectedSeats,
        reservationStartTime,
        timeRemaining,
        isExpired,
        startReservation,
        clearReservation,
        cancelReservation,
        formatTime,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const context = useContext(ReservationContext);
  if (context === undefined) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
}

