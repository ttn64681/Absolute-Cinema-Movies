'use client';

import { useState, useEffect, useCallback } from 'react';
import { buildUrl, endpoints } from '@/config/api';
import { getAuthToken } from '@/utils/auth';
import { OrderRow } from '@/types/order';

/**
 * Orders Hook - Manages user order history
 * 
 * Follows the same pattern as usePaymentCards:
 * - Single hook for all order operations
 * - Uses direct API calls (no separate client needed for now)
 * - Handles loading and error states
 * 
 * @param userId - User ID for fetching orders
 * @returns Orders state & operations
 */
export function useOrders(userId: number | null) {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user orders
  const fetchOrders = useCallback(async () => {
    if (!userId) {
      setOrders([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(buildUrl(endpoints.bookings.getUserOrders), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform backend OrderResponseDTO to frontend OrderRow
      const transformedOrders: OrderRow[] = data.map((order: any) => {
        // Get ticket prices (we'll use default prices for display, but use backend totalAmount for final total)
        const adultPrice = 12.5;
        const childPrice = 8.0;
        const seniorPrice = 10.0;
        
        // Calculate booking fee (approximate: $2.50 per ticket)
        const bookingFee = order.numTickets * 2.5;
        
        // Format order date
        const orderDateObj = new Date(order.orderDate);
        const orderDate = `${orderDateObj.getMonth() + 1}/${orderDateObj.getDate()}/${orderDateObj.getFullYear().toString().slice(-2)}`;
        
        // Format showtime string
        const showDateTime = new Date(order.showDateTime);
        const showtime = `${order.showDate} ${order.showTime}-${showDateTime.getHours() + 2}:${String(showDateTime.getMinutes()).padStart(2, '0')}${showDateTime.getHours() >= 12 ? 'PM' : 'AM'}`;
        
        // Use backend totalAmount (includes discount) - convert from BigDecimal/string to number
        const totalAmount = typeof order.totalAmount === 'number' 
          ? order.totalAmount 
          : parseFloat(order.totalAmount || '0');
        
        // Format ticket numbers - show individual ticket IDs
        const ticketNumbers = order.ticketIds && order.ticketIds.length > 0
          ? order.ticketIds.map(id => id.toString()).join(', ')
          : order.bookingId.toString(); // Fallback to booking ID if ticket IDs not available
        
        // Get seats from backend (list of seat identifiers like ["A1", "A2", "B3"])
        const seats = order.seats && order.seats.length > 0
          ? order.seats
          : []; // Empty array if no seats available
        
        return {
          id: order.bookingId.toString(),
          date: order.showDate,
          time: order.showTime,
          movie: order.movieTitle,
          bookingNumber: order.bookingId.toString(),
          ticketNumbers: ticketNumbers,
          seats: seats,
          showtime: showtime,
          orderDate: orderDate,
          posterUrl: order.moviePosterUrl || '/poster_placeholder.jpg',
          tickets: {
            adult: { count: order.ticketCounts?.adult || 0, price: adultPrice },
            child: { count: order.ticketCounts?.child || 0, price: childPrice },
            senior: { count: order.ticketCounts?.senior || 0, price: seniorPrice },
          },
          bookingFee: bookingFee,
          paymentMethod: order.paymentMethod || 'N/A',
          totalAmount: totalAmount, // Use backend total (includes discount)
          promotionName: order.promotionName || null, // Promotion name if applied
        };
      });
      
      setOrders(transformedOrders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch orders when userId changes
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    isLoading,
    error,
    refetch: fetchOrders,
  };
}

