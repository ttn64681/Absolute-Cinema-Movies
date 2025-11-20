"use client";
import React, { useState, useEffect, Suspense } from "react"; 
import { useRouter, useSearchParams } from 'next/navigation';

import NavBar from "@/components/common/navBar/NavBar";
import TicketTable from "@/components/specific/booking/ticketAge/TicketTable";
import PromoBanner from "@/components/common/promos/PromoBanner";
import { useReservation } from "@/contexts/ReservationContext";

function TicketAgePageContent() {
    const router = useRouter(); 
    const searchParams = useSearchParams(); 

    // Get the # of seats from the booking page
    const [reservedSeats, setReservedSeats] = useState(Number(searchParams.get('seats')) || 0);
    const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
    const [showId, setShowId] = useState<number | null>(null);
    const title = searchParams.get('title') || '';
    const date = searchParams.get('date') || '';
    const time = searchParams.get('time') || '';
    
    // Reservation context
    const { isExpired: timerExpired, showId: reservationShowId, startReservation } = useReservation();

    useEffect(() => {
        const reservedSeats = searchParams.get('seats');
        const seatIds = searchParams.get('seatIds');
        const showIdParam = searchParams.get('showId');

        if (reservedSeats) setReservedSeats(Number(reservedSeats));
        if (seatIds) setSelectedSeatIds(seatIds.split(','));
        if (showIdParam) {
            const parsedShowId = parseInt(showIdParam);
            setShowId(parsedShowId);
            // If we have seats and showId but no active reservation, start one
            // BUT: Don't start if reservation was cancelled (check sessionStorage)
            const isCancelled = sessionStorage.getItem('reservationCancelled') === 'true';
            if (seatIds && parsedShowId && !reservationShowId && !isCancelled) {
                startReservation(parsedShowId, seatIds.split(','));
            }
        }
    }, [searchParams, reservationShowId, startReservation]);

    const goBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-black">
            <NavBar />

            <div className="pt-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between">
                        {/* Back Button */}
                        <button
                            type='button'
                            onClick={goBack}
                            className="bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 text-white hover:text-acm-pink transition-all duration-200 flex items-center gap-2 border border-white/20 hover:border-acm-pink/50"
                            title="Back"
                        >
                          <span>←</span>
                          <span>Back</span>
                        </button>
                    </div>
                    <div className="mt-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                        <h1 className="text-2xl sm:text-3xl font-bold text-acm-pink">Ticket Selection{title ? ` for "${title}"` : ''}</h1>
                        <p className="text-sm sm:text-base text-white/80 mt-1">{date && time ? `${date} • ${time}` : 'Choose tickets for each seat you reserved.'}</p>
                        {selectedSeatIds.length > 0 && (
                            <p className="text-sm text-white/60 mt-2">
                                Selected Seats: <span className="text-acm-orange font-semibold">{selectedSeatIds.join(', ')}</span>
                            </p>
                        )}
                    </div>

                    {timerExpired && (
                        <div className="mt-4 bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
                            <p className="text-red-400 font-semibold">Your reservation has expired</p>
                            <p className="text-red-300 text-sm mt-1">Please select your seats again.</p>
                            <button
                                onClick={() => router.back()}
                                className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                            >
                                Go Back to Seats
                            </button>
                        </div>
                    )}

                    {!timerExpired && (
                        <div className="mt-6">
                            <TicketTable reservedSeats={reservedSeats} />
                        </div>
                    )}
                </div>
            </div>



            <PromoBanner 
              title="Limited-Time Discount: Save 20% on your order"
              description="Apply your discount now to lock it in at checkout."
              buttonText="Apply Now!"
              buttonHref="/booking/checkout"
            />
        </div>
    );
}

export default function TicketAgePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <TicketAgePageContent />
    </Suspense>
  );
}