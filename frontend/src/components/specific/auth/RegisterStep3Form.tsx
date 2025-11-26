'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegistration } from '@/contexts/RegistrationContext';
import { authClient } from '@/clients/authClient';
import AuthFormContainer from '@/components/common/auth/AuthFormContainer';
import AuthButtonGroup from '@/components/common/auth/AuthButtonGroup';
import PaymentSection from '@/components/specific/auth/PaymentSection';
import PreferencesSection from '@/components/specific/auth/PreferencesSection';
import { PaymentCard } from '@/contexts/RegistrationContext';

export default function RegisterStep3Form() {
  const { data, updateData, clearData, isStepValid } = useRegistration();
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setIsLoading(true);

    try {
      // Additional validation: check for partially filled cards before submission
      if (!isStepValid(3)) {
        setSubmitError('Please complete all fields for a payment card or leave it completely empty.');
        setIsLoading(false);
        return;
      }
      // Helper: Check if payment card is fully filled
      const isCardComplete = (card: PaymentCard): boolean => {
        return !!(
          card.cardType &&
          card.cardNumber &&
          card.expirationDate &&
          card.cvv &&
          card.billingStreet &&
          card.billingCity &&
          card.billingState &&
          card.billingZip
        );
      };

      // Filter out empty payment cards - only send fully filled ones
      const completePaymentCards = data.paymentCards.filter(isCardComplete);

      // Prepare registration data for backend
      // Transform payment cards to match backend DTO structure
      const paymentCardsForBackend =
        completePaymentCards.length > 0
          ? completePaymentCards.map((card) => ({
              cardType: card.cardType,
              cardNumber: card.cardNumber,
              expirationDate: card.expirationDate,
              cardholderName: `${data.firstName} ${data.lastName}`, // Use user's name as cardholder
              billingStreet: card.billingStreet,
              billingCity: card.billingCity,
              billingState: card.billingState,
              billingZip: card.billingZip,
              isDefault: card.isDefault,
            }))
          : undefined;

      const registrationData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        phoneNumber: data.phoneNumber,
        enrolledForPromotions: data.enrollForPromotions || false,
        homeAddress: data.homeAddress,
        homeCity: data.homeCity,
        homeState: data.homeState,
        homeZip: data.homeZip,
        homeCountry: data.homeCountry || 'US',
        paymentCards: paymentCardsForBackend,
      };

      // Call registration API
      const response = await authClient.register(registrationData);

      if (response.success) {
        // Clear registration data
        clearData();

        // Redirect to email verification page with registration flag
        router.push('/auth/verify-email?from=registration');
      } else {
        setSubmitError(response.message);
      }
    } catch (err) {
      setSubmitError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push('/auth/register/step2');
  };

  const handleSkip = () => {
    const fakeEvent = {
      preventDefault: () => {},
    } as React.FormEvent;
    handleSubmit(fakeEvent);
  };

  // Check if step 3 is valid (no partially filled payment cards)
  const isStep3Valid = isStepValid(3);

  return (
    <AuthFormContainer
      stepNumber={3}
      stepTitle="Payment & Preferences"
      stepDescription="Step 3 of 3 - Complete your profile"
      maxWidth="2xl"
    >
      {submitError && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-md">
          <p className="text-red-200 text-sm">{submitError}</p>
        </div>
      )}

      {/* Show warning if partially filled cards */}
      {!isStep3Valid && (
        <div className="mb-6 p-4 bg-yellow-900/50 border border-yellow-500 rounded-md">
          <p className="text-yellow-200 text-sm">
            ⚠️ Please complete all fields for a payment card or leave it completely empty.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <PaymentSection data={data} updateData={updateData} isLoading={isLoading} />

        <PreferencesSection data={data} updateData={updateData} isLoading={isLoading} />

        <AuthButtonGroup
          primaryText={isLoading ? 'Creating Account...' : 'Create Account'}
          primaryType="submit"
          primaryLoading={isLoading}
          primaryDisabled={isLoading || !isStep3Valid}
          secondaryText="Go Back"
          secondaryOnClick={handleGoBack}
          secondaryDisabled={isLoading}
          skipText="Skip payment info and create account"
          skipOnClick={handleSkip}
          skipDisabled={isLoading}
          className="pt-8"
        />
      </form>
    </AuthFormContainer>
  );
}

