'use client';

import React from 'react';
import { RegistrationData } from '@/contexts/RegistrationContext';
import AuthInput from '@/components/common/auth/AuthInput';

interface PersonalInfoSectionProps {
  data: RegistrationData;
  updateData: (stepData: Partial<RegistrationData>) => void;
  errors: { [key: string]: string };
  isLoading?: boolean;
}

export default function PersonalInfoSection({ data, updateData, errors, isLoading = false }: PersonalInfoSectionProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white/90 border-b border-white/10 pb-2">Personal Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AuthInput
          id="firstName"
          label="First Name"
          type="text"
          value={data.firstName}
          onChange={(e) => updateData({ firstName: e.target.value })}
          placeholder="Enter your first name"
          error={errors.firstName}
          required={true}
          disabled={isLoading}
        />

        <AuthInput
          id="lastName"
          label="Last Name"
          type="text"
          value={data.lastName}
          onChange={(e) => updateData({ lastName: e.target.value })}
          placeholder="Enter your last name"
          error={errors.lastName}
          required={true}
          disabled={isLoading}
        />
      </div>

      <AuthInput
        id="phoneNumber"
        label="Phone Number"
        type="tel"
        value={data.phoneNumber}
        onChange={(e) => updateData({ phoneNumber: e.target.value })}
        placeholder="(555) 123-4567"
        error={errors.phoneNumber}
        required={true}
        disabled={isLoading}
      />
    </div>
  );
}
