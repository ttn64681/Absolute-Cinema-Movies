'use client';

import { Suspense } from 'react';
import CheckoutButton from './CheckoutButton';

interface props {
  tickets: number;
  seats: number;
  ticketsByCategory: number[];
}

// Wrapper to handle Suspense for useSearchParams
export default function CheckoutButtonWrapper({ tickets, seats, ticketsByCategory }: props) {
  return (
    <Suspense fallback={
      <div className="py-2 flex flex-row text-xl sm:text-2xl font-semibold text-acm-pink">
        <button className="opacity-50 cursor-not-allowed inline-flex items-center gap-2 text-sm" disabled>
          <span>LOADING...</span>
        </button>
      </div>
    }>
      <CheckoutButton tickets={tickets} seats={seats} ticketsByCategory={ticketsByCategory} />
    </Suspense>
  );
}

