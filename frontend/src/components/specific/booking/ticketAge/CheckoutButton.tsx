'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RxDoubleArrowRight } from 'react-icons/rx';
import api from '@/config/api';
import { useReservation } from '@/contexts/ReservationContext';
import styles from '../../../../app/(booking)/booking/ticket-age/ticket-age.module.css';

interface props {
  tickets: number;
  seats: number;
  ticketsByCategory: number[]; // [adult, child, senior]
}

// Checkout Button: Creates booking and skips checkout, goes directly to confirmation
export default function CheckoutButton({ tickets, seats, ticketsByCategory }: props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const [showId, setShowId] = useState<string | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]); // Store seat display IDs like "1A", "2B"
  const { clearReservation } = useReservation();

  useEffect(() => {
    const showIdParam = searchParams.get('showId');
    const seatIdsParam = searchParams.get('seatIds'); // This is actually seat display IDs now
    setShowId(showIdParam);
    // Parse seat display IDs (e.g., "1A,2B" -> ["1A", "2B"])
    if (seatIdsParam) {
      setSelectedSeats(seatIdsParam.split(',').filter(id => id.trim().length > 0));
    }
    console.log('CheckoutButton mounted - showId:', showIdParam, 'selectedSeats:', seatIdsParam);
  }, [searchParams]);

  const handleCreateBooking = async () => {
    if (tickets < seats) {
      alert('Please select tickets for all reserved seats');
      return;
    }

    // Clear the reservation timer by navigating (timer will be unmounted)
    // The booking will mark seats as permanently booked, so timer is no longer needed

    // Use state values instead of reading from searchParams directly
    const currentShowId = showId || searchParams.get('showId');

    console.log('CheckoutButton - showId:', currentShowId, 'selectedSeats:', selectedSeats);
    console.log('All searchParams:', Array.from(searchParams.entries()));

    if (!currentShowId || currentShowId === '' || selectedSeats.length === 0) {
      alert(`Missing show or seat information. showId: "${currentShowId}", seats: ${selectedSeats.length}`);
      return;
    }

    setIsCreating(true);

    try {
      // Convert seat display IDs (e.g., "1A", "2B") to seat row/number objects
      const seatSelections = selectedSeats.map(displayId => {
        // Extract row and number from display ID (e.g., "1A" -> row="1", number="A")
        const match = displayId.match(/^(\d+)([A-Z]+)$/);
        if (match) {
          return {
            seatRow: match[1],
            seatNumber: match[2]
          };
        } else {
          throw new Error(`Invalid seat format: ${displayId}`);
        }
      });

      // Create booking request using showId and seat row/number (not seat IDs)
      const bookingRequest = {
        showId: parseInt(currentShowId),
        seats: seatSelections,
        ticketTypes: {
          adult: ticketsByCategory[0] || 0,
          child: ticketsByCategory[1] || 0,
          senior: ticketsByCategory[2] || 0,
        }
      };

      console.log('Sending booking request:', JSON.stringify(bookingRequest, null, 2));
      
      // Create the booking
      const response = await api.post('/api/bookings/create', bookingRequest);
      
      console.log('Booking response:', response.data);

      if (response.data.success) {
        // Clear reservation timer immediately since booking is complete
        // Seats are now permanently booked, so reservation is no longer needed
        clearReservation();
        
        // Small delay to ensure state updates and timer stops before navigation
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Navigate to confirmation page with booking ID
        router.push(`/booking/confirmation?bookingId=${response.data.bookingId}&totalAmount=${response.data.totalAmount}`);
      } else {
        const errorMsg = response.data.error || 'Unknown error';
        console.error('Booking failed:', errorMsg);
        alert('Failed to create booking: ' + errorMsg);
        setIsCreating(false);
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to create booking: ';
      if (error.response?.status === 403) {
        errorMessage += 'Authentication required. Please log in.';
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/auth/login?redirect=/booking/ticket-age');
        }, 2000);
      } else if (error.response?.status === 401) {
        errorMessage += 'Session expired. Please log in again.';
        // Clear invalid tokens
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        // Redirect to login after a short delay
        setTimeout(() => {
          router.push('/auth/login?redirect=/booking/ticket-age');
        }, 2000);
      } else if (error.response?.data?.error) {
        errorMessage += error.response.data.error;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error. Check console for details.';
      }
      
      alert(errorMessage);
      setIsCreating(false);
    }
  };

  return (
    <div className="py-2 flex flex-row text-xl sm:text-2xl font-semibold text-acm-pink">
      {tickets >= seats ? (
        <div>
          <button 
            title="Complete Booking" 
            type="button" 
            onClick={handleCreateBooking}
            disabled={isCreating}
            className={`${styles.checkoutButton} inline-flex items-center gap-2 text-sm ${isCreating ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span>{isCreating ? 'PROCESSING...' : 'COMPLETE BOOKING'}</span>
            <span className="text-lg leading-none">
              {' '}
              <RxDoubleArrowRight />{' '}
            </span>
          </button>
        </div>
      ) : (
        <div>
          <button className={`${styles.checkoutButtonDisabled} inline-flex items-center gap-2 text-sm`} disabled>
            <span>COMPLETE BOOKING</span>
            <span className="text-lg leading-none">
              {' '}
              <RxDoubleArrowRight />{' '}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
