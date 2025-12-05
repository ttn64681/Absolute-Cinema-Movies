'use client';

import { useState, useEffect, useCallback } from 'react';
import { PaymentCard, PaymentCardFormData } from '@/types/payment';
import { paymentClient } from '@/clients/paymentClient';

import { useToast } from '@/contexts/ToastContext';

/**
 * Payment Cards Hook - Manages payment cards with modal state
 * 
 * Follows the same pattern as useMovies:
 * - Single hook for all payment card operations
 * - Uses paymentClient facade for API calls
 * - Handles modal state + business logic
 * 
 * Responsibilities:
 * - Fetch/display cards
 * - Create/update/delete cards (via client)
 * - Modal state (open/close, mode, editing card)
 * - Business logic (mode-based submit, delete confirmation)
 * 
 * @param userId - User ID for fetching cards
 * @returns Payment cards state, modal state & operations
 */
export function usePaymentCards(userId: number | null) {
  // Card data state
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal state (like useMovies has pagination state)
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'Add' | 'Edit'>('Add');
  const [editingCard, setEditingCard] = useState<PaymentCard | null>(null);

  const { showToast } = useToast();

  // Fetch payment cards
  const fetchPaymentCards = useCallback(async () => {
    if (!userId) {
      setPaymentCards([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cards = await paymentClient.getCards(userId);
      setPaymentCards(cards);
    } catch (err) {
      console.error('Error fetching payment cards:', err);
      setError('Failed to load payment cards');
      setPaymentCards([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Modal operations
  const openAdd = useCallback(() => {
    setEditingCard(null);
    setMode('Add');
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((card: PaymentCard) => {
    setEditingCard(card);
    setMode('Edit');
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingCard(null);
  }, []);

  // Business logic: Mode-based form submission
  const handleSubmit = useCallback(
    async (formData: PaymentCardFormData) => {
      if (!userId) return;

      // Validate max cards
      if (mode === 'Add' && paymentCards.length >= 3) {
        setError('Maximum of 3 payment methods reached');
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        if (mode === 'Add') {
          await paymentClient.createCard(userId, formData);
        } else if (editingCard) {
          await paymentClient.updateCard(userId, editingCard.id, formData);
        }

        // Refresh cards and close modal
        await fetchPaymentCards();
        showToast(`Payment card successfully ${mode === 'Add' ? 'created' : 'updated'}.`, 'success', 8000);
        close();
      } catch (err) {
        console.error(`Error ${mode === 'Add' ? 'creating' : 'updating'} card:`, err);
        setError(`Failed to ${mode === 'Add' ? 'add' : 'update'} payment card`);
        showToast(`Failed to ${mode === 'Add' ? 'add' : 'update'} payment card`, 'error', 8000);
      } finally {
        setIsSubmitting(false);
      }
    },
    [userId, mode, editingCard, paymentCards.length, fetchPaymentCards, close]
  );

  // Business logic: Delete with confirmation
  const handleDelete = useCallback(
    async (cardId: number) => {
      if (!confirm('Are you sure you want to delete this payment method?')) {
        return;
      }

      setIsSubmitting(true);
      setError(null);

      try {
        await paymentClient.deleteCard(cardId);
        await fetchPaymentCards();
        showToast('Successfully deleted payment card.', 'success', 8000);
      } catch (err) {
        console.error('Error deleting card:', err);
        setError('Failed to delete payment card');
        showToast('Failed to delete payment card', 'error', 8000);
      } finally {
        setIsSubmitting(false);
      }
    },
    [fetchPaymentCards]
  );

  // Fetch cards when userId changes
  useEffect(() => {
    fetchPaymentCards();
  }, [fetchPaymentCards]);

  return {
    // Card data
    paymentCards,
    isLoading,
    error,
    isSubmitting,

    // Modal state
    isOpen,
    mode,
    editingCard,

    // Operations
    handleSubmit,
    handleDelete,
    openAdd,
    openEdit,
    close,
    refreshCards: fetchPaymentCards,
  };
}
