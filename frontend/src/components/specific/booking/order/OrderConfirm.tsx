'use client';

import { OrderHomeButton, OrderHistoryButton } from "./OrderButtons";

interface OrderConfirmProps {
  email?: string;
  bookingNumber?: string;
  ticketNumbers?: string;
  movieTitle?: string;
  showtime?: string;
  moviePoster?: string;
  tickets?: Array<{ name: string; quantity: number; price: number }>;
  subtotal?: number;
  tax?: number;
  bookingFee?: number;
  paymentMethod?: string;
  orderTotal?: number;
}

function formatPriceWithSmallCents(amount: number, currency: Intl.NumberFormat) {
  const formatted = currency.format(amount);
  const parts = formatted.split('.');
  if (parts.length === 2) {
    return { dollars: parts[0], cents: parts[1] };
  }
  return { dollars: formatted, cents: null };
}

export default function OrderConfirm({
  email = '',
  bookingNumber = '',
  ticketNumbers = '',
  movieTitle = '',
  showtime = '',
  moviePoster,
  tickets = [],
  subtotal = 0,
  tax = 0,
  bookingFee = 0,
  paymentMethod = '',
  orderTotal,
}: OrderConfirmProps) {
  const currency = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const computedTotal = orderTotal ?? subtotal + tax + bookingFee;
  const priceDisplay = formatPriceWithSmallCents(computedTotal, currency);

  return (
    <div className="min-h-screen bg-[#050506] text-white px-6 pt-28 pb-10 lg:px-16">
      <div className="max-w-6xl mx-auto flex flex-col gap-10 lg:flex-row">
        {/* Copy deck */}
        <section className="flex-1">
          <h1 className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-pacifico font-normal text-[#FF478B]">
            Thank You!
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white max-w-2xl">
            Your order has been confirmed. The order confirmation has been sent to your email address{' '}
            <span className="text-white font-semibold">({email})</span>.
          </p>

          <dl className="mt-8 space-y-4">
            <div>
              <dt className="text-white text-lg mb-1">Booking Number:</dt>
              <dd className="text-2xl font-semibold text-[#FF478B]">{bookingNumber}</dd>
            </div>
            <div>
              <dt className="text-white text-lg mb-1">Ticket Numbers:</dt>
              <dd className="text-2xl font-semibold text-[#FF478B]">{ticketNumbers}</dd>
            </div>
          </dl>


          <div className="flex flex-row my-8 gap-x-6">
            <OrderHomeButton />
            <OrderHistoryButton />
          </div>

        </section>

        {/* Summary card */}
        <aside className="w-full lg:w-[420px] flex-shrink-0">
          <div className="bg-[#13131a] border border-white/5 rounded-3xl p-6 shadow-2xl shadow-black/60">
            <header>
              <h2 className="text-2xl font-semibold">Order Summary</h2>
            </header>

            <div className="mt-6 flex gap-4">
              <div className="w-24 h-36 rounded-xl overflow-hidden bg-gray-900 border border-white/5">
                {moviePoster ? (
                  <img src={moviePoster} alt={movieTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">No Image</div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold leading-tight mt-1">{movieTitle}</p>
                <p className="text-white/80 text-sm mt-3">showtime:</p>
                <p className="text-white/80 text-sm mt-3">{showtime}</p>
              </div>
            </div>

            <hr className="border-white/10 my-6" />

            <div>
              <ul className="space-y-2 text-sm">
                {tickets.map((ticket) => (
                  <li key={ticket.name} className="flex justify-between text-white/90">
                    <span>{ticket.name} x{ticket.quantity}</span>
                    <span>{currency.format(ticket.price * ticket.quantity)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 space-y-2 text-sm text-white/70">
              {/* TODO: Get these values from database */}
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{currency.format(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{currency.format(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Booking fee</span>
                <span>{currency.format(bookingFee)}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col items-end">
              <div className="text-right">
                <p className="text-sm text-white/60">Order total</p>
                <p className="text-4xl font-black mt-1">
                  {priceDisplay.cents ? (
                    <>
                      {priceDisplay.dollars}
                      <span className="text-2xl">.{priceDisplay.cents}</span>
                    </>
                  ) : (
                    priceDisplay.dollars
                  )}
                </p>
                <p className="text-xs uppercase tracking-wide text-white/40 mt-4 mb-1">Payment method</p>
                <p className="font-semibold text-white">{paymentMethod}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

