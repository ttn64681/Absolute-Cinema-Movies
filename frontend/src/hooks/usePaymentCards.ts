'use client';

import { useState, useEffect, useCallback } from 'react';
import { PaymentCard, PaymentCardFormData } from '@/types/payment';
import { buildUrl, endpoints } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

/**
 * Facade hook for payment card operations
 * Encapsulates all API calls, state management, & error handling
 * 
 * Follows facade pattern: single interface for complex payment card subsystem
 * 
 * @param userId - User ID for fetching cards
 * @returns Payment cards state & CRUD operations
 */
export function usePaymentCards(userId: number | null) {
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch payment cards
  const fetchPaymentCards = useCallback(async () => {
    if (!userId) {
      setPaymentCards([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(buildUrl(endpoints.paymentCards.getUserPaymentCards(userId)), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payment cards');
      }

      const cards = (await response.json()) as PaymentCard[];

      // Ensure cards is an array
      if (Array.isArray(cards)) {
        setPaymentCards(cards);
      } else {
        console.error('Expected array but got:', cards);
        setPaymentCards([]);
      }
    } catch (err) {
      console.error('Error fetching payment cards:', err);
      setError('Failed to load payment cards');
      setPaymentCards([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Create payment card
  const createCard = useCallback(async (formData: PaymentCardFormData): Promise<boolean> => {
    if (!userId) return false;

    setIsSubmitting(true);
    setError(null);

    try {
      if (paymentCards.length >= 3) {
        setError('Maximum of 3 payment methods reached');
        return false;
      }

      const token = getAuthToken();
      const payload = {
        userId,
        cardType: formData.cardType,
        cardNumber: formData.cardNumber.replace(/\s+/g, ''),
        expirationDate: formData.expirationDate,
        cardholderName: formData.cardholderName,
        billingStreet: formData.billingStreet,
        billingCity: formData.billingCity,
        billingState: formData.billingState,
        billingZip: formData.billingZip,
        billingCountry: formData.billingCountry,
        isDefault: formData.isDefault,
      };

      const response = await fetch(buildUrl(endpoints.paymentCards.createPaymentCard()), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to add payment card');
      }

      await fetchPaymentCards();
      return true;
    } catch (err) {
      console.error('Error creating card:', err);
      setError('Failed to add payment card');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, paymentCards.length, fetchPaymentCards]);

  // Update payment card
  const updateCard = useCallback(async (cardId: number, formData: PaymentCardFormData): Promise<boolean> => {
    if (!userId) return false;

    setIsSubmitting(true);
    setError(null);

    try {
      const token = getAuthToken();
      const payload = {
        userId,
        cardType: formData.cardType,
        cardNumber: formData.cardNumber.replace(/\s+/g, ''),
        expirationDate: formData.expirationDate,
        cardholderName: formData.cardholderName,
        billingStreet: formData.billingStreet,
        billingCity: formData.billingCity,
        billingState: formData.billingState,
        billingZip: formData.billingZip,
        billingCountry: formData.billingCountry,
        isDefault: formData.isDefault,
      };

      const response = await fetch(buildUrl(endpoints.paymentCards.updatePaymentCard(cardId)), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment card');
      }

      await fetchPaymentCards();
      return true;
    } catch (err) {
      console.error('Error updating card:', err);
      setError('Failed to update payment card');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, fetchPaymentCards]);

  // Delete payment card
  const deleteCard = useCallback(async (cardId: number): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetch(buildUrl(endpoints.paymentCards.deletePaymentCard(cardId)), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete payment card');
      }

      await fetchPaymentCards();
      return true;
    } catch (err) {
      console.error('Error deleting card:', err);
      setError('Failed to delete payment card');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchPaymentCards]);

  // Fetch cards when userId changes
  useEffect(() => {
    fetchPaymentCards();
  }, [fetchPaymentCards]);

  return {
    paymentCards,
    isLoading,
    error,
    isSubmitting,
    createCard,
    updateCard,
    deleteCard,
    refreshCards: fetchPaymentCards,
  };
}





