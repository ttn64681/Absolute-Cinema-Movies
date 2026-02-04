'use client';

import { useState } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { buildUrl } from '@/config/api';

interface PromoCodeInputProps {
  onPromoApplied: (
    promoCode: string,
    discount: number,
    discountType: 'percentage' | 'fixed',
    promotionId: number
  ) => void;
  onPromoRemoved: () => void;
  isLoading?: boolean;
}

export default function PromoCodeInput({ onPromoApplied, onPromoRemoved, isLoading = false }: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    promotionId: number;
  } | null>(null);
  const { showToast } = useToast();

  const handleApply = async () => {
    if (!promoCode.trim()) {
      showToast('Please enter a promo code', 'error');
      return;
    }

    setIsValidating(true);
    try {
      const response = await fetch(
        buildUrl(`/api/promotion/validate?promoCode=${encodeURIComponent(promoCode.trim())}`),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Invalid promo code' }));
        showToast(errorData.error || 'Invalid or expired promo code', 'error');
        return;
      }

      const data = await response.json();
      if (data.valid && data.promotionId) {
        const promotionId = data.promotionId;
        setAppliedPromo({
          code: promoCode.trim().toUpperCase(),
          discount: data.discountValue,
          type: data.discountType,
          promotionId: promotionId,
        });
        onPromoApplied(promoCode.trim().toUpperCase(), data.discountValue, data.discountType, promotionId);
        showToast(`Promo code "${promoCode.trim().toUpperCase()}" applied successfully!`, 'success');
      } else {
        showToast(data.error || 'Invalid or expired promo code', 'error');
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      showToast('Failed to validate promo code. Please try again.', 'error');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    setAppliedPromo(null);
    setPromoCode('');
    onPromoRemoved();
    showToast('Promo code removed', 'info');
  };

  if (appliedPromo) {
    return (
      <div className="flex items-center justify-between p-4 bg-green-900/30 border border-green-500/50 rounded-md">
        <div>
          <p className="text-green-400 font-semibold">{appliedPromo.code}</p>
          <p className="text-green-300 text-sm">
            {appliedPromo.type === 'percentage'
              ? `${appliedPromo.discount}% off`
              : `$${appliedPromo.discount.toFixed(2)} off`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={isLoading}
          className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          title="Remove promo code"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label htmlFor="promoCode" className="block text-sm font-medium text-white">
        Promo Code
      </label>
      <div className="flex gap-2">
        <input
          id="promoCode"
          type="text"
          value={promoCode}
          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
          placeholder="Enter promo code"
          className="flex-1 px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
          disabled={isLoading || isValidating}
          title="Enter promo code"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={isLoading || isValidating || !promoCode.trim()}
          className="px-6 py-3 rounded-md font-afacad font-bold text-white bg-linear-to-r from-acm-pink to-acm-orange hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Apply promo code"
        >
          {isValidating ? 'Validating...' : 'Apply'}
        </button>
      </div>
    </div>
  );
}
