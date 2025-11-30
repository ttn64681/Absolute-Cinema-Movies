'use client';

import { useState, useMemo } from 'react';
import { useToast } from '@/contexts/ToastContext';
import { buildUrl } from '@/config/api';
import { getAuthToken } from '@/utils/auth';

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
  let output = '';
  for (let i = 0; i < value.length; i += 1) {
    const ch = value[i];
    if (ch >= '0' && ch <= '9') {
      output += ch;
    }
  }
  return output;
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

  const updateFormData = (key: keyof CheckoutFormData, value: string | CheckoutFormData['appliedPromo']) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
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
    let sum = 0;
    let isEven = false;
    
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
  const validateCardNumber = (cardNumber: string, cardType?: string): boolean => {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (!/^\d{13,19}$/.test(cleaned)) {
      return false;
    }
    
    if (cardType) {
      if (cardType === 'visa' && (cleaned.length !== 16 || !cleaned.startsWith('4'))) {
        return false;
      } else if (cardType === 'mastercard' && (cleaned.length !== 16 || !cleaned.startsWith('5'))) {
        return false;
      } else if (cardType === 'amex' && (cleaned.length !== 15 || (!cleaned.startsWith('34') && !cleaned.startsWith('37')))) {
        return false;
      } else if (cardType === 'discover' && (cleaned.length !== 16 || !cleaned.startsWith('6'))) {
        return false;
      }
    } else {
      if (cleaned.length !== 16) {
        return false;
      }
    }
    
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
        const promo = {
          code: formData.promoCode.trim().toUpperCase(),
          discount: data.discountValue,
          type: data.discountType,
          promotionId: data.promotionId,
        };
        updateFormData('appliedPromo', promo);
        if (onPromoApplied) {
          onPromoApplied(data.discountValue, data.discountType, data.promotionId);
        }
        showToast(`Promo code "${promo.code}" applied successfully!`, 'success');
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
    
    if (formData.cardType === 'visa' && (cleaned.length !== 16 || !cleaned.startsWith('4'))) {
      showToast('Visa cards must be 16 digits and start with 4', 'error');
      setCurrentStep(2);
      return;
    } else if (formData.cardType === 'mastercard' && (cleaned.length !== 16 || !cleaned.startsWith('5'))) {
      showToast('Mastercard must be 16 digits and start with 5', 'error');
      setCurrentStep(2);
      return;
    } else if (formData.cardType === 'amex' && (cleaned.length !== 15 || (!cleaned.startsWith('34') && !cleaned.startsWith('37')))) {
      showToast('American Express must be 15 digits and start with 34 or 37', 'error');
      setCurrentStep(2);
      return;
    } else if (formData.cardType === 'discover' && (cleaned.length !== 16 || !cleaned.startsWith('6'))) {
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
          onChange={(value) => updateFormData('cvv', value.replace(/\D/g, '').slice(0, 4))}
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
                
                if (formData.cardType === 'visa' && (cleaned.length !== 16 || !cleaned.startsWith('4'))) {
                  showToast('Visa cards must be 16 digits and start with 4', 'error');
                  return;
                } else if (formData.cardType === 'mastercard' && (cleaned.length !== 16 || !cleaned.startsWith('5'))) {
                  showToast('Mastercard must be 16 digits and start with 5', 'error');
                  return;
                } else if (formData.cardType === 'amex' && (cleaned.length !== 15 || (!cleaned.startsWith('34') && !cleaned.startsWith('37')))) {
                  showToast('American Express must be 15 digits and start with 34 or 37', 'error');
                  return;
                } else if (formData.cardType === 'discover' && (cleaned.length !== 16 || !cleaned.startsWith('6'))) {
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

// Sub-components ----------------------------------------------------------

interface FormFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  withChevron?: boolean;
}

function FormField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  maxLength,
  withChevron,
}: FormFieldProps) {
  return (
    <label className="block">
      {label && <span className="block text-white text-sm mb-2">{label}</span>}
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-md bg-transparent border border-white text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-pink-500"
        />
        {withChevron && (
          <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-white/60">⌄</span>
        )}
      </div>
    </label>
  );
}

interface SelectFieldProps {
  label?: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="block">
      {label && <span className="block text-white text-sm mb-2">{label}</span>}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-md bg-transparent border border-white text-white appearance-none focus:outline-none focus:ring-2 focus:ring-pink-500"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-black">
              {option.label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-white/60">⌄</span>
      </div>
    </label>
  );
}

interface StepCardProps {
  title: string;
  gradient: string;
  children: React.ReactNode;
}

function StepCard({ title, gradient, children }: StepCardProps) {
  return (
    <div className="p-[3px] rounded-2xl flex-1 flex flex-col" style={{ backgroundImage: gradient }}>
      <div className="bg-black rounded-2xl p-6 flex-1 flex flex-col">
        <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}

interface StepActionsProps {
  onPrev?: () => void;
  onNext?: () => void;
}

function StepActions({ onPrev, onNext }: StepActionsProps) {
  return (
    <div className="mt-auto pt-6 flex justify-between">
      {onPrev ? (
        <GhostButton onClick={onPrev}>Back</GhostButton>
      ) : (
        <span />
      )}
      {onNext && <PrimaryButton onClick={onNext}>Next</PrimaryButton>}
    </div>
  );
}

function ReviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-3">{title}</h3>
      <div className="text-white/90 text-sm space-y-1 min-h-[60px]">{children}</div>
    </div>
  );
}

function GhostButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-white px-5 py-2 rounded-full border border-white hover:bg-white/10 transition-colors font-afacad"
    >
      {children}
    </button>
  );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-white text-black px-5 py-2 rounded-full hover:opacity-90 transition-colors font-afacad font-bold"
    >
      {children}
    </button>
  );
}

