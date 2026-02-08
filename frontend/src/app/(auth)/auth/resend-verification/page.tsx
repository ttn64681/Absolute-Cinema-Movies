'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/config/api';
import AuthFormContainer from '@/components/common/auth/AuthFormContainer';

export default function ResendVerificationPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await api.post(`/api/auth/resend-verification?email=${encodeURIComponent(email)}`);

      if (response.data.success) {
        setStatus('success');
        setMessage('Verification email has been sent. Check your inbox and spam folder.');

        setTimeout(() => {
          router.push('/auth/verify-email');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(response.data.message || 'Failed to send verification email.');
      }
    } catch (error) {
      setStatus('error');
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Failed to send verification email. Please try again.';
      setMessage(errorMessage);
    }
  };

  return (
    <AuthFormContainer
      title="Resend Verification Email"
      subtitle="Enter your email to receive a new verification link."
      maxWidth="md"
    >
      <div className="space-y-6">
        {message && (
          <div
            className={`p-4 rounded-lg border text-sm ${
              status === 'success'
                ? 'bg-green-900/40 border-green-500/60 text-green-200'
                : status === 'error'
                  ? 'bg-red-900/40 border-red-500/60 text-red-200'
                  : 'bg-white/10 border-white/20 text-white/80'
            }`}
          >
            {message}
          </div>
        )}

        {status !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                title="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                placeholder="Your email"
                required
                disabled={status === 'loading'}
              />
            </div>

            <button
              type="submit"
              title="Send verification email"
              disabled={status === 'loading'}
              className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-acm-pink to-acm-orange hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {status === 'loading' ? 'Sending...' : 'Send verification email'}
            </button>
          </form>
        )}

        <div className="text-center text-sm text-white/60 space-y-1 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={() => router.push('/auth/login')}
            className="block w-full text-white/70 hover:text-acm-pink transition-colors cursor-pointer"
          >
            Already verified? Sign in
          </button>
          <button
            type="button"
            onClick={() => router.push('/auth/register')}
            className="block w-full text-white/70 hover:text-acm-pink transition-colors cursor-pointer"
          >
            Don&apos;t have an account? Register
          </button>
        </div>
      </div>
    </AuthFormContainer>
  );
}
