'use client';

import { useState, useMemo } from 'react';
import { Seat } from '@/types/booking';

export function useSeats() {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // CACHES: seatLetters array ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] - persists across useSeats hook re-runs
  // CHANGES: Never (empty deps) - BUT will recreate if useSeats hook unmounts/remounts
  // WITHOUT useMemo: Array recreated on every useSeats re-render (booking page changes, parent changes)
  // WHY MATTERS: Minimal - array creation is fast, mostly unnecessary optimization
  const seatLetters = useMemo(() => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], []);

  // CACHES: rows array with 50 seat objects - persists across useSeats hook re-runs
  // CHANGES: Never (seatLetters never changes) - BUT will recreate if useSeats hook unmounts/remounts
  // WITHOUT useMemo: 50 objects recreated on every useSeats re-render (booking page changes, parent changes)
  // WHY MATTERS: Moderate - prevents unnecessary object creation, but not "expensive"
  const rows = useMemo(
    () => [
      // Row 1-5: 10 seats each (50 seats total)
      Array.from({ length: 10 }, (_, idx) => ({ id: `1${seatLetters[idx]}`, occupied: false })),
      Array.from({ length: 10 }, (_, idx) => ({ id: `2${seatLetters[idx]}`, occupied: false })),
      Array.from({ length: 10 }, (_, idx) => ({ id: `3${seatLetters[idx]}`, occupied: false })),
      Array.from({ length: 10 }, (_, idx) => ({ id: `4${seatLetters[idx]}`, occupied: false })),
      Array.from({ length: 10 }, (_, idx) => ({ id: `5${seatLetters[idx]}`, occupied: false })),
    ],
    [seatLetters]
  ); // Include seatLetters dependency

  const toggleSeat = (seat: Seat) => {
    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat.id]);
    }
  };

  const resetSeats = () => {
    setSelectedSeats([]);
  };

  return {
    selectedSeats,
    rows,
    toggleSeat,
    resetSeats,
    totalSeats: rows.length * rows[0].length,
  };
}
