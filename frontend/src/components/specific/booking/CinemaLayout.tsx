'use client';

import React from 'react';
import styles from '@/app/(booking)/booking/(seats)/seating.module.css';
import SeatRow from './SeatRow';
import { Seat } from '@/types/booking';

interface CinemaLayoutProps {
  rows: Seat[][];
  selectedSeats: string[];
  onToggleSeat: (seat: Seat) => void;
}

export default function CinemaLayout({ rows, selectedSeats, onToggleSeat }: CinemaLayoutProps) {
  return (
    <div className={styles.cinemaLayout}>
      {/* Screen */}
      <div className={styles.screen}></div>

      {/* Seats */}
      <div>
        {rows.map((rowSeats, index) => {
          const rowNumber = index + 1;
          const isFrontRow = rowNumber <= 2; // Rows 1-2 are front rows
          const isFirstBackRow = rowNumber === 3; // Rows after 3 are back

          return (
            <React.Fragment key={`row-${rowNumber}`}>
              {/* Row gap before back rows */}
              {isFirstBackRow && <div className={styles.rowGap}></div>}
              <SeatRow
                rowNumber={rowNumber}
                seats={rowSeats}
                selectedSeats={selectedSeats}
                onToggleSeat={onToggleSeat}
                isFrontRow={isFrontRow}
              />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
