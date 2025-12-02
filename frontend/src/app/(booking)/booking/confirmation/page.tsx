"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import NavBar from '@/components/common/navBar/NavBar';
import OrderConfirm from '@/components/specific/booking/order/OrderConfirm';
import { useReservation } from '@/contexts/ReservationContext';
import { useAuth } from '@/contexts/AuthContext';
import { movieClient } from '@/clients/movieClient';
import { formatPaymentMethod } from '@/utils/payment';
import { TICKET_PRICES, TAX_RATE, BOOKING_FEE, generateTicketIds } from '@/utils/booking';

function ConfirmationPageContent() {
  const searchParams = useSearchParams();
  const { clearReservation } = useReservation();
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState<{
    bookingId: string;
    totalAmount: number;
    movieTitle: string;
    moviePoster?: string;
    adultCount: number;
    childCount: number;
    seniorCount: number;
    paymentMethod: string;
    billingEmail: string;
    totalTickets: number;
    ticketIds: string[];
  } | null>(null);

  // Parse URL params at top level
  const bookingId = searchParams.get('bookingId');
  
  // TODO: When GET /api/bookings/{bookingId} endpoint is created, fetch booking data from backend
  // For now, fallback to URL params for backward compatibility during transition
  const totalAmountParam = searchParams.get('totalAmount');
  const titleParam = searchParams.get('title');
  const timeParam = searchParams.get('time');
  const adultParam = searchParams.get('adult');
  const childParam = searchParams.get('child');
  const seniorParam = searchParams.get('senior');
  const seatsParam = searchParams.get('seats');
  const totalTicketsParam = searchParams.get('totalTickets');
  const ticketIdsParam = searchParams.get('ticketIds');
  const cardTypeParam = searchParams.get('cardType');
  const cardNumberParam = searchParams.get('cardNumber');
  const billingEmailParam = searchParams.get('billingEmail');
  const movieIdParam = searchParams.get('movieId');

  // Clear reservation on mount
  useEffect(() => {
    clearReservation();
  }, [clearReservation]);

  // Load booking data
  useEffect(() => {
    if (!bookingId) return;
    
    // TODO: Replace with backend API call when GET /api/bookings/{bookingId} is available
    // const booking = await bookingClient.getBookingById(bookingId);
    // For now, use URL params as fallback
    if (!totalAmountParam) {
      console.warn('Missing booking data in URL. Backend GET endpoint needed.');
      return;
    }

    const adultCount = parseInt(adultParam || '0', 10) || 0;
    const childCount = parseInt(childParam || '0', 10) || 0;
    const seniorCount = parseInt(seniorParam || '0', 10) || 0;
    
    const totalTickets = parseInt(seatsParam || '0', 10) || 
      parseInt(totalTicketsParam || '0', 10) || 
      (adultCount + childCount + seniorCount) || 
      0;
    
    const ticketIds = ticketIdsParam
      ? ticketIdsParam.split(',').filter(id => id.trim().length > 0)
      : generateTicketIds(totalTickets);

    setBookingData({
      bookingId,
      totalAmount: parseFloat(totalAmountParam),
      movieTitle: titleParam || 'Movie Title',
      adultCount,
      childCount,
      seniorCount,
      paymentMethod: formatPaymentMethod(cardTypeParam, cardNumberParam),
      billingEmail: billingEmailParam || user?.email || '',
      totalTickets,
      ticketIds,
    });
  }, [bookingId, totalAmountParam, titleParam, adultParam, childParam, seniorParam, seatsParam, 
    totalTicketsParam, ticketIdsParam, cardTypeParam, cardNumberParam, billingEmailParam, user?.email]);

  // Fetch movie poster separately
  useEffect(() => {
    if (!movieIdParam || !bookingData) return;
    
    movieClient
      .getMovieById(parseInt(movieIdParam, 10))
      .then((movie) => {
        setBookingData((prev) => (prev ? { ...prev, moviePoster: movie.poster_link } : null));
      })
      .catch((error) => {
        console.error('Error fetching movie poster:', error);
      });
  }, [movieIdParam, bookingData?.bookingId]);

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-black">
        <NavBar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  // Build tickets array
  const tickets: Array<{ name: string; quantity: number; price: number }> = [];
  if (bookingData.adultCount > 0) {
    tickets.push({ name: 'Adult ticket', quantity: bookingData.adultCount, price: TICKET_PRICES.adult });
  }
  if (bookingData.childCount > 0) {
    tickets.push({ name: 'Child ticket', quantity: bookingData.childCount, price: TICKET_PRICES.child });
  }
  if (bookingData.seniorCount > 0) {
    tickets.push({ name: 'Senior ticket', quantity: bookingData.seniorCount, price: TICKET_PRICES.senior });
  }

  // Calculate breakdown from ticket data
  const subtotal = tickets.reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0);
  const tax = subtotal * TAX_RATE;

  // Format showtime during render (derived data, not state)
  const showtime = timeParam ? `Sat · Oct 1 ${timeParam}` : 'Sat · Oct 1';

  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <OrderConfirm
        email={bookingData.billingEmail}
        bookingNumber={bookingData.bookingId}
        ticketNumbers={bookingData.ticketIds.join(', ')}
        movieTitle={bookingData.movieTitle}
        showtime={showtime}
        moviePoster={bookingData.moviePoster}
        tickets={tickets}
        subtotal={subtotal}
        tax={tax}
        bookingFee={BOOKING_FEE}
        paymentMethod={bookingData.paymentMethod}
        orderTotal={bookingData.totalAmount}
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
