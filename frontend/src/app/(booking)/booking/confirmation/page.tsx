"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import NavBar from '@/components/common/navBar/NavBar';
import OrderConfirm from '@/components/specific/booking/order/OrderConfirm';
import { useReservation } from '@/contexts/ReservationContext';
import { useAuth } from '@/contexts/AuthContext';
import { bookingClient, BookingDetailsResponse } from '@/clients/bookingClient';
import { buildUrl } from '@/config/api';
import { TAX_RATE, BOOKING_FEE } from '@/utils/booking';

interface TicketCategory {
  id: number;
  name: string;
  price: number | string;
}

function ConfirmationPageContent() {
  const searchParams = useSearchParams();
  const { clearReservation } = useReservation();
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState<BookingDetailsResponse | null>(null);
  const [ticketPrices, setTicketPrices] = useState<{ [key: string]: number }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Parse URL params
  const bookingIdParam = searchParams.get('bookingId');

  // Clear reservation on mount
  useEffect(() => {
    clearReservation();
  }, [clearReservation]);

  // Fetch ticket prices
  useEffect(() => {
    const fetchTicketPrices = async () => {
      try {
        const response = await fetch(buildUrl('/api/ticket-categories'));
        if (!response.ok) throw new Error('Failed to fetch ticket prices');
        
        const categories: TicketCategory[] = await response.json();
        const prices: { [key: string]: number } = {};
        
        categories.forEach((cat) => {
          let priceValue: number;
          if (typeof cat.price === 'number') {
            priceValue = cat.price;
          } else if (typeof cat.price === 'string') {
            priceValue = parseFloat(cat.price);
            if (isNaN(priceValue)) {
              console.error(`Invalid price for ${cat.name}: ${cat.price}`);
              priceValue = 0;
            }
          } else {
            priceValue = 0;
          }
          prices[cat.name] = priceValue;
        });
        
        setTicketPrices(prices);
      } catch (error) {
        console.error('Error fetching ticket prices:', error);
        // Set default prices if fetch fails
        setTicketPrices({ adult: 12, child: 8, senior: 10 });
      }
    };

    fetchTicketPrices();
  }, []);

  // Fetch booking data from backend
  useEffect(() => {
    if (!bookingIdParam) {
      setError('Booking ID is required');
      setIsLoading(false);
      return;
    }

    const fetchBookingData = async () => {
      try {
        setIsLoading(true);
        const bookingId = parseInt(bookingIdParam, 10);
        if (isNaN(bookingId)) {
          throw new Error('Invalid booking ID');
        }

        const booking = await bookingClient.getBookingById(bookingId);
        setBookingData(booking);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching booking data:', err);
        setError(err.message || 'Failed to load booking details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingData();
  }, [bookingIdParam]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <NavBar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-black">
        <NavBar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">{error || 'Booking not found'}</div>
        </div>
      </div>
    );
  }

  // Build tickets array using actual prices from API
  const tickets: Array<{ name: string; quantity: number; price: number }> = [];
  const adultPrice = ticketPrices.adult ?? 0;
  const childPrice = ticketPrices.child ?? 0;
  const seniorPrice = ticketPrices.senior ?? 0;

  if (bookingData.ticketCounts.adult > 0) {
    tickets.push({ name: 'Adult ticket', quantity: bookingData.ticketCounts.adult, price: adultPrice });
  }
  if (bookingData.ticketCounts.child > 0) {
    tickets.push({ name: 'Child ticket', quantity: bookingData.ticketCounts.child, price: childPrice });
  }
  if (bookingData.ticketCounts.senior > 0) {
    tickets.push({ name: 'Senior ticket', quantity: bookingData.ticketCounts.senior, price: seniorPrice });
  }

  // Calculate breakdown from ticket data
  const subtotal = tickets.reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0);
  const tax = subtotal * TAX_RATE;

  // Format showtime - use actual date/time from backend
  const showtime = bookingData.showDate && bookingData.showTime 
    ? `${bookingData.showDate} · ${bookingData.showTime}`
    : bookingData.showTime || 'TBD';

  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <OrderConfirm
        email={user?.email || ''}
        bookingNumber={bookingData.bookingId.toString()}
        ticketNumbers={bookingData.seats.join(', ')}
        movieTitle={bookingData.movieTitle}
        showtime={showtime}
        moviePoster={bookingData.moviePosterUrl}
        tickets={tickets}
        subtotal={subtotal}
        tax={tax}
        bookingFee={BOOKING_FEE}
        paymentMethod={bookingData.paymentMethod}
        orderTotal={Number(bookingData.totalAmount)}
      />
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <ConfirmationPageContent />
    </Suspense>
  );
}
