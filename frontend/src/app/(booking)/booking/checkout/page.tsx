'use client';

import { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useReservation } from '@/contexts/ReservationContext';
import { useToast } from '@/contexts/ToastContext';
import NavBar from '@/components/common/navBar/NavBar';
import CheckoutSections from '@/components/specific/booking/order/CheckoutSections';
import OrderDetails from '@/components/specific/booking/order/OrderDetails';
import api from '@/config/api';

const checkoutSteps = [
  { number: 1, label: 'Billing Address' },
  { number: 2, label: 'Payment' },
  { number: 3, label: 'Promo Code' },
  { number: 4, label: 'Review' },
];

function CheckoutPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { clearReservation } = useReservation();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<{
    discount: number;
    type: 'percentage' | 'fixed';
    promotionId: number;
  } | null>(null);
  const [finalTotal, setFinalTotal] = useState<number | null>(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const bookingCreatedRef = useRef(false);

  // Separate effect for authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      showToast('Please log in to checkout', 'info');
      router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}&message=${encodeURIComponent('Please log in to complete your booking')}`);
    }
  }, [isAuthenticated, isLoading, router, showToast]);

  // Create booking on mount if details are available (only once)
  useEffect(() => {
    const showId = searchParams.get('showId');
    const seatIds = searchParams.get('seatIds');
    if (showId && seatIds && !bookingId && !isCreatingBooking && !bookingCreatedRef.current && isAuthenticated && !isLoading) {
      bookingCreatedRef.current = true;
      createBooking();
    }
  }, [searchParams, bookingId, isAuthenticated, isLoading, isCreatingBooking]);

  const createBooking = async () => {
    const showId = searchParams.get('showId') || '';
    const seatIds = searchParams.get('seatIds') || '';
    const adult = parseInt(searchParams.get('adult') || '0');
    const child = parseInt(searchParams.get('child') || '0');
    const senior = parseInt(searchParams.get('senior') || '0');

    if (!showId || !seatIds || bookingId || isCreatingBooking) {
      return;
    }

    setIsCreatingBooking(true);
    try {
      const selectedSeats = seatIds.split(',').filter((id) => id.trim().length > 0);
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

      const bookingRequest = {
        showId: parseInt(showId),
        seats: seatSelections,
        ticketTypes: {
          adult: adult,
          child: child,
          senior: senior,
        },
      };

      const response = await api.post('/api/bookings/create', bookingRequest);
      if (response.data.success) {
        setBookingId(response.data.bookingId);
      } else {
        showToast(`Failed to create booking: ${response.data.error || 'Unknown error'}`, 'error');
      }
    } catch (error: any) {
      console.error('Error creating booking:', error);
      showToast('Failed to create booking. Please try again.', 'error');
    } finally {
      setIsCreatingBooking(false);
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
    <div className="min-h-screen bg-black">
      <NavBar />

      <div className="w-full flex flex-row gap-6 px-8 pt-28 items-start">
        <div className="flex-1 flex flex-col">
          <StepTracker steps={checkoutSteps} currentStep={currentStep} />
          <CheckoutSections
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            bookingId={bookingId}
            finalTotalAmount={finalTotal}
            onPromoApplied={(discount, type, promotionId) => {
              setAppliedPromo({ discount, type, promotionId });
            }}
            onPaymentComplete={() => {
              clearReservation();
              showToast('Payment completed! Redirecting...', 'success');
              setTimeout(() => {
                router.push(`/booking/confirmation?bookingId=${bookingId}&totalAmount=${finalTotal || 0}`);
              }, 500);
            }}
          />
        </div>

        <div className="w-96 flex-shrink-0 flex flex-col">
          <div className="w-full pb-6">
            <div className="max-w-4xl mx-auto invisible pointer-events-none">
              <StepTracker steps={checkoutSteps} currentStep={currentStep} ghost />
            </div>
          </div>
          <OrderDetails
            promoDiscount={appliedPromo?.discount || 0}
            promoType={appliedPromo?.type}
            onTotalCalculated={setFinalTotal}
          />
        </div>
      </div>
    </div>
  );
}

type Step = { number: number; label: string };

interface StepTrackerProps {
  steps: Step[];
  currentStep: number;
}

function StepTracker({ steps, currentStep }: StepTrackerProps) {
  return (
    <div className="w-full pb-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-4 items-center gap-0">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center justify-center relative">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg transition-colors relative z-10 ${
                    currentStep >= step.number ? 'bg-white text-black' : 'bg-black border-2 border-white text-white'
                  }`}
                >
                  {step.number}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className="absolute left-full top-1/2 -translate-y-1/2 w-full flex items-center"
                  style={{ width: 'calc(100% - 3rem)', left: 'calc(50% + 1.5rem)' }}
                >
                  <div className="w-full h-1 bg-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center mt-2">
          {steps.map((step) => {
            const labelColor = currentStep >= step.number ? 'text-white' : 'text-white/60';
            return (
              <div key={step.number} className="flex-1 text-center">
                <span className={`text-sm ${labelColor}`}>{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
        </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
}
