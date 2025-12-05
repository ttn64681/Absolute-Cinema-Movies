'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { buildUrl } from '@/config/api';
import { movieClient } from '@/clients/movieClient';
import { bookingFeeClient, BookingFee } from '@/clients/bookingFeeClient';

interface TicketCategory {
  id: number;
  name: string;
  price: number | string; // Can be number or string from API
}

interface OrderDetailsProps {
  promoDiscount?: number;
  promoType?: 'percentage' | 'fixed';
  onTotalCalculated?: (total: number) => void;
}

export default function OrderDetails({ promoDiscount = 0, promoType, onTotalCalculated }: OrderDetailsProps) {
  const searchParams = useSearchParams();
  const [ticketPrices, setTicketPrices] = useState<{ [key: string]: number }>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isLoadingPoster, setIsLoadingPoster] = useState(false);
  const [onlineFee, setOnlineFee] = useState<number>(2.5); // Default fallback
  const [salesTaxRate, setSalesTaxRate] = useState<number>(0.08); // Default fallback (8%)
  const [isLoadingFees, setIsLoadingFees] = useState(true);

  // Get booking details from URL params
  const title = searchParams.get('title') || '';
  const date = searchParams.get('date') || '';
  const time = searchParams.get('time') || '';
  const seatIds = searchParams.get('seatIds') || '';
  const movieId = searchParams.get('movieId');
  const adultCount = parseInt(searchParams.get('adult') || '0');
  const childCount = parseInt(searchParams.get('child') || '0');
  const seniorCount = parseInt(searchParams.get('senior') || '0');

  // Fetch ticket prices
  useEffect(() => {
    const fetchTicketPrices = async () => {
      try {
        const response = await fetch(buildUrl('/api/ticket-categories'));
        if (!response.ok) throw new Error('Failed to fetch ticket prices');

        const categories: TicketCategory[] = await response.json();
        const prices: { [key: string]: number } = {};

        categories.forEach((cat) => {
          // Handle both number and string price formats
          // The API returns price as a number (BigDecimal serialized as number)
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
            // Fallback - shouldn't happen
            console.error(`Unexpected price type for ${cat.name}:`, typeof cat.price, cat.price);
            priceValue = 0;
          }
          prices[cat.name] = priceValue;
          console.log(
            `Loaded ${cat.name} ticket price: $${priceValue.toFixed(2)} (raw from API: ${JSON.stringify(cat.price)})`
          );
        });

        console.log('All ticket prices loaded:', prices);
        console.log('Adult price specifically:', prices.adult);
        setTicketPrices(prices);
      } catch (error) {
        console.error('Error fetching ticket prices:', error);
        // Set default prices if fetch fails (shouldn't happen, but fallback)
        setTicketPrices({ adult: 12, child: 8, senior: 10 });
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchTicketPrices();
  }, []);

  // Fetch booking fees (online fee and sales tax rate) - only once on mount
  useEffect(() => {
    let isMounted = true;

    const fetchBookingFees = async () => {
      try {
        const fees = await bookingFeeClient.getAllBookingFees();

        if (!isMounted) return;

        fees.forEach((fee: BookingFee) => {
          if (fee.name === 'Online Fee') {
            setOnlineFee(typeof fee.price === 'number' ? fee.price : parseFloat(String(fee.price)) || 2.5);
          } else if (fee.name === 'Sales Tax') {
            setSalesTaxRate(typeof fee.price === 'number' ? fee.price : parseFloat(String(fee.price)) || 0.08);
          }
        });
      } catch (error) {
        console.error('Error fetching booking fees:', error);
        if (isMounted) {
          // Use defaults if fetch fails
          setOnlineFee(2.5);
          setSalesTaxRate(0.08);
        }
      } finally {
        if (isMounted) {
          setIsLoadingFees(false);
        }
      }
    };

    fetchBookingFees();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array - only fetch once

  // Fetch movie poster
  useEffect(() => {
    const fetchMoviePoster = async () => {
      if (!movieId) {
        setIsLoadingPoster(false);
        return;
      }

      setIsLoadingPoster(true);
      try {
        const movie = await movieClient.getMovieById(parseInt(movieId));
        if (movie && movie.poster_link) {
          setPosterUrl(movie.poster_link);
        }
      } catch (error) {
        console.error('Error fetching movie poster:', error);
        setPosterUrl(null);
      } finally {
        setIsLoadingPoster(false);
      }
    };

    fetchMoviePoster();
  }, [movieId]);

  // Calculate totals - use prices from API
  const adultPrice = ticketPrices.adult ?? 0;
  const childPrice = ticketPrices.child ?? 0;
  const seniorPrice = ticketPrices.senior ?? 0;

  // Debug logging
  useEffect(() => {
    if (Object.keys(ticketPrices).length > 0) {
      console.log('Current ticket prices:', ticketPrices);
      console.log(`Adult price: $${adultPrice}, Child: $${childPrice}, Senior: $${seniorPrice}`);
    }
  }, [ticketPrices, adultPrice, childPrice, seniorPrice]);

  const adultSubtotal = adultPrice * adultCount;
  const childSubtotal = childPrice * childCount;
  const seniorSubtotal = seniorPrice * seniorCount;
  const subtotal = adultSubtotal + childSubtotal + seniorSubtotal;

  // Tax (rate from backend)
  const tax = subtotal * salesTaxRate;

  // Online fees (per ticket from backend)
  const totalTickets = adultCount + childCount + seniorCount;
  const onlineFees = totalTickets * onlineFee;

  // Promo discount - ensure promoDiscount is a number
  const numericPromoDiscount =
    typeof promoDiscount === 'number' ? promoDiscount : parseFloat(String(promoDiscount)) || 0;
  let promoDiscountAmount = 0;
  if (numericPromoDiscount > 0 && promoType) {
    if (promoType === 'percentage') {
      promoDiscountAmount = (subtotal + tax + onlineFees) * (numericPromoDiscount / 100);
    } else {
      promoDiscountAmount = numericPromoDiscount;
    }
  }

  // Total after discount
  const totalBeforeDiscount = subtotal + tax + onlineFees;
  const total = Math.max(0, totalBeforeDiscount - promoDiscountAmount);

  // Notify parent of total calculation
  useEffect(() => {
    if (onTotalCalculated && !isLoadingPrices && !isLoadingFees) {
      onTotalCalculated(total);
    }
  }, [total, isLoadingPrices, isLoadingFees, onTotalCalculated]);

  // Build ticket list
  const tickets: Array<{ name: string; price: number }> = [];
  for (let i = 0; i < adultCount; i++) {
    tickets.push({ name: 'adult', price: adultPrice });
  }
  for (let i = 0; i < childCount; i++) {
    tickets.push({ name: 'child', price: childPrice });
  }
  for (let i = 0; i < seniorCount; i++) {
    tickets.push({ name: 'senior', price: seniorPrice });
  }

  if (isLoadingPrices || isLoadingFees) {
    return (
      <div className="p-[3px] rounded-2xl bg-gradient-to-r from-acm-orange to-acm-pink">
        <div className="flex flex-col p-6 bg-black text-white rounded-2xl shadow-md w-full h-full">
          <div className="text-center py-8">Loading prices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-[3px] rounded-2xl bg-gradient-to-r from-acm-orange to-acm-pink">
      <div className="flex flex-col p-6 bg-black text-white rounded-2xl shadow-md w-full h-full">
        <h2 className="text-2xl font-extrabold mb-4">Order Details</h2>

        <div className="flex items-start mb-4">
          <div className="w-20 h-28 bg-gray-800 rounded-md border border-white flex items-center justify-center overflow-hidden relative shrink-0">
            {isLoadingPoster ? (
              <span className="text-gray-400 text-xs">Loading...</span>
            ) : posterUrl ? (
              <Image src={posterUrl} alt={title || 'Movie poster'} fill className="object-cover" sizes="80px" />
            ) : (
              <span className="text-gray-400 text-xs">No Image</span>
            )}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold">{title || 'Sample Movie'}</h3>
            <p className="text-sm">{date || 'Sample Date'}</p>
            <p className="text-sm">{time || 'Sample Time'}</p>
          </div>
        </div>

        <hr className="border-t border-white/20 my-4" />

        <div className="mb-4 px-6">
          <span className="text-white">Seatings: </span>
          <span className="text-white font-bold">{seatIds || 'N/A'}</span>
        </div>

        <hr className="border-t border-white/20 my-4" />

        <div className="space-y-2 mb-4 px-6">
          {tickets.map((ticket, index) => (
            <div key={index} className="flex justify-between text-white text-sm">
              <span className="capitalize">{ticket.name}</span>
              <span>${ticket.price.toFixed(2)}</span>
            </div>
          ))}
        </div>

        <hr className="border-t border-white/20 my-4" />

        <div className="flex justify-between text-white text-sm mb-2 px-6">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-white text-sm mb-2 px-6">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-white text-sm mb-2 px-6">
          <span>Online Fees</span>
          <span>${onlineFees.toFixed(2)}</span>
        </div>
        {numericPromoDiscount > 0 && promoType && (
          <div className="flex justify-between text-green-400 text-sm mb-2 px-6">
            <span>Promo Discount {promoType === 'percentage' ? `(${numericPromoDiscount}%)` : ''}</span>
            <span>-${promoDiscountAmount.toFixed(2)}</span>
          </div>
        )}

        <hr className="border-t border-white/20 my-4" />

        <div className="flex justify-between text-lg font-semibold text-white px-6">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
