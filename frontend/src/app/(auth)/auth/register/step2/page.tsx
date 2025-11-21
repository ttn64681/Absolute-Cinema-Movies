'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/common/navBar/NavBar';
import { useRegistration } from '@/contexts/RegistrationContext';
import { validatePhoneNumber } from '@/services/auth';
import AuthInput from '@/components/common/auth/AuthInput';

export default function RegisterStep2Page() {
  const { data, updateData, isStepValid } = useRegistration();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Create new errors object to avoid async state issues
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

    // Set errors and only proceed if no errors
    // Using newErrors instead of checking old errors state prevents async issues
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

  return (
    <div className="min-h-screen bg-black">
      <NavBar />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 pt-16">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white">Create an Account</h1>
              <p className="text-white/70 text-sm mt-1">Step 2 of 3</p>
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

              {/* Home Address - Optional */}
              <div className="pt-4 border-t border-white/10">
                <h3 className="text-white font-semibold mb-4">Home Address (Optional)</h3>

                <div className="space-y-4">
                  {/* Street Address */}
                  <div>
                    <label htmlFor="homeAddress" className="block text-white text-sm mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="homeAddress"
                      value={data.homeAddress || ''}
                      onChange={(e) => updateData({ homeAddress: e.target.value })}
                      placeholder="Input text"
                      className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                    />
                  </div>

                  {/* City, State, ZIP */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="homeCity" className="block text-white text-sm mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        id="homeCity"
                        value={data.homeCity || ''}
                        onChange={(e) => updateData({ homeCity: e.target.value })}
                        placeholder="Input text"
                        className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="homeState" className="block text-white text-sm mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        id="homeState"
                        value={data.homeState || ''}
                        onChange={(e) => updateData({ homeState: e.target.value })}
                        placeholder="Input text"
                        className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="homeZip" className="block text-white text-sm mb-2">
                        ZIP
                      </label>
                      <input
                        type="text"
                        id="homeZip"
                        value={data.homeZip || ''}
                        onChange={(e) => updateData({ homeZip: e.target.value })}
                        placeholder="Input text"
                        className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div>
                    <label htmlFor="homeCountry" className="block text-white text-sm mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      id="homeCountry"
                      value={data.homeCountry || ''}
                      onChange={(e) => updateData({ homeCountry: e.target.value })}
                      placeholder="Input text"
                      className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

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
      </div>
    </div>
  );
}
