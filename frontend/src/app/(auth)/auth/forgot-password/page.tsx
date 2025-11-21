'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/common/navBar/NavBar';
import { useToast } from '@/contexts/ToastContext';
<<<<<<< HEAD
import { validateEmail } from '@/clients/auth';
=======
import { validateEmail } from '@/clients/authClient';
>>>>>>> thai_d7_troubleshoot
import { buildUrl, endpoints } from '@/config/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      // Validate email format
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Call forgot password API
      const response = await fetch(buildUrl(endpoints.auth.forgotPassword), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `email=${encodeURIComponent(email)}`,
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setEmail(''); // Clear the email field
        showToast('Password reset email sent! Check your inbox.', 'success');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
              <p className="text-white/70 text-sm mt-1">Enter your email to reset your password</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-900/40 border border-red-500/60 rounded-md">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-4 p-3 bg-green-900/40 border border-green-500/60 rounded-md">
                <p className="text-green-200 text-sm">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center bg-gradient-to-r from-acm-pink to-acm-orange text-white px-5 py-2.5 rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-white/70 text-sm">
                Remember your password?{' '}
                <Link href="/auth/login" className="text-acm-pink hover:text-acm-pink/80 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
