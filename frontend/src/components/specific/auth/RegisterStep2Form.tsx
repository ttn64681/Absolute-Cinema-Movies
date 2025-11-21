'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegistration } from '@/contexts/RegistrationContext';
import { validatePhoneNumber } from '@/clients/authClient';
import AuthInput from '@/components/common/auth/AuthInput';
import HomeAddressFields from './HomeAddressFields';

export default function RegisterStep2Form() {
  const { data, updateData, isStepValid } = useRegistration();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    // Validate first name
    if (!data.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Validate last name
    if (!data.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Validate phone number
    if (!data.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(data.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    setErrors(newErrors);

    // If there are validation errors, don't proceed
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // If no errors, proceed to next step
    if (isStepValid(2)) {
      router.push('/auth/register/step3');
    }
  };

  const handleGoBack = () => {
    router.push('/auth/register');
  };

  const handleAddressChange = (field: string, value: string) => {
    updateData({ [field]: value });
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-xl">
        {/* Step Header with circle number */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-4">
            <span className="text-white/90 font-bold text-lg">2</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Personal Information</h1>
          <p className="text-white/60 text-sm">Step 2 of 3 - Tell us about yourself</p>
        </div>

        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-md">
            <p className="text-red-200 text-sm font-semibold mb-2">Please fix the following errors:</p>
            <ul className="list-disc list-inside text-red-200 text-sm space-y-1">
              {errors.firstName && <li>{errors.firstName}</li>}
              {errors.lastName && <li>{errors.lastName}</li>}
              {errors.phoneNumber && <li>{errors.phoneNumber}</li>}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <AuthInput
            id="firstName"
            label="First Name"
            type="text"
            value={data.firstName}
            onChange={(e) => updateData({ firstName: e.target.value })}
            placeholder="Input text"
            error={errors.firstName}
            required={true}
          />

          <AuthInput
            id="lastName"
            label="Last Name"
            type="text"
            value={data.lastName}
            onChange={(e) => updateData({ lastName: e.target.value })}
            placeholder="Input text"
            error={errors.lastName}
            required={true}
          />

          <AuthInput
            id="phoneNumber"
            label="Phone Number"
            type="tel"
            value={data.phoneNumber}
            onChange={(e) => updateData({ phoneNumber: e.target.value })}
            placeholder="Input text"
            error={errors.phoneNumber}
            required={true}
          />

          <HomeAddressFields
            homeAddress={data.homeAddress || ''}
            homeCity={data.homeCity || ''}
            homeState={data.homeState || ''}
            homeZip={data.homeZip || ''}
            homeCountry={data.homeCountry || ''}
            onAddressChange={handleAddressChange}
          />

          <div className="flex flex-col space-y-3 pt-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-acm-pink to-acm-orange text-white py-3 px-6 rounded-lg font-semibold hover:brightness-110 transition-all duration-200 shadow-lg hover:shadow-acm-pink/25"
            >
              Continue
            </button>
            <button
              type="button"
              onClick={handleGoBack}
              className="w-full bg-transparent border border-white/20 text-white/80 py-3 px-6 rounded-lg font-medium hover:bg-white/5 hover:text-white transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
