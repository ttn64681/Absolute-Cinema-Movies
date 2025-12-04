'use client';

import React from 'react';
import { RegistrationData, PaymentCard } from '@/contexts/RegistrationContext';
import PaymentCardForm from './PaymentCardForm';

interface PaymentSectionProps {
  data: RegistrationData;
  updateData: (stepData: Partial<RegistrationData>) => void;
  isLoading?: boolean;
}

export default function PaymentSection({ data, updateData, isLoading = false }: PaymentSectionProps) {
  // Update a specific payment card
  const updateCard = (index: number, updates: Partial<PaymentCard>) => {
    const updatedCards = [...data.paymentCards];
    updatedCards[index] = { ...updatedCards[index], ...updates };

    // If setting as default, unset others
    if (updates.isDefault) {
      updatedCards.forEach((card, i) => {
        if (i !== index) card.isDefault = false;
      });
      updateData({ defaultCardId: updatedCards[index].id });
    }

    updateData({ paymentCards: updatedCards });
  };

  // Add a new payment card (max 3)
  const addCard = () => {
    if (data.paymentCards.length < 3) {
      const newCard: PaymentCard = {
        id: `card_${Date.now()}`,
        cardType: '',
        cardNumber: '',
        expirationDate: '',
        cvv: '',
        billingStreet: '',
        billingCity: '',
        billingState: '',
        billingZip: '',
        isDefault: false,
      };
      updateData({ paymentCards: [...data.paymentCards, newCard] });
    }
  };

  // Remove a payment card
  const removeCard = (index: number) => {
    if (data.paymentCards.length > 1) {
      const updatedCards = data.paymentCards.filter((_, i) => i !== index);
      // If removing default, make first card default
      if (data.paymentCards[index].isDefault && updatedCards.length > 0) {
        updatedCards[0].isDefault = true;
        updateData({ defaultCardId: updatedCards[0].id, paymentCards: updatedCards });
      } else {
        updateData({ paymentCards: updatedCards });
      }
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t border-white/10">
      <h3 className="text-white font-semibold mb-4">Payment Information (Optional)</h3>

      {/* Payment Cards List */}
      <div className="space-y-4">
        {data.paymentCards.map((card, index) => (
          <PaymentCardForm
            key={card.id}
            card={card}
            index={index}
            updateCard={updateCard}
            onRemove={() => removeCard(index)}
            canRemove={data.paymentCards.length > 1}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Add Card Button */}
      {data.paymentCards.length < 3 && (
        <button
          type="button"
          onClick={addCard}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-md bg-acm-pink/20 border border-acm-pink text-acm-pink hover:bg-acm-pink/30 transition-colors disabled:opacity-50"
        >
          + Add Another Payment Card
        </button>
      )}

      <div className="text-center text-white/60 text-sm">
        <p>Complete all fields for a payment card or leave it empty to skip</p>
      </div>
    </div>
  );
}
