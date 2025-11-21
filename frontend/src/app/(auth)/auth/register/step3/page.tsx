'use client';

<<<<<<< HEAD
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegistration } from '@/contexts/RegistrationContext';
import { authAPI } from '@/clients/auth';
import AuthFormContainer from '@/components/common/auth/AuthFormContainer';
import AuthButtonGroup from '@/components/common/auth/AuthButtonGroup';
import PaymentSection from '@/components/specific/auth/PaymentSection';
import PreferencesSection from '@/components/specific/auth/PreferencesSection';
import { PaymentCard } from '@/contexts/RegistrationContext';
=======
import RegisterStep3Form from '@/components/specific/auth/RegisterStep3Form';
>>>>>>> thai_d7_troubleshoot

export default function RegisterStep3Page() {
  // AuthFormContainer already includes NavBar and proper layout
  return <RegisterStep3Form />;
}
