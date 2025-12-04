'use client';

import { useState } from 'react';

interface PaymentFormData {
  cardNumber: string;
  expirationDate: string;
  cvv: string;
  cardholderName: string;
}

interface PaymentFormProps {
  onSubmit: (data: PaymentFormData) => void;
  isLoading?: boolean;
}

export default function PaymentForm({ onSubmit, isLoading = false }: PaymentFormProps) {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expirationDate: '',
    cvv: '',
    cardholderName: '',
  });

  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});

  // Format card number with spaces
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s/g, '');
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  // Luhn algorithm for card number validation
  const luhnCheck = (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');
    let sum = 0;
    let isEven = false;
    
    // Start from the rightmost digit
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  // Validate card number format and checksum
  const validateCardNumber = (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    // Must be 13-19 digits (standard card lengths)
    if (!/^\d{13,19}$/.test(cleaned)) {
      return false;
    }
    
    // Must pass Luhn algorithm check
    return luhnCheck(cardNumber);
  };

  // Format expiration date (MM/YY)
  const formatExpirationDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  // Validate expiration date
  const validateExpirationDate = (expDate: string): boolean => {
    if (expDate.length !== 5) return false;
    const [month, year] = expDate.split('/');
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt('20' + year, 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (monthNum < 1 || monthNum > 12) return false;
    if (yearNum < currentYear) return false;
    if (yearNum === currentYear && monthNum < currentMonth) return false;
    return true;
  };

  // Validate CVV
  const validateCVV = (cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Partial<PaymentFormData> = {};
    
    if (!validateCardNumber(formData.cardNumber)) {
      const cleaned = formData.cardNumber.replace(/\s/g, '');
      if (cleaned.length < 13 || cleaned.length > 19) {
        newErrors.cardNumber = 'Card number must be 13-19 digits';
      } else if (!/^\d+$/.test(cleaned)) {
        newErrors.cardNumber = 'Card number must contain only digits';
      } else {
        newErrors.cardNumber = 'Invalid card number. Please check and try again.';
      }
    }
    
    if (!validateExpirationDate(formData.expirationDate)) {
      newErrors.expirationDate = 'Please enter a valid expiration date (MM/YY)';
    }
    
    if (!validateCVV(formData.cvv)) {
      newErrors.cvv = 'CVV must be 3-4 digits';
    }
    
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Please enter cardholder name';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    onSubmit(formData);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="cardNumber" className="block text-sm font-medium text-white mb-2">
          Card Number
        </label>
        <input
          id="cardNumber"
          type="text"
          value={formData.cardNumber}
          onChange={(e) => {
            const formatted = formatCardNumber(e.target.value);
            setFormData({ ...formData, cardNumber: formatted });
            if (errors.cardNumber) setErrors({ ...errors, cardNumber: undefined });
          }}
          placeholder="1234 5678 9012 3456"
          maxLength={19}
          className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
          disabled={isLoading}
          title="Enter credit card number"
        />
        {errors.cardNumber && (
          <p className="text-red-400 text-sm mt-1">{errors.cardNumber}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="expirationDate" className="block text-sm font-medium text-white mb-2">
            Expiration Date
          </label>
          <input
            id="expirationDate"
            type="text"
            value={formData.expirationDate}
            onChange={(e) => {
              const formatted = formatExpirationDate(e.target.value);
              setFormData({ ...formData, expirationDate: formatted });
              if (errors.expirationDate) setErrors({ ...errors, expirationDate: undefined });
            }}
            placeholder="MM/YY"
            maxLength={5}
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
            disabled={isLoading}
            title="Enter expiration date"
          />
          {errors.expirationDate && (
            <p className="text-red-400 text-sm mt-1">{errors.expirationDate}</p>
          )}
        </div>

        <div>
          <label htmlFor="cvv" className="block text-sm font-medium text-white mb-2">
            CVV
          </label>
          <input
            id="cvv"
            type="text"
            value={formData.cvv}
            onChange={(e) => {
              const cleaned = e.target.value.replace(/\D/g, '').slice(0, 4);
              setFormData({ ...formData, cvv: cleaned });
              if (errors.cvv) setErrors({ ...errors, cvv: undefined });
            }}
            placeholder="123"
            maxLength={4}
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
            disabled={isLoading}
            title="Enter CVV"
          />
          {errors.cvv && (
            <p className="text-red-400 text-sm mt-1">{errors.cvv}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="cardholderName" className="block text-sm font-medium text-white mb-2">
          Cardholder Name
        </label>
        <input
          id="cardholderName"
          type="text"
          value={formData.cardholderName}
          onChange={(e) => {
            setFormData({ ...formData, cardholderName: e.target.value });
            if (errors.cardholderName) setErrors({ ...errors, cardholderName: undefined });
          }}
          placeholder="John Doe"
          className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
          disabled={isLoading}
          title="Enter cardholder name"
        />
        {errors.cardholderName && (
          <p className="text-red-400 text-sm mt-1">{errors.cardholderName}</p>
        )}
      </div>
    </form>
  );
}

