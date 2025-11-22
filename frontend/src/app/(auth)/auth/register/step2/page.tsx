'use client';

import NavBar from '@/components/common/navBar/NavBar';
import RegisterStep2Form from '@/components/specific/auth/RegisterStep2Form';

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
