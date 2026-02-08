'use client';
import { useState } from 'react';
import { IoAdd, IoRemove } from 'react-icons/io5';
import styles from '../../../../app/(booking)/booking/ticket-age/ticket-age.module.css';

interface props {
  index: number;
  ticketsByCategory: number[];
  currentlySelected: number;
  maxTickets: number;
  onCountChange: (count: number) => void;
}

// Ticket counter component
export default function TicketCounter({
  index,
  ticketsByCategory,
  currentlySelected,
  maxTickets,
  onCountChange,
}: props) {
  // Currently selected tickets for the category
  const [ticketCount, setTicketCount] = useState(ticketsByCategory[index]);

  // Add 1 ticket when the user clicks +
  const increment = () => {
    // Only allow an increase if the total # of selected tickets (across all 3 categories) is less than the # of reserved seats
    if (currentlySelected + 1 <= maxTickets) {
      setTicketCount(ticketCount + 1); // Update counter display for this category
      onCountChange(1); // Add 1 to the total # of selected tickets
    }
  };

  // Subtract 1 ticket when the user clicks -
  const decrement = () => {
    if (ticketCount > 0) {
      setTicketCount(ticketCount - 1); // Update counter display for this category
      onCountChange(-1); // Substract 1 from the total # of total tickets
    }
  };

  return (
    <div className="text-xl flex flex-row items-center text-white gap-3">
      <button
        onClick={decrement}
        title="Decrease"
        type="button"
        className={styles.btnCounter}
        disabled={ticketCount <= 0}
      >
        <IoRemove />
      </button>

      <div className={styles.counterDisplay}>
        <span>{ticketCount}</span>
      </div>

      <button
        onClick={increment}
        title="Increase"
        type="button"
        className={styles.btnCounter}
        disabled={currentlySelected >= maxTickets}
      >
        <IoAdd />
      </button>
    </div>
  );
}
