'use client';

import { useState, useMemo } from 'react';
import { Seat } from '@/types/booking';

export function useSeats(capacity: number = 70) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // CACHES: seatLetters array ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] - persists across useSeats hook re-runs
  // CHANGES: Never (empty deps) - BUT will recreate if useSeats hook unmounts/remounts
  // WITHOUT useMemo: Array recreated on every useSeats re-render (booking page changes, parent changes)
  // WHY MATTERS: Minimal - array creation is fast, mostly unnecessary optimization
  const seatLetters = useMemo(() => ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], []);

  // CACHES: rows array dynamically generated based on capacity - persists across useSeats hook re-runs
  // CHANGES: When capacity changes - BUT will recreate if useSeats hook unmounts/remounts
  // WITHOUT useMemo: Objects recreated on every useSeats re-render (booking page changes, parent changes)
  // WHY MATTERS: Moderate - prevents unnecessary object creation, but not "expensive"
  // Calculate number of rows: capacity / 10 seats per row
  const rows = useMemo(
    () => {
      const seatsPerRow = 10;
      const numRows = Math.floor(capacity / seatsPerRow);
      
      return Array.from({ length: numRows }, (_, rowIdx) => {
        const rowNumber = rowIdx + 1;
        return Array.from({ length: seatsPerRow }, (_, seatIdx) => ({
          id: `${rowNumber}${seatLetters[seatIdx]}`,
          occupied: false,
        }));
      });
    },
    [seatLetters, capacity]
  ); // Include seatLetters and capacity dependencies

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
    totalSeats: capacity,
  };
}
