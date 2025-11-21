'use client';

import NavBar from '@/components/common/navBar/NavBar';
<<<<<<< HEAD
import { useRegistration } from '@/contexts/RegistrationContext';
import { validatePhoneNumber } from '@/clients/auth';
import AuthInput from '@/components/common/auth/AuthInput';
=======
import RegisterStep2Form from '@/components/specific/auth/RegisterStep2Form';
>>>>>>> thai_d7_troubleshoot

export default function RegisterStep2Page() {
  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <div className="flex items-center justify-center min-h-screen px-4 py-20">
        <RegisterStep2Form />
      </div>
    </div>
  );
}
