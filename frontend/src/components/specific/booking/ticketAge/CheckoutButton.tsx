'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { RxDoubleArrowRight } from 'react-icons/rx';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import styles from '../../../../app/(booking)/booking/ticket-age/ticket-age.module.css';

interface props {
  tickets: number;
  seats: number;
  ticketsByCategory: number[]; // [adult, child, senior]
}

// Continue to Checkout Button: Checks authentication before navigating to checkout
export default function CheckoutButton({ tickets, seats, ticketsByCategory }: props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const { showToast } = useToast();

  const handleContinueToCheckout = () => {
    if (tickets < seats) {
      alert('Please select tickets for all reserved seats');
      return;
    }

    // Get all params to pass to checkout page
    const showId = searchParams.get('showId');
    const seatIds = searchParams.get('seatIds');
    const title = searchParams.get('title') || '';
    const date = searchParams.get('date') || '';
    const time = searchParams.get('time') || '';

    if (!showId || !seatIds) {
      alert('Missing booking information. Please start over.');
      return;
    }

    // Build checkout URL with all necessary params
    const checkoutUrl = `/booking/checkout?showId=${showId}&seatIds=${seatIds}&title=${encodeURIComponent(title)}&date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}&adult=${ticketsByCategory[0]}&child=${ticketsByCategory[1]}&senior=${ticketsByCategory[2]}&seats=${seats}`;

    // Check authentication before navigating
    if (!isLoading && !isAuthenticated) {
      // Not authenticated - redirect to login with checkout URL as redirect parameter
      showToast('Please log in to checkout', 'info');
      router.push(`/auth/login?redirect=${encodeURIComponent(checkoutUrl)}&message=${encodeURIComponent('Please log in to complete your booking')}`);
      return;
    }

    // Authenticated - navigate to checkout
    router.push(checkoutUrl);
  };

  return (
    <div className="py-2 flex flex-row text-xl sm:text-2xl font-semibold text-acm-pink">
      {tickets >= seats ? (
        <div>
          <button
            title="Continue to Checkout"
            type="button"
            onClick={handleContinueToCheckout}
            className={`${styles.checkoutButton} inline-flex items-center gap-2 text-sm cursor-pointer`}
          >
            <span>CHECKOUT</span>
            <span className="text-lg leading-none">
              {' '}
              <RxDoubleArrowRight />{' '}
            </span>
          </button>
        </div>
      ) : (
        <div>
          <button className={`${styles.checkoutButtonDisabled} inline-flex items-center gap-2 text-sm cursor-not-allowed`} disabled>
            <span>CHECKOUT</span>
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
