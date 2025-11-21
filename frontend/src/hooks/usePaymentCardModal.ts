'use client';

import { useState, useCallback } from 'react';
import { PaymentCard } from '@/types/payment';

/**
 * Hook to manage payment card modal state
 * Extracts modal state management from components
 * 
 * @returns Modal state & handlers
 */
export function usePaymentCardModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'Add' | 'Edit'>('Add');
  const [editingCard, setEditingCard] = useState<PaymentCard | null>(null);

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

  return {
    isOpen,
    mode,
    editingCard,
    openAdd,
    openEdit,
    close,
  };
}





