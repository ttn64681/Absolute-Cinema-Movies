'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRegistration } from '@/contexts/RegistrationContext';
import { validateEmail, validatePassword, authAPI } from '@/clients/auth';
import AuthFormContainer from '@/components/common/auth/AuthFormContainer';
import AuthInput from '@/components/common/auth/AuthInput';
import AuthButton from '@/components/common/auth/AuthButton';

export default function RegisterPage() {
  const { data, updateData, isStepValid } = useRegistration();
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Create new errors object to avoid async state issues
    const newErrors: { [key: string]: string } = {};

    // Validate email
    if (!data.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(data.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!data.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message || 'Invalid password';
      }
    }

    // Validate confirm password
    if (!data.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Set errors and only proceed if no errors
    // Using newErrors instead of checking old errors state prevents async issues
    setErrors(newErrors);
    
    // If there are validation errors, don't proceed
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // If no validation errors, check email availability
    if (data.email && validateEmail(data.email)) {
      setIsCheckingEmail(true);
      try {
        const emailCheck = await authAPI.checkEmail(data.email);
        if (!emailCheck.success) {
          setErrors(prev => ({ ...prev, email: emailCheck.message }));
          setIsCheckingEmail(false);
          return;
        }
      } catch (error) {
        setErrors(prev => ({ ...prev, email: 'Error checking email availability. Please try again.' }));
        setIsCheckingEmail(false);
        return;
      }
      setIsCheckingEmail(false);
    }

    // If no errors, proceed to next step
    if (Object.keys(newErrors).length === 0 && isStepValid(1)) {
      router.push('/auth/register/step2');
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <AuthFormContainer
      stepNumber={1}
      stepTitle="Create an Account"
      stepDescription="Step 1 of 3 - Get started with your account"
    >
      {hasErrors && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-md">
          <p className="text-red-200 text-sm font-semibold mb-2">Please fix the following errors:</p>
          <ul className="list-disc list-inside text-red-200 text-sm space-y-1">
            {errors.email && <li>{errors.email}</li>}
            {errors.password && <li>{errors.password}</li>}
            {errors.confirmPassword && <li>{errors.confirmPassword}</li>}
          </ul>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <AuthInput
          id="email"
          label="Email Address"
          type="email"
          value={data.email}
          onChange={(e) => updateData({ email: e.target.value })}
          placeholder="you@example.com"
          error={errors.email}
          required={true}
        />

        <AuthInput
          id="password"
          label="Password"
          type="password"
          value={data.password}
          onChange={(e) => updateData({ password: e.target.value })}
          placeholder="••••••••"
          error={errors.password}
          required={true}
        />

        <AuthInput
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          value={data.confirmPassword}
          onChange={(e) => updateData({ confirmPassword: e.target.value })}
          placeholder="••••••••"
          error={errors.confirmPassword}
          required={true}
        />

        <AuthButton type="submit" variant="primary" disabled={isCheckingEmail}>
          {isCheckingEmail ? 'Checking email...' : 'Continue'}
        </AuthButton>
      </form>

      <div className="mt-6 text-center">
        <p className="text-white/60 text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-acm-pink hover:text-acm-orange transition-colors cursor-pointer">
            &nbsp;Sign in
          </Link>
        </p>
      </div>
    </AuthFormContainer>
  );
}
