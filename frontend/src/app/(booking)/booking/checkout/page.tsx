'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useReservation } from '@/contexts/ReservationContext';
import { useToast } from '@/contexts/ToastContext';
import NavBar from '@/components/common/navBar/NavBar';
import OrderDetails from '@/components/specific/booking/order/OrderDetails';
import CheckoutSections from '@/components/specific/booking/order/CheckoutSections';
import api from '@/config/api';
import { RxDoubleArrowRight } from 'react-icons/rx';

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const { clearReservation } = useReservation();
  const { showToast } = useToast();

  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    showId: '',
    seatIds: '',
    title: '',
    date: '',
    time: '',
    adult: 0,
    child: 0,
    senior: 0,
    seats: 0,
  });

  // Separate effect for authentication check (runs once when auth status is determined)
  useEffect(() => {
    // Check authentication status - if not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      showToast('Please log in to checkout', 'info');
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}&message=${encodeURIComponent('Please log in to complete your booking')}`);
    }
  }, [isAuthenticated, isLoading, router]);

  // Separate effect for loading booking details from URL params
  useEffect(() => {
    // Get booking details from URL params
    const showId = searchParams.get('showId') || '';
    const seatIds = searchParams.get('seatIds') || '';
    const title = searchParams.get('title') || '';
    const date = searchParams.get('date') || '';
    const time = searchParams.get('time') || '';
    const adult = parseInt(searchParams.get('adult') || '0');
    const child = parseInt(searchParams.get('child') || '0');
    const senior = parseInt(searchParams.get('senior') || '0');
    const seats = parseInt(searchParams.get('seats') || '0');

    setBookingDetails({
      showId,
      seatIds,
      title,
      date,
      time,
      adult,
      child,
      senior,
      seats,
    });
  }, [searchParams]);

  const handleCompleteBooking = async () => {
    if (!bookingDetails.showId || !bookingDetails.seatIds) {
      showToast('Missing booking information. Please start over.', 'error');
      return;
    }

    setIsProcessing(true);

    try {
      // Parse seat display IDs (e.g., "1A,2B" -> ["1A", "2B"])
      const selectedSeats = bookingDetails.seatIds.split(',').filter((id) => id.trim().length > 0);

      // Convert seat display IDs to seat row/number objects
      const seatSelections = selectedSeats.map((displayId) => {
        const match = displayId.match(/^(\d+)([A-Z]+)$/);
        if (match) {
          return {
            seatRow: match[1],
            seatNumber: match[2],
          };
        } else {
          throw new Error(`Invalid seat format: ${displayId}`);
        }
      });

      // Create booking request
      const bookingRequest = {
        showId: parseInt(bookingDetails.showId),
        seats: seatSelections,
        ticketTypes: {
          adult: bookingDetails.adult,
          child: bookingDetails.child,
          senior: bookingDetails.senior,
        },
      };

      console.log('Creating booking:', bookingRequest);

      // Create the booking
      const response = await api.post('/api/bookings/create', bookingRequest);

      console.log('Booking response:', response.data);

      if (response.data.success) {
        // Clear reservation timer - booking is complete
        clearReservation();

        showToast('Booking confirmed! Redirecting...', 'success');

        // Small delay for toast visibility
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Navigate to confirmation page
        router.push(
          `/booking/confirmation?bookingId=${response.data.bookingId}&totalAmount=${response.data.totalAmount}`
        );
      } else {
        const errorMsg = response.data.error || 'Unknown error';
        console.error('Booking failed:', errorMsg);
        showToast(`Booking failed: ${errorMsg}`, 'error');
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);

      // Check if it's an authentication error (401 or 403)
      if (error.response?.status === 401 || error.response?.status === 403) {
        const currentPath = window.location.pathname + window.location.search;
        showToast('Please log in to checkout', 'info');
        router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}&message=${encodeURIComponent('Please log in to complete your booking')}`);
        setIsProcessing(false);
        return;
      }

      let errorMessage = 'Failed to create booking';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.userMessage) {
        errorMessage = error.userMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }

      showToast(errorMessage, 'error');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className="flex flex-row gap-8 px-16 py-8">
        <div className="flex-1">
          <CheckoutSections />
        </div>
        <div className="w-96">
          <OrderDetails />
          {/* Complete Booking Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleCompleteBooking}
              disabled={isProcessing}
              className={`inline-flex items-center gap-2 px-8 py-4 rounded-lg font-bold text-lg transition-all ${
                isProcessing
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-acm-pink to-acm-orange text-white hover:brightness-110 cursor-pointer'
              }`}
              title="Complete Booking"
            >
              <span>{isProcessing ? 'PROCESSING...' : 'COMPLETE BOOKING'}</span>
              <span className="text-xl leading-none">
                <RxDoubleArrowRight />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Loading checkout...</div>
        </div>
      }
    >
      <CheckoutPageContent />
    </Suspense>
  );
}
