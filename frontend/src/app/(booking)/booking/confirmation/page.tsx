"use client";

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import NavBar from '@/components/common/navBar/NavBar';
import Link from 'next/link';
import { useReservation } from '@/contexts/ReservationContext';

function ConfirmationPageContent() {
  const searchParams = useSearchParams();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState<string | null>(null);
  const { clearReservation } = useReservation();

  useEffect(() => {
    const bookingIdParam = searchParams.get('bookingId');
    const totalAmountParam = searchParams.get('totalAmount');
    
    if (bookingIdParam) setBookingId(bookingIdParam);
    if (totalAmountParam) setTotalAmount(totalAmountParam);
    
    // Clear any remaining reservation when confirmation page loads
    // Booking is complete, so reservation timer should stop
    clearReservation();
  }, [searchParams, clearReservation]);

  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      
      <div className="pt-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="bg-white/5 backdrop-blur-md border border-green-500/30 rounded-xl p-8 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-green-400 mb-2">Booking Confirmed!</h1>
              <p className="text-white/80">Your tickets have been successfully booked.</p>
            </div>

            {/* Booking Details */}
            {bookingId && (
              <div className="mt-6 p-6 bg-white/5 rounded-lg border border-white/10">
                <div className="space-y-3 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-white/60">Booking ID:</span>
                    <span className="text-white font-semibold">#{bookingId}</span>
                  </div>
                  {totalAmount && (
                    <div className="flex justify-between items-center">
                      <span className="text-white/60">Total Amount:</span>
                      <span className="text-acm-pink font-bold text-xl">${parseFloat(totalAmount).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/movies">
                <button className="px-6 py-3 bg-acm-pink hover:bg-acm-pink/80 text-white rounded-lg font-semibold transition-colors">
                  Browse More Movies
                </button>
              </Link>
              <Link href="/user/orders">
                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-semibold transition-colors border border-white/20">
                  View My Orders
                </button>
              </Link>
            </div>

            {/* Info Message */}
            <div className="mt-6 text-sm text-white/60">
              <p>A confirmation email has been sent to your registered email address.</p>
              <p className="mt-2">Please arrive at least 15 minutes before the show time.</p>
            </div>
          </div>
        </div>
      </div>
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
