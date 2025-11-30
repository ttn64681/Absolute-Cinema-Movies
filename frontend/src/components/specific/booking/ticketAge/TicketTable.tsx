'use client';
import React, { useState, useEffect } from 'react';
import TicketCounter from '@/components/specific/booking/ticketAge/TicketCounter';
import CheckoutButtonWrapper from '@/components/specific/booking/ticketAge/CheckoutButtonWrapper';
import { buildUrl } from '@/config/api';

interface props {
  reservedSeats: number;
}

interface TicketCategory {
  id: number;
  name: string;
  price: number | string;
}

export default function TicketTable({ reservedSeats }: props) {
  const [ticketsByCategory, setTicketsByCategory] = useState([0, 0, 0]); // Currently selected tickets for each category of ticket (0-adult, 1-child, 2-senior)
  const [totalTickets, setTotalTickets] = useState(0); // Total selected tickets
  const [ticketPrices, setTicketPrices] = useState<{ [key: string]: number }>({});
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  // Fetch ticket prices from API
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
        // Fallback to API prices if fetch fails
        setTicketPrices({ adult: 12, child: 8, senior: 10 });
      } finally {
        setIsLoadingPrices(false);
      }
    };

    fetchTicketPrices();
  }, []);

  // useState function to update the selected ticket totals
  const updateSelectedTickets = (index: number, count: number) => {
    const newCounts = [...ticketsByCategory]; // Make a copy of the ticket totals
    newCounts[index] = newCounts[index] + count; // Add the change to the category total
    const currentTotal = totalTickets + count; // Add the change to the overall total

    setTicketsByCategory(newCounts);
    setTotalTickets(currentTotal);
  };

  // Calculate the total price of all tickets the user has selected using prices from API
  function calculatePrice() {
    const adultPrice = ticketPrices.adult || 0;
    const childPrice = ticketPrices.child || 0;
    const seniorPrice = ticketPrices.senior || 0;
    
    const price = (ticketsByCategory[0] * adultPrice) + 
                  (ticketsByCategory[1] * childPrice) + 
                  (ticketsByCategory[2] * seniorPrice);
    return price;
  }

  // Return the price (number) as a string in USD format
  function formatPriceString(price: number) {
    const dollarFormat = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumIntegerDigits: 1,
      minimumFractionDigits: 2,
    }).format(price);
    return dollarFormat;
  }

  // Used to stop adding extra digits to the price from bumping other UI elements.
  // If there are only 3 digits in the price, an extra invisible character is added.
  function padString(price: number) {
    if (price < 10) {
      return '$$';
    } else if (price < 100) {
      return '$';
    }
  }

  return (
    <div className="mt-6">
      <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
        {/* Header row */}
        <div className="grid grid-cols-4 items-center px-4 py-3 text-white/80 text-base sm:text-lg font-semibold border-b border-white/10">
          <div>Ticket</div>
          <div className="text-center">Quantity</div>
          <div className="text-right">Price</div>
          <div></div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-white/10">
          <div className="grid grid-cols-4 items-center px-4 py-3 sm:py-4 text-white">
            <div className="text-sm sm:text-base">Adult</div>
            <div className="flex justify-center">
              <TicketCounter
                index={0}
                maxTickets={reservedSeats}
                ticketsByCategory={ticketsByCategory}
                currentlySelected={totalTickets}
                onCountChange={(count) => updateSelectedTickets(0, count)}
              />
            </div>
            <div className="text-right text-sm sm:text-base">
              {isLoadingPrices ? 'Loading...' : formatPriceString(ticketPrices.adult || 0)}
            </div>
            <div></div>
          </div>

          <div className="grid grid-cols-4 items-center px-4 py-3 sm:py-4 text-white">
            <div className="text-sm sm:text-base">Child</div>
            <div className="flex justify-center">
              <TicketCounter
                index={1}
                maxTickets={reservedSeats}
                ticketsByCategory={ticketsByCategory}
                currentlySelected={totalTickets}
                onCountChange={(count) => updateSelectedTickets(1, count)}
              />
            </div>
            <div className="text-right text-sm sm:text-base">
              {isLoadingPrices ? 'Loading...' : formatPriceString(ticketPrices.child || 0)}
            </div>
            <div></div>
          </div>

          <div className="grid grid-cols-4 items-center px-4 py-3 sm:py-4 text-white">
            <div className="text-sm sm:text-base">Senior</div>
            <div className="flex justify-center">
              <TicketCounter
                index={2}
                maxTickets={reservedSeats}
                ticketsByCategory={ticketsByCategory}
                currentlySelected={totalTickets}
                onCountChange={(count) => updateSelectedTickets(2, count)}
              />
            </div>
            <div className="text-right text-sm sm:text-base">
              {isLoadingPrices ? 'Loading...' : formatPriceString(ticketPrices.senior || 0)}
            </div>
            <div></div>
          </div>
        </div>

        {/* Footer / totals */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="grid grid-cols-4 items-center gap-2 mb-4">
            <div className="text-lg sm:text-xl font-semibold text-acm-pink">Total</div>
            <div className="text-center text-lg sm:text-xl text-acm-pink">
              {totalTickets} / {reservedSeats}
            </div>
            <div className="text-right text-2xl sm:text-3xl font-extrabold text-acm-pink leading-none">
              <span className="invisible">{padString(calculatePrice())}</span>
              <span>{formatPriceString(calculatePrice())}</span>
            </div>
            <div></div>
          </div>
          <div className="flex justify-end">
            <CheckoutButtonWrapper tickets={totalTickets} seats={reservedSeats} ticketsByCategory={ticketsByCategory} />
          </div>
        </div>
      </div>
    </div>
  );
}
