'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import NavBar from '@/components/common/navBar/NavBar';
import { useProfile } from '@/contexts/ProfileContext';
import { useUserId } from '@/hooks/useUserId';
import { useOrders } from '@/hooks/useOrders';
import { OrderRow } from '@/types/order';
import UserProfileSidebar from '@/components/specific/user/UserProfileSidebar';
import UserNavTabs from '@/components/specific/user/UserNavTabs';

export default function OrdersPage() {
  const { profilePicUrl } = useProfile();
  const { userId } = useUserId();
  const { orders, isLoading, error } = useOrders(userId);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  const handleOrderClick = (order: OrderRow) => {
    setSelectedOrder(order);
  };

  const closePopup = () => {
    setSelectedOrder(null);
  };

  // helper for money formatting
  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  // Calculate pricing for the currently selected order
  // Use backend totalAmount if available (includes discount), otherwise calculate
  const pricing = useMemo(() => {
    if (!selectedOrder) return { ticketsSubtotal: 0, tax: 0, orderTotal: 0, discount: 0 };

    // If backend provided totalAmount, use it (already includes discount)
    if (selectedOrder.totalAmount !== undefined && selectedOrder.totalAmount > 0) {
      // Calculate breakdown for display
      const adultTotal = selectedOrder.tickets.adult.count * selectedOrder.tickets.adult.price;
      const childTotal = selectedOrder.tickets.child.count * selectedOrder.tickets.child.price;
      const seniorTotal = selectedOrder.tickets.senior.count * selectedOrder.tickets.senior.price;
      const ticketsSubtotal = adultTotal + childTotal + seniorTotal;
      const tax = ticketsSubtotal * 0.08; // 8% tax (matching checkout calculation)
      const totalBeforeDiscount = ticketsSubtotal + tax + selectedOrder.bookingFee;
      const discount = totalBeforeDiscount - selectedOrder.totalAmount;
      
      return { 
        ticketsSubtotal, 
        tax, 
        orderTotal: selectedOrder.totalAmount, // Use backend total (includes discount)
        discount: discount > 0 ? discount : 0 
      };
    }

    // Fallback: calculate if backend total not available
    const adultTotal = selectedOrder.tickets.adult.count * selectedOrder.tickets.adult.price;
    const childTotal = selectedOrder.tickets.child.count * selectedOrder.tickets.child.price;
    const seniorTotal = selectedOrder.tickets.senior.count * selectedOrder.tickets.senior.price;

    const ticketsSubtotal = adultTotal + childTotal + seniorTotal;
    const tax = ticketsSubtotal * 0.08; // 8% tax
    const orderTotal = ticketsSubtotal + tax + selectedOrder.bookingFee;

    return { ticketsSubtotal, tax, orderTotal, discount: 0 };
  }, [selectedOrder]);

  return (
    <div className="text-white min-h-screen bg-[#1C1C1C]">
      <NavBar />
      <div className="h-30" />

      <UserNavTabs activeTab="orders" />

      <div className="max-w-7xl mx-auto px-8 pb-16 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-12 items-start">
          <UserProfileSidebar profilePicUrl={profilePicUrl} />

          {/* Orders Table */}
          <section className="p-0">
            {isLoading && (
              <div className="text-center py-8">
                <div className="text-white text-xl">Loading orders...</div>
              </div>
            )}
            
            {error && (
              <div className="text-center py-8">
                <div className="text-red-400 mb-4">{error}</div>
              </div>
            )}
            
            {!isLoading && !error && orders.length === 0 && (
              <div className="text-center py-8">
                <div className="text-white/60 mb-4">No orders found</div>
                <div className="text-white/40">Your order history will appear here after you complete a booking.</div>
              </div>
            )}
            
            {!isLoading && !error && orders.length > 0 && (
              <>
                <div className="grid grid-cols-3 font-afacad text-white text-2xl mb-4 px-2">
                  <div className="font-bold">Date</div>
                  <div className="font-bold">Time</div>
                  <div className="font-bold">Movie</div>
                </div>

                <div className="divide-y divide-white border-b border-white">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="grid grid-cols-3 items-center py-6 px-2 font-afacad text-white text-xl cursor-pointer hover:bg-gray-500/20 transition-colors"
                      onClick={() => handleOrderClick(order)}
                    >
                      <div>{order.date}</div>
                      <div>{order.time}</div>
                      <div>{order.movie}</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {/* Order Details Popup */}
      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="relative bg-white/3 backdrop-blur-md rounded-lg p-8 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]">
            {/* Close button */}
            <button
              type="button"
              onClick={closePopup}
              className="absolute top-3 right-4 text-white text-2xl hover:text-white/70 transition-colors leading-none"
            >
              ×
            </button>
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-white mb-4">Order Summary</h2>
              <div className="space-y-2">
                <div className="text-white">
                  Booking Number: <span className="text-[#FF478B]">{selectedOrder.bookingNumber}</span>
                </div>
                <div className="text-white">
                  Ticket Numbers: <span className="text-[#FF478B]">{selectedOrder.ticketNumbers}</span>
                </div>
                <div className="text-white">
                  Seats: <span className="text-[#FF478B]">
                    {selectedOrder.seats && selectedOrder.seats.length > 0
                      ? selectedOrder.seats.join(', ')
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Dashed line */}
            <div className="border-t border-dashed border-gray-400 mb-5"></div>

            {/* Movie Details */}
            <div className="mb-6">
              <div className="flex gap-6 items-center">
                <div className="w-28 h-40 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={selectedOrder.posterUrl}
                    alt={selectedOrder.movie}
                    width={112}
                    height={160}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{selectedOrder.movie}</h3>
                  <div className="text-white mb-1">Date: {selectedOrder.orderDate}</div>
                  <div className="text-white/80">Showtime: {selectedOrder.showtime}</div>
                </div>
              </div>
            </div>

            {/* Dashed line */}
            <div className="border-t border-dashed border-gray-400 mb-6"></div>

            {/* Payment Summary */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-4">Payment Summary</h3>
              <div className="space-y-2 mb-4">
                {selectedOrder.tickets.adult.count > 0 && (
                  <div className="flex justify-between text-white">
                    <span>Adult ticket x{selectedOrder.tickets.adult.count}</span>
                    <span>{formatCurrency(selectedOrder.tickets.adult.price)}</span>
                  </div>
                )}
                {selectedOrder.tickets.child.count > 0 && (
                  <div className="flex justify-between text-white">
                    <span>Child ticket x{selectedOrder.tickets.child.count}</span>
                    <span>{formatCurrency(selectedOrder.tickets.child.price)}</span>
                  </div>
                )}
                {selectedOrder.tickets.senior.count > 0 && (
                  <div className="flex justify-between text-white">
                    <span>Senior ticket x{selectedOrder.tickets.senior.count}</span>
                    <span>{formatCurrency(selectedOrder.tickets.senior.price)}</span>
                  </div>
                )}
                <div className="flex justify-between text-white">
                  <span>Tax:</span>
                  <span>{formatCurrency(pricing.tax)}</span>
                </div>
                <div className="flex justify-between text-white">
                  <span>Booking fee:</span>
                  <span>${selectedOrder.bookingFee.toFixed(2)}</span>
                </div>
                {pricing.discount > 0 && selectedOrder.promotionName && (
                  <div className="flex justify-between text-green-400">
                    <span>Promotion ({selectedOrder.promotionName}):</span>
                    <span>-{formatCurrency(pricing.discount)}</span>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <div className="text-white mb-2">Payment Method:</div>
                <div className="text-white">{selectedOrder.paymentMethod}</div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white text-lg">Order Total:</span>
                <span className="text-white text-4xl font-bold">{formatCurrency(pricing.orderTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
