'use client';

import { useState, useMemo, useEffect } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { buildUrl } from '@/config/api';
import { getAuthToken, getUserIdFromToken } from '@/utils/auth';
import { paymentClient } from '@/clients/paymentClient';
import { PaymentCard } from '@/types/payment';
import { FormField, SelectField, StepCard, StepActions, ReviewCard, GhostButton, PrimaryButton } from './CheckoutComponents';

interface CheckoutSectionsProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  bookingId: number | null;
  finalTotalAmount?: number | null;
  onPromoApplied?: (discount: number, type: 'percentage' | 'fixed', promotionId: number) => void;
  onPaymentComplete?: () => void;
}

interface CheckoutFormData {
  // Billing
  billingFirstName: string;
  billingLastName: string;
  billingEmail: string;
  billingAddress: string;
  billingZip: string;
  billingCity: string;
  billingState: string;
  billingCountry: string;

  // Payment
  paymentFirstName: string;
  paymentLastName: string;
  cardType: string;
  cardNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cvv: string;

  // Promo
  promoCode: string;
  appliedPromo: {
    code: string;
    discount: number;
    type: 'percentage' | 'fixed';
    promotionId: number;
  } | null;
}

const gradientForward = 'linear-gradient(90deg, #FF478B 0%, #FF5C33 100%)';
const gradientReverse = 'linear-gradient(90deg, #FF5C33 0%, #FF478B 100%)';

const monthOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const yearOptions = Array.from({ length: 15 }, (_, i) => String(new Date().getFullYear() + i));

function keepDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatCardNumber(value: string) {
  const digits = keepDigits(value);
  if (!digits) return '';

  const chunks: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    chunks.push(digits.slice(i, i + 4));
  }
  return chunks.join(' ').trim();
}

export default function CheckoutSections({
  currentStep,
  setCurrentStep,
  bookingId,
  finalTotalAmount,
  onPromoApplied,
  onPaymentComplete,
}: CheckoutSectionsProps) {
  const { showToast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [savedPaymentCards, setSavedPaymentCards] = useState<PaymentCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [isLoadingCards, setIsLoadingCards] = useState(false);

  const [formData, setFormData] = useState<CheckoutFormData>({
    billingFirstName: '',
    billingLastName: '',
    billingEmail: '',
    billingAddress: '',
    billingZip: '',
    billingCity: '',
    billingState: '',
    billingCountry: '',
    paymentFirstName: '',
    paymentLastName: '',
    cardType: '',
    cardNumber: '',
    expirationMonth: '',
    expirationYear: '',
    cvv: '',
    promoCode: '',
    appliedPromo: null,
  });

  // Fetch saved payment cards on mount (with unmasked numbers for checkout auto-fill)
  useEffect(() => {
    const fetchSavedCards = async () => {
      const userId = getUserIdFromToken();
      if (!userId) return;

      setIsLoadingCards(true);
      try {
        // Request unmasked card numbers for checkout auto-fill
        const cards = await paymentClient.getCards(userId, true);
        setSavedPaymentCards(cards);
      } catch (error) {
        console.error('Error fetching saved payment cards:', error);
        // Don't show error toast - just silently fail (cards are optional)
      } finally {
        setIsLoadingCards(false);
      }
    };

    fetchSavedCards();
  }, []);

  // Handle saved card selection
  const handleSelectSavedCard = (cardId: number | null) => {
    setSelectedCardId(cardId);
    
    if (cardId === null) {
      // Clear form if "Enter new card" is selected
      updateFormData('paymentFirstName', '');
      updateFormData('paymentLastName', '');
      updateFormData('cardType', '');
      updateFormData('cardNumber', '');
      updateFormData('expirationMonth', '');
      updateFormData('expirationYear', '');
      updateFormData('cvv', '');
      return;
    }

    // Find selected card and populate form
    const selectedCard = savedPaymentCards.find(card => card.id === cardId);
    if (selectedCard) {
      // Parse cardholder name
      const nameParts = selectedCard.cardholderName?.split(' ') || [];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Parse expiration date (MM/YY format)
      const expParts = selectedCard.expirationDate?.split('/') || [];
      const month = expParts[0] || '';
      const year = expParts[1] ? `20${expParts[1]}` : '';

      updateFormData('paymentFirstName', firstName);
      updateFormData('paymentLastName', lastName);
      updateFormData('cardType', selectedCard.paymentCardType || '');
      updateFormData('cardNumber', selectedCard.cardNumber || '');
      updateFormData('expirationMonth', month);
      updateFormData('expirationYear', year);
      // Note: CVV is not stored for security, so user must enter it
    }
  };

  const updateFormData = (key: keyof CheckoutFormData, value: string | CheckoutFormData['appliedPromo']) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear selected card if user manually edits form
    if (key.startsWith('payment') || key === 'cardNumber' || key === 'cardType' || key === 'expirationMonth' || key === 'expirationYear') {
      setSelectedCardId(null);
    }
  };

  const formattedCardNumber = useMemo(
    () => formatCardNumber(formData.cardNumber),
    [formData.cardNumber],
  );

  const cardLabel = useMemo(() => {
    if (formData.cardType) return formData.cardType.toUpperCase();
    const digitsOnly = keepDigits(formData.cardNumber);
    const firstDigit = digitsOnly[0];
    switch (firstDigit) {
      case '4':
        return 'VISA';
      case '5':
        return 'MASTERCARD';
      case '3':
        return 'AMEX';
      case '6':
        return 'DISCOVER';
      default:
        return 'CARD';
    }
  }, [formData.cardType, formData.cardNumber]);

  const maskedCard = useMemo(() => {
    const digits = keepDigits(formData.cardNumber);
    if (!digits) return '';
    return `**** **** **** ${digits.slice(-4).padStart(4, '•')}`;
  }, [formData.cardNumber]);

  // Luhn algorithm for card number validation
  const luhnCheck = (cardNumber: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    // Must have at least 1 digit
    if (!cleaned || cleaned.length === 0) {
      return false;
    }
    
    let sum = 0;
    let isEven = false;
    
    // Start from rightmost digit (check digit), work left
    for (let i = cleaned.length - 1; i >= 0; i--) {
      const digit = parseInt(cleaned[i], 10);
      
      // Invalid digit
      if (isNaN(digit)) {
        return false;
      }
      
      if (isEven) {
        // Double every second digit from right
        const doubled = digit * 2;
        // If result > 9, subtract 9 (equivalent to adding digits)
        sum += doubled > 9 ? doubled - 9 : doubled;
      } else {
        // Add digit as-is
        sum += digit;
      }
      
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  };

  // Validate card number format and checksum
  const validateCardNumber = (cardNumber: string, cardType?: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    // Must be 13-19 digits (standard card lengths)
    if (!/^\d{13,19}$/.test(cleaned)) {
      return false;
    }
    
    // Optional card type validation (only if cardType is provided)
    // Case-insensitive comparison for flexibility
    if (cardType) {
      const normalizedType = cardType.toLowerCase();
      if (normalizedType === 'visa' && (cleaned.length !== 16 || !cleaned.startsWith('4'))) {
        return false;
      } else if ((normalizedType === 'mastercard' || normalizedType === 'master card') && (cleaned.length !== 16 || !cleaned.startsWith('5'))) {
        return false;
      } else if ((normalizedType === 'amex' || normalizedType === 'american express') && (cleaned.length !== 15 || (!cleaned.startsWith('34') && !cleaned.startsWith('37')))) {
        return false;
      } else if (normalizedType === 'discover' && (cleaned.length !== 16 || !cleaned.startsWith('6'))) {
        return false;
      }
    }
    // If no cardType provided, accept any valid length (13-19) that passes Luhn check
    
    return luhnCheck(cardNumber);
  };

  // Validate expiration date
  const validateExpirationDate = (month: string, year: string): boolean => {
    if (!month || !year) return false;
    
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt('20' + year.slice(-2), 10);
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

  const handleApplyPromo = async () => {
    if (!formData.promoCode.trim()) {
      showToast('Please enter a promo code', 'error');
      return;
    }

    setIsValidatingPromo(true);
    try {
      const response = await fetch(
        buildUrl(`/api/promotion/validate?promoCode=${encodeURIComponent(formData.promoCode.trim())}`),
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
      if (data.valid) {
        // Ensure discountValue is a number (BigDecimal from backend serializes as number)
        const discountValue = typeof data.discountValue === 'number' 
          ? data.discountValue 
          : parseFloat(data.discountValue) || 0;
        const promo = {
          code: formData.promoCode.trim().toUpperCase(),
          discount: discountValue,
          type: data.discountType,
          promotionId: data.promotionId,
        };
        updateFormData('appliedPromo', promo);
        if (onPromoApplied) {
          onPromoApplied(discountValue, data.discountType, data.promotionId);
        }
        showToast(`Promo code "${promo.code}" applied successfully! ${data.discountType === 'percentage' ? `${discountValue}% off` : `$${discountValue.toFixed(2)} off`}`, 'success');
      } else {
        showToast(data.error || 'Invalid or expired promo code', 'error');
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      showToast('Failed to validate promo code. Please try again.', 'error');
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleCompletePayment = async () => {
    if (!bookingId) {
      showToast('Booking not created yet. Please wait...', 'error');
      return;
    }

    if (!formData.billingFirstName || !formData.billingLastName || !formData.billingEmail) {
      showToast('Please complete billing information', 'error');
      setCurrentStep(1);
      return;
    }

    if (!formData.paymentFirstName || !formData.paymentLastName || !formData.cardNumber || !formData.cvv) {
      showToast('Please complete payment information', 'error');
      setCurrentStep(2);
      return;
    }

    if (!formData.expirationMonth || !formData.expirationYear) {
      showToast('Please enter card expiration date', 'error');
      setCurrentStep(2);
      return;
    }

    if (!formData.cardType) {
      showToast('Please select a card type', 'error');
      setCurrentStep(2);
      return;
    }

    const cleaned = formData.cardNumber.replace(/\s/g, '');
    
    if (cleaned.length < 13 || cleaned.length > 19) {
      showToast('Card number must be 13-19 digits', 'error');
      setCurrentStep(2);
      return;
    }
    
    if (!/^\d+$/.test(cleaned)) {
      showToast('Card number must contain only digits', 'error');
      setCurrentStep(2);
      return;
    }
    
    // Case-insensitive card type comparison
    const normalizedCardType = formData.cardType?.toLowerCase();
    if (normalizedCardType === 'visa' && (cleaned.length !== 16 || !cleaned.startsWith('4'))) {
      showToast('Visa cards must be 16 digits and start with 4', 'error');
      setCurrentStep(2);
      return;
    } else if ((normalizedCardType === 'mastercard' || normalizedCardType === 'master card') && (cleaned.length !== 16 || !cleaned.startsWith('5'))) {
      showToast('Mastercard must be 16 digits and start with 5', 'error');
      setCurrentStep(2);
      return;
    } else if ((normalizedCardType === 'amex' || normalizedCardType === 'american express') && (cleaned.length !== 15 || (!cleaned.startsWith('34') && !cleaned.startsWith('37')))) {
      showToast('American Express must be 15 digits and start with 34 or 37', 'error');
      setCurrentStep(2);
      return;
    } else if (normalizedCardType === 'discover' && (cleaned.length !== 16 || !cleaned.startsWith('6'))) {
      showToast('Discover cards must be 16 digits and start with 6', 'error');
      setCurrentStep(2);
      return;
    }
    
    if (!luhnCheck(formData.cardNumber)) {
      showToast('Invalid card number. The card number failed checksum validation. Please check and try again.', 'error');
      setCurrentStep(2);
      return;
    }

    if (!validateExpirationDate(formData.expirationMonth, formData.expirationYear)) {
      showToast('Please enter a valid expiration date', 'error');
      setCurrentStep(2);
      return;
    }

    if (!validateCVV(formData.cvv)) {
      showToast('CVV must be 3-4 digits', 'error');
      setCurrentStep(2);
      return;
    }

    setIsProcessing(true);

    try {
      const expirationDate = `${formData.expirationMonth}/${formData.expirationYear.slice(-2)}`;
      const billingAddress = `${formData.billingAddress}, ${formData.billingCity}, ${formData.billingState} ${formData.billingZip}`;
      const cardholderName = `${formData.paymentFirstName} ${formData.paymentLastName}`;

      const paymentRequest = {
        cardNumber: keepDigits(formData.cardNumber),
        expirationDate: expirationDate,
        cardholderName: cardholderName,
        billingAddress: billingAddress,
        promotionId: (formData.appliedPromo?.promotionId && formData.appliedPromo.promotionId > 0) 
          ? formData.appliedPromo.promotionId 
          : null,
        finalTotalAmount: finalTotalAmount || null,
      };

      const response = await fetch(buildUrl(`/api/bookings/${bookingId}/complete-payment`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAuthToken() || ''}`,
        },
        body: JSON.stringify(paymentRequest),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh saved payment cards to show the newly added card
        const userId = getUserIdFromToken();
        if (userId) {
          try {
            const cards = await paymentClient.getCards(userId);
            setSavedPaymentCards(cards);
          } catch (error) {
            console.error('Error refreshing payment cards:', error);
            // Don't block payment completion if refresh fails
          }
        }
        
        if (onPaymentComplete) {
          onPaymentComplete();
        }
      } else {
        showToast(data.error || 'Payment failed', 'error');
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error('Error completing payment:', error);
      showToast('Failed to complete payment. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  const renderBillingForm = () => (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: 'First Name', key: 'billingFirstName' },
          { label: 'Last Name', key: 'billingLastName' },
        ].map(({ label, key }) => (
          <FormField
            key={key}
            label={label}
            value={formData[key as keyof CheckoutFormData]}
            onChange={(value) => updateFormData(key as keyof CheckoutFormData, value)}
          />
        ))}
      </div>

      <FormField
        label="Email Address"
        type="email"
        value={formData.billingEmail}
        onChange={(value) => updateFormData('billingEmail', value)}
      />

      <FormField
        label="Address Line"
        value={formData.billingAddress}
        onChange={(value) => updateFormData('billingAddress', value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Zip Code"
          value={formData.billingZip}
          onChange={(value) => updateFormData('billingZip', value)}
        />
        <FormField
          label="City"
          value={formData.billingCity}
          onChange={(value) => updateFormData('billingCity', value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="State"
          value={formData.billingState}
          onChange={(value) => updateFormData('billingState', value)}
        />
        <FormField
          label="Country"
          value={formData.billingCountry}
          onChange={(value) => updateFormData('billingCountry', value)}
          withChevron
        />
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-6">
      {/* Saved Payment Cards Selection */}
      {savedPaymentCards.length > 0 && (
        <div className="space-y-3">
          <label className="block text-white text-sm font-semibold">Select a saved payment method</label>
          <div className="space-y-2">
            {savedPaymentCards.map((card) => {
              const maskedCard = card.cardNumber ? `**** **** **** ${card.cardNumber.slice(-4)}` : '****';
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => handleSelectSavedCard(card.id)}
                  className={`w-full p-4 rounded-md border-2 transition-all text-left ${
                    selectedCardId === card.id
                      ? 'border-acm-pink bg-acm-pink/10'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                  title={`Select ${card.cardholderName}'s ${card.paymentCardType} card`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{card.cardholderName}</p>
                      <p className="text-white/70 text-sm">{maskedCard}</p>
                      <p className="text-white/60 text-xs mt-1">
                        {card.paymentCardType?.toUpperCase()} • Expires {card.expirationDate}
                        {card.isDefault && ' • Default'}
                      </p>
                    </div>
                    {selectedCardId === card.id && (
                      <div className="text-acm-pink text-xl">✓</div>
                    )}
                  </div>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => handleSelectSavedCard(null)}
              className={`w-full p-4 rounded-md border-2 transition-all text-left ${
                selectedCardId === null
                  ? 'border-acm-pink bg-acm-pink/10'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
              }`}
              title="Enter a new payment method"
            >
              <div className="flex items-center justify-between">
                <p className="text-white font-semibold">Enter new payment method</p>
                {selectedCardId === null && (
                  <div className="text-acm-pink text-xl">✓</div>
                )}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Payment Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <FormField
            label="First Name"
            value={formData.paymentFirstName}
            onChange={(value) => updateFormData('paymentFirstName', value)}
          />

        <SelectField
          label="Card Type"
          value={formData.cardType}
          options={[
            { value: '', label: 'Select Card Type' },
            { value: 'visa', label: 'Visa' },
            { value: 'mastercard', label: 'Mastercard' },
            { value: 'amex', label: 'American Express' },
            { value: 'discover', label: 'Discover' },
          ]}
          onChange={(value) => updateFormData('cardType', value)}
        />

        <FormField
          label="Card Number"
          value={formattedCardNumber}
          onChange={(value) => updateFormData('cardNumber', value)}
          maxLength={19}
        />
      </div>

      <div className="space-y-4">
        <FormField
          label="Last Name"
          value={formData.paymentLastName}
          onChange={(value) => updateFormData('paymentLastName', value)}
        />

        <FormField
          label="CVV"
          value={formData.cvv}
          onChange={(value) => updateFormData('cvv', keepDigits(value).slice(0, 4))}
          placeholder="123"
        />

        <div>
          <label className="block text-white text-sm mb-2">Expiration</label>
          <div className="grid grid-cols-2 gap-3">
            <SelectField
              value={formData.expirationMonth}
              options={[{ value: '', label: 'Month' }, ...monthOptions.map((m) => ({ value: m, label: m }))]}
              onChange={(value) => updateFormData('expirationMonth', value)}
            />
            <SelectField
              value={formData.expirationYear}
              options={[{ value: '', label: 'Year' }, ...yearOptions.map((y) => ({ value: y, label: y }))]}
              onChange={(value) => updateFormData('expirationYear', value)}
            />
          </div>
        </div>
      </div>
    </div>
    </div>
  );

  const renderPromoForm = () => (
    <div className="space-y-4">
      <label className="block text-white font-semibold text-sm">Enter code here</label>
      <div className="flex gap-2">
        <FormField
          value={formData.promoCode}
          onChange={(value) => updateFormData('promoCode', value.toUpperCase())}
          placeholder="e.g. ZYSH"
        />
        <button
          type="button"
          onClick={handleApplyPromo}
          disabled={isValidatingPromo || !formData.promoCode.trim()}
          className="px-6 py-3 rounded-md font-afacad font-bold text-white bg-gradient-to-r from-acm-pink to-acm-orange hover:brightness-110 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          title="Apply promo code"
        >
          {isValidatingPromo ? 'Validating...' : 'Apply'}
        </button>
      </div>
      {formData.appliedPromo && (
        <div className="p-4 bg-green-900/30 border border-green-500/50 rounded-md">
          <p className="text-green-400 font-semibold">{formData.appliedPromo.code}</p>
          <p className="text-green-300 text-sm">
            {formData.appliedPromo.type === 'percentage'
              ? `${formData.appliedPromo.discount}% off`
              : `$${formData.appliedPromo.discount.toFixed(2)} off`}
          </p>
        </div>
      )}
    </div>
  );

  const renderReview = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <ReviewCard title="Payment Method">
        {maskedCard && (
          <>
            <p className="text-white/70 text-sm">{cardLabel} ending in</p>
            <p className="text-white font-semibold mt-1">{maskedCard}</p>
          </>
        )}
      </ReviewCard>

      <ReviewCard title="Billing Address">
        {(formData.billingFirstName || formData.billingLastName) && (
          <>
            <p>{formData.billingFirstName} {formData.billingLastName}</p>
            {formData.billingAddress && <p className="text-white/80 text-sm mt-1">{formData.billingAddress}</p>}
            {(formData.billingCity || formData.billingState || formData.billingCountry) && (
              <p className="text-white/60 text-sm mt-1">
                {[formData.billingCity, formData.billingState, formData.billingCountry]
                  .filter(Boolean)
                  .join(', ')}
              </p>
            )}
          </>
        )}
      </ReviewCard>

      <ReviewCard title="Promo Code">
        {formData.appliedPromo ? (
          <p className="text-white font-semibold">{formData.appliedPromo.code}</p>
        ) : (
          <p className="text-white/60 text-sm">No promo code applied</p>
        )}
      </ReviewCard>
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepCard title="Billing Address" gradient={gradientForward}>
            {renderBillingForm()}
            <StepActions onNext={() => setCurrentStep(2)} />
          </StepCard>
        );
      case 2:
        return (
          <StepCard title="Payment" gradient={gradientForward}>
            {renderPaymentForm()}
            <StepActions 
              onPrev={() => setCurrentStep(1)} 
              onNext={() => {
                if (!formData.paymentFirstName || !formData.paymentLastName || !formData.cardNumber || !formData.cvv) {
                  showToast('Please complete payment information', 'error');
                  return;
                }

                if (!formData.cardType) {
                  showToast('Please select a card type', 'error');
                  return;
                }

                if (!formData.expirationMonth || !formData.expirationYear) {
                  showToast('Please enter card expiration date', 'error');
                  return;
                }

                const cleaned = formData.cardNumber.replace(/\s/g, '');
                
                if (cleaned.length < 13 || cleaned.length > 19) {
                  showToast('Card number must be 13-19 digits', 'error');
                  return;
                }
                
                if (!/^\d+$/.test(cleaned)) {
                  showToast('Card number must contain only digits', 'error');
                  return;
                }
                
                // Case-insensitive card type comparison
                const normalizedCardType2 = formData.cardType?.toLowerCase();
                if (normalizedCardType2 === 'visa' && (cleaned.length !== 16 || !cleaned.startsWith('4'))) {
                  showToast('Visa cards must be 16 digits and start with 4', 'error');
                  return;
                } else if ((normalizedCardType2 === 'mastercard' || normalizedCardType2 === 'master card') && (cleaned.length !== 16 || !cleaned.startsWith('5'))) {
                  showToast('Mastercard must be 16 digits and start with 5', 'error');
                  return;
                } else if ((normalizedCardType2 === 'amex' || normalizedCardType2 === 'american express') && (cleaned.length !== 15 || (!cleaned.startsWith('34') && !cleaned.startsWith('37')))) {
                  showToast('American Express must be 15 digits and start with 34 or 37', 'error');
                  return;
                } else if (normalizedCardType2 === 'discover' && (cleaned.length !== 16 || !cleaned.startsWith('6'))) {
                  showToast('Discover cards must be 16 digits and start with 6', 'error');
                  return;
                }
                
                if (!luhnCheck(formData.cardNumber)) {
                  showToast('Invalid card number. The card number failed checksum validation. Please check and try again.', 'error');
                  return;
                }

                if (!validateExpirationDate(formData.expirationMonth, formData.expirationYear)) {
                  showToast('Please enter a valid expiration date', 'error');
                  return;
                }

                if (!validateCVV(formData.cvv)) {
                  showToast('CVV must be 3-4 digits', 'error');
                  return;
                }

                setCurrentStep(3);
              }} 
            />
          </StepCard>
        );
      case 3:
        return (
          <StepCard title="Promo Code" gradient={gradientForward}>
            {renderPromoForm()}
            <StepActions onPrev={() => setCurrentStep(2)} onNext={() => setCurrentStep(4)} />
          </StepCard>
        );
      case 4:
        return (
          <StepCard title="Review" gradient={gradientForward}>
            {renderReview()}
            <div className="mt-auto pt-6 flex justify-end gap-4">
              <GhostButton onClick={() => setCurrentStep(3)}>Back</GhostButton>
              <PrimaryButton onClick={handleCompletePayment} disabled={isProcessing || !bookingId}>
                {isProcessing ? 'Processing...' : 'Complete Payment'}
              </PrimaryButton>
            </div>
          </StepCard>
        );
      default:
        return (
          <StepCard title="Coming Soon" gradient={gradientReverse}>
            <p className="text-white/70">This step hasn’t been built yet.</p>
          </StepCard>
        );
    }
  };

  return (
    <div className="flex flex-row gap-8 h-full flex-1">
      <div className="flex-1 flex flex-col">{renderStep()}</div>
    </div>
  );
}


