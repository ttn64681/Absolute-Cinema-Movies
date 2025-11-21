'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Checkbox from '@/components/common/forms/Checkbox';
import AuthFormContainer from '@/components/common/auth/AuthFormContainer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { validateEmail } from '@/clients/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validate email format
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        setIsLoading(false);
        return;
      }

      // Call AuthContext login function
      const response = await login(email, password, rememberMe);

      if (response.success) {
        // Show toast notification and redirect immediately
        showToast('Welcome! Login successful', 'success');
        router.push('/');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthFormContainer title="Login" subtitle="Welcome back to ACM">
      {error && (
        <div className="mb-4 p-3 bg-red-900/40 border border-red-500/60 rounded-md">
          <p className="text-red-200 text-sm">{error}</p>
          {error.includes('verify your email') && (
            <div className="mt-2">
              <Link href="/auth/resend-verification" className="text-blue-300 hover:text-blue-200 text-sm underline">
                Resend verification email
              </Link>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-white text-sm mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-white text-sm mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="w-full px-4 py-3 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
            required
            disabled={isLoading}
          />
        </div>

        <div className="flex items-center justify-between">
          <Checkbox
            id="rememberMe"
            label="Remember Me"
            checked={rememberMe}
            onChange={setRememberMe}
            disabled={isLoading}
          />
          <Link 
            href="/auth/forgot-password" 
            className="text-sm text-acm-pink hover:text-acm-pink/80 transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full inline-flex justify-center bg-gradient-to-r from-acm-pink to-acm-orange text-white px-5 py-2.5 rounded-lg font-semibold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed drop-shadow-lg"
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <p className="text-white/70 text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-acm-pink hover:text-acm-pink/80 transition-colors">
            Sign up
          </Link>
        </p>
        
        <div className="border-t border-white/10 pt-3">
          <p className="text-white/60 text-sm mb-2">Administrator Access</p>
          <Link 
            href="/auth/admin-login" 
            className="text-acm-orange hover:text-acm-orange/80 transition-colors text-sm font-medium"
          >
            Login as Admin
          </Link>
        </div>
      </div>
    </AuthFormContainer>
  );
}
