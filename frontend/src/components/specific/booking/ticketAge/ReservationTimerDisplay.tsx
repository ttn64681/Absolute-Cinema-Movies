'use client';

import { useReservation } from '@/contexts/ReservationContext';

export default function ReservationTimerDisplay() {
  const { timeRemaining, isExpired, formatTime, selectedSeats } = useReservation();

  if (isExpired) {
    return (
      <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
        <p className="text-red-400 font-semibold">Reservation Expired</p>
        <p className="text-red-300 text-sm mt-1">Your seats have been released.</p>
      </div>
    );
  }

  if (timeRemaining === 0 || selectedSeats.length === 0) {
    return null;
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

