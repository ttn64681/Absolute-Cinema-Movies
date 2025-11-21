'use client';

import { useState, useEffect } from 'react';
import { PaymentCardFormData } from '@/types/payment';

interface PaymentCardModalProps {
  isOpen: boolean;
  mode: 'Add' | 'Edit';
  onClose: () => void;
  onSubmit: (data: PaymentCardFormData) => void;
  initialData?: Partial<PaymentCardFormData>;
  isSubmitting?: boolean;
}

export default function PaymentCardModal({
  isOpen,
  mode,
  onClose,
  onSubmit,
  initialData,
  isSubmitting = false,
}: PaymentCardModalProps) {
  const [formData, setFormData] = useState<PaymentCardFormData>({
    cardId: initialData?.cardId || 0,
    cardType: initialData?.cardType || '',
    cardNumber: initialData?.cardNumber || '',
    expirationDate: initialData?.expirationDate || '',
    cvv: initialData?.cvv || '',
    cardholderName: initialData?.cardholderName || '',
    billingStreet: initialData?.billingStreet || '',
    billingCity: initialData?.billingCity || '',
    billingState: initialData?.billingState || '',
    billingZip: initialData?.billingZip || '',
    billingCountry: initialData?.billingCountry || 'US',
    isDefault: initialData?.isDefault || false,
  });

  // Update form data when initialData changes (when switching between Add/Edit)
  useEffect(() => {
    if (initialData) {
      // Don't pre-fill card number if it's masked (server-side masking for security)
      const cardNumber = initialData.cardNumber?.startsWith('****') ? '' : initialData.cardNumber || '';
      setFormData({
        cardId: initialData.cardId || 0,
        cardType: initialData.cardType || '',
        cardNumber: cardNumber,
        expirationDate: initialData.expirationDate || '',
        cvv: '', // Never pre-fill CVV for security
        cardholderName: initialData.cardholderName || '',
        billingStreet: initialData.billingStreet || '',
        billingCity: initialData.billingCity || '',
        billingState: initialData.billingState || '',
        billingZip: initialData.billingZip || '',
        billingCountry: initialData.billingCountry || 'US',
        isDefault: initialData.isDefault || false,
      });
    } else {
      setFormData({
        cardId: 0,
        cardType: '',
        cardNumber: '',
        expirationDate: '',
        cvv: '',
        cardholderName: '',
        billingStreet: '',
        billingCity: '',
        billingState: '',
        billingZip: '',
        billingCountry: 'US',
        isDefault: false,
      });
    }
  }, [initialData]);

  // Format card number with spaces
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < cleaned.length; i += 4) {
      if (i > 0) parts.push(' ');
      parts.push(cleaned.substr(i, 4));
    }
    return parts.join('');
  };

  // Format expiration date (MM/YY)
  const formatExpirationDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div
        className="bg-white/10 backdrop-blur-md rounded-lg p-8 w-full max-w-2xl mx-4 relative z-10 max-h-[90vh] overflow-y-auto"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)' }}
      >
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white font-afacad">{mode} Payment Method</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Type */}
          <div>
            <label className="block text-white text-sm mb-2 font-afacad">Card Type</label>
            <select
              title="Select Card Type"
              value={formData.cardType}
              onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
              required
            >
              <option value="">Select Card Type</option>
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="amex">American Express</option>
              <option value="discover">Discover</option>
            </select>
          </div>

          {/* Card Number */}
          <div>
            <label className="block text-white text-sm mb-2 font-afacad">Card Number</label>
            <input
              type="text"
              value={formData.cardNumber}
              onChange={(e) => setFormData({ ...formData, cardNumber: formatCardNumber(e.target.value) })}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
              required
            />
          </div>

          {/* Name on card */}
          <div>
            <label className="block text-white text-sm mb-2 font-afacad">Name on Card</label>
            <input
              type="text"
              value={formData.cardholderName}
              onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
              placeholder="Cardholder Name"
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
              required
            />
          </div>

          {/* Expiration Date and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-2 font-afacad">Expiration Date</label>
              <input
                type="text"
                value={formData.expirationDate}
                onChange={(e) => setFormData({ ...formData, expirationDate: formatExpirationDate(e.target.value) })}
                placeholder="MM/YY"
                maxLength={5}
                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-2 font-afacad">CVV</label>
              <input
                type="text"
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                placeholder="123"
                maxLength={4}
                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Separator */}
          <div className="border-t border-white/20 my-4"></div>

          <h3 className="text-white font-afacad text-lg font-semibold mb-3">Billing Address</h3>

          {/* Billing Street */}
          <div>
            <label className="block text-white text-sm mb-2 font-afacad">Billing Street</label>
            <input
              type="text"
              value={formData.billingStreet}
              onChange={(e) => setFormData({ ...formData, billingStreet: e.target.value })}
              placeholder="123 Main Street, Apt 4B"
              className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
              required
            />
          </div>

          {/* City and State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-2 font-afacad">City</label>
              <input
                type="text"
                value={formData.billingCity}
                onChange={(e) => setFormData({ ...formData, billingCity: e.target.value })}
                placeholder="Los Angeles"
                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-2 font-afacad">State</label>
              <input
                type="text"
                value={formData.billingState}
                onChange={(e) => setFormData({ ...formData, billingState: e.target.value })}
                placeholder="CA"
                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* ZIP and Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm mb-2 font-afacad">ZIP Code</label>
              <input
                type="text"
                value={formData.billingZip}
                onChange={(e) => setFormData({ ...formData, billingZip: e.target.value })}
                placeholder="90001"
                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-white text-sm mb-2 font-afacad">Country</label>
              <input
                type="text"
                value={formData.billingCountry}
                onChange={(e) => setFormData({ ...formData, billingCountry: e.target.value })}
                placeholder="United States"
                className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Default Card Toggle */}
          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-acm-pink focus:ring-2 focus:ring-acm-pink"
            />
            <label htmlFor="isDefault" className="text-sm text-white font-afacad">
              Set as default payment method
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-md font-afacad font-bold text-white border-2 border-white/20 hover:border-white/40 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 rounded-md font-afacad font-bold text-white bg-gradient-to-r from-acm-pink to-acm-orange hover:from-acm-orange hover:to-acm-pink transition-all disabled:opacity-50"
            >
              {isSubmitting ? `${mode}ing...` : `${mode} Card`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
