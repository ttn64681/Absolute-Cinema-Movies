'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api, { endpoints } from '@/config/api';

interface ReservationTimerProps {
  showId: number;
  selectedSeats: string[]; // Seat display IDs like "1A", "2B"
  onTimerExpired: () => void;
}

const RESERVATION_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

export default function ReservationTimer({ showId, selectedSeats, onTimerExpired }: ReservationTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(RESERVATION_DURATION);
  const [isExpired, setIsExpired] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const router = useRouter();

  useEffect(() => {
    // Start the timer when component mounts
    startTimeRef.current = Date.now();
    
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = RESERVATION_DURATION - elapsed;
      
      if (remaining <= 0) {
        setTimeRemaining(0);
        setIsExpired(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        handleTimerExpired();
      } else {
        setTimeRemaining(remaining);
      }
    }, 1000); // Update every second

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleTimerExpired = async () => {
    try {
      // Convert seat display IDs to seat row/number objects
      const seatSelections = selectedSeats.map(displayId => {
        const match = displayId.match(/^(\d+)([A-Z]+)$/);
        if (match) {
          return {
            seatRow: match[1],
            seatNumber: match[2]
          };
        }
        return null;
      }).filter(seat => seat !== null);

      if (seatSelections.length === 0) {
        console.error('No valid seats to release');
        return;
      }

      // Release seats from reservation
      await api.post(endpoints.seats.releaseBySelection, {
        showId: showId,
        seats: seatSelections
      });

      console.log('Seats released due to timer expiration');
      onTimerExpired();
      
      // Redirect back to seats page with showId if available
      const showIdParam = showId ? `?showId=${showId}&expired=true` : '?expired=true';
      router.push(`/booking${showIdParam}`);
    } catch (error: any) {
      console.error('Error releasing seats:', error);
      // Still call onTimerExpired to update UI
      onTimerExpired();
    }
  };

  // Format time as MM:SS
  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Clear timer (called when user completes booking)
  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Expose clearTimer function via ref (will be called from parent)
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  if (isExpired) {
    return (
      <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
        <p className="text-red-400 font-semibold">Reservation Expired</p>
        <p className="text-red-300 text-sm mt-1">Your seats have been released.</p>
      </div>
    );
  }

  const minutes = Math.floor(timeRemaining / 60000);
  const seconds = Math.floor((timeRemaining % 60000) / 1000);
  const isWarning = minutes < 2; // Show warning when less than 2 minutes remain

  return (
    <div className={`border rounded-lg p-4 text-center transition-colors ${
      isWarning 
        ? 'bg-red-500/20 border-red-500' 
        : 'bg-yellow-500/20 border-yellow-500'
    }`}>
      <p className={`font-semibold ${isWarning ? 'text-red-400' : 'text-yellow-400'}`}>
        Reservation Timer
      </p>
      <p className={`text-2xl font-bold mt-2 ${isWarning ? 'text-red-300' : 'text-yellow-300'}`}>
        {formatTime(timeRemaining)}
      </p>
      <p className="text-sm text-white/60 mt-1">
        Complete your booking before time runs out
      </p>
    </div>
  );
}

