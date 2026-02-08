'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import NavBar from '@/components/common/navBar/NavBar';
import api from '@/config/api';

/**
 * Email Verification Page Content
 *
 * This component handles email verification when users click the link in their verification email.
 * It extracts the token from the URL and calls the backend verification endpoint.
 */
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'registration-success'>('verifying');
  const [message, setMessage] = useState('Verifying your email...');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [resendMessage, setResendMessage] = useState('');
  const [demoEmail, setDemoEmail] = useState('');
  const [realCodeInput, setRealCodeInput] = useState('');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState<'idle' | 'realCode' | 'demo'>('idle');
  const [verifyMode, setVerifyMode] = useState<'real' | 'demo'>('real');

  const DEMO_VERIFICATION_CODE = '123456';

  /** Extract token from pasted link (e.g. .../verify-email?token=xxx) or use raw value as token. */
  function extractTokenFromInput(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const tokenMatch = trimmed.match(/[?&]token=([^&]+)/);
    if (tokenMatch) return decodeURIComponent(tokenMatch[1]);
    return trimmed;
  }

  useEffect(() => {
    const verifyEmail = async () => {
      // Get token from URL query parameter
      const token = searchParams.get('token');

      if (!token) {
        // Check if this is a redirect from registration (no token but coming from registration flow)
        const fromRegistration = searchParams.get('from') === 'registration';

        if (fromRegistration) {
          setStatus('registration-success');
          setMessage(
            'Registration successful! A verification email has been sent to your inbox. Please check your email and click the verification link to activate your account.'
          );
        } else {
          setStatus('error');
          setMessage(
            'No verification token found. If you clicked a verification link, please try again. Otherwise, use the form below to request a new verification email.'
          );
        }
        return;
      }

      try {
        // Call verification endpoint
        const response = await api.post(`/api/auth/verify-email?token=${token}`);

        if (response.data.success) {
          setStatus('success');
          setMessage(response.data.message || 'Email verified successfully!');

          // Store JWT tokens
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
          }
          if (response.data.refreshToken) {
            localStorage.setItem('refreshToken', response.data.refreshToken);
          }
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }

          // Redirect to login page after 2 seconds with redirect parameter if present
          setTimeout(() => {
            const loginUrl = redirectPath ? `/auth/login?redirect=${encodeURIComponent(redirectPath)}` : '/auth/login';
            router.push(loginUrl);
          }, 2000);
        } else {
          setStatus('error');
          setMessage(response.data.message || 'Verification failed.');
        }
      } catch (error) {
        setStatus('error');
        const errorMessage =
          (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
          'Verification failed. The token may be invalid or expired.';

        // Add more helpful context
        if (errorMessage.includes('expired')) {
          setMessage(
            'This verification link has expired (valid for 24 hours). Please request a new verification email below.'
          );
        } else if (errorMessage.includes('Invalid')) {
          setMessage(
            'This verification link is invalid or has already been used. If you already verified your account, you can try logging in. Otherwise, request a new verification email below.'
          );
        } else {
          setMessage(`Verification failed: ${errorMessage}. Please request a new verification email below.`);
        }
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const handleResendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resendEmail.trim()) {
      setResendStatus('error');
      setResendMessage('Please enter your email address.');
      return;
    }

    setResendStatus('loading');
    setResendMessage('Sending verification email...');

    try {
      console.log('Sending resend verification request for:', resendEmail.trim());
      const response = await api.post(`/api/auth/resend-verification?email=${encodeURIComponent(resendEmail.trim())}`);

      console.log('Resend verification response:', response.data);

      if (response.data.success) {
        setResendStatus('success');
        setResendMessage('Verification email has been sent! Please check your inbox and spam folder.');
        setResendEmail(''); // Clear the form
      } else {
        setResendStatus('error');
        setResendMessage(response.data.message || 'Failed to send verification email.');
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setResendStatus('error');
      const errorMessage =
        (error as { response?: { data?: { message?: string } } }).response?.data?.message ||
        'Failed to send verification email. Please try again.';
      setResendMessage(errorMessage);
    }
  };

  const handleRealCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = extractTokenFromInput(realCodeInput);
    if (!token) {
      setFormError('Paste the verification link or code from your email.');
      return;
    }
    setFormError('');
    setFormLoading('realCode');
    try {
      const response = await api.post(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
      if (response.data.success) {
        if (response.data.token) localStorage.setItem('token', response.data.token);
        if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);
        if (response.data.user) localStorage.setItem('user', JSON.stringify(response.data.user));
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        setTimeout(() => {
          const loginUrl = redirectPath ? `/auth/login?redirect=${encodeURIComponent(redirectPath)}` : '/auth/login';
          router.push(loginUrl);
        }, 2000);
      } else {
        setFormError(response.data.message || 'Verification failed.');
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Invalid or expired code.';
      setFormError(msg);
    } finally {
      setFormLoading('idle');
    }
  };

  const handleDemoVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoEmail.trim()) {
      setFormError('Enter your email address.');
      return;
    }
    setFormError('');
    setFormLoading('demo');
    try {
      const response = await api.post(
        `/api/auth/verify-email?token=${encodeURIComponent(DEMO_VERIFICATION_CODE)}&email=${encodeURIComponent(demoEmail.trim())}`
      );
      if (response.data.success) {
        if (response.data.token) localStorage.setItem('token', response.data.token);
        if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);
        if (response.data.user) localStorage.setItem('user', JSON.stringify(response.data.user));
        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully!');
        setTimeout(() => {
          const loginUrl = redirectPath ? `/auth/login?redirect=${encodeURIComponent(redirectPath)}` : '/auth/login';
          router.push(loginUrl);
        }, 2000);
      } else {
        setFormError(response.data.message || 'Verification failed.');
      }
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Verification failed.';
      setFormError(msg);
    } finally {
      setFormLoading('idle');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <NavBar />

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 translate-y-[5rem]">
        <div className="w-full max-w-lg">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl">
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Email Verification</h1>
              <p className="text-white/70 text-sm mt-1">Verify your email address to continue</p>
            </div>

            {/* Demo disclaimer: sandbox, bypass code for recruiters/guests */}
            <div className="mb-6 p-3 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs">
              <p className="font-medium text-white/70 mb-1">Demo environment</p>
              <p className="mb-1">Emails are trapped in a sandbox. Use this code to bypass verification:</p>
              <p className="font-mono font-semibold text-acm-pink/90">{DEMO_VERIFICATION_CODE}</p>
            </div>

            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              {status === 'verifying' && (
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-acm-pink"></div>
              )}
              {status === 'success' && (
                <div className="rounded-full h-16 w-16 bg-green-900/40 border border-green-500/60 flex items-center justify-center">
                  <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {status === 'registration-success' && (
                <div className="rounded-full h-16 w-16 bg-green-900/40 border border-green-500/60 flex items-center justify-center">
                  <svg className="h-10 w-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
              {status === 'error' && (
                <div className="rounded-full h-16 w-16 bg-red-900/40 border border-red-500/60 flex items-center justify-center">
                  <svg className="h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </div>

            {/* Message */}
            <div
              className={`text-center mb-6 p-4 rounded-lg ${
                status === 'verifying'
                  ? 'bg-blue-900/40 border border-blue-500/60 text-blue-200'
                  : status === 'success'
                    ? 'bg-green-900/40 border border-green-500/60 text-green-200'
                    : status === 'registration-success'
                      ? 'bg-green-900/40 border border-green-500/60 text-green-200'
                      : 'bg-red-900/40 border border-red-500/60 text-red-200'
              }`}
            >
              <p className="text-lg font-medium">{message}</p>
              {status === 'success' && <p className="text-sm mt-2 text-white/70">Redirecting to login...</p>}
              {status === 'registration-success' && (
                <p className="text-sm mt-2 text-white/70">
                  Check your email inbox and spam folder for the verification link.
                </p>
              )}
            </div>

            {/* Actions: single form like token-from-email, links for demo / resend / login */}
            {status === 'error' && (
              <div className="space-y-6 pt-2">
                {formError && (
                  <div className="p-3 rounded-lg bg-red-900/40 border border-red-500/60 text-red-200 text-sm">
                    {formError}
                  </div>
                )}
                {verifyMode === 'real' ? (
                  <form onSubmit={handleRealCodeVerify} className="space-y-4">
                    <label htmlFor="realCode" className="block text-sm font-medium text-white/80 mb-1">
                      Verification code from email
                    </label>
                    <input
                      type="text"
                      id="realCode"
                      title="Paste verification link or code from email"
                      value={realCodeInput}
                      onChange={(e) => setRealCodeInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                      placeholder="Paste link or code"
                      disabled={formLoading !== 'idle'}
                    />
                    <button
                      type="submit"
                      title="Verify"
                      disabled={formLoading !== 'idle'}
                      className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-acm-pink to-acm-orange hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {formLoading === 'realCode' ? 'Verifying...' : 'Verify'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleDemoVerify} className="space-y-4">
                    <label htmlFor="demoEmailError" className="block text-sm font-medium text-white/80 mb-1">
                      Your email (demo bypass)
                    </label>
                    <input
                      type="email"
                      id="demoEmailError"
                      title="Email used at registration"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                      placeholder="Your email"
                      disabled={formLoading !== 'idle'}
                    />
                    <button
                      type="submit"
                      title="Verify with demo code"
                      disabled={formLoading !== 'idle'}
                      className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-acm-pink to-acm-orange hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {formLoading === 'demo' ? 'Verifying...' : `Verify with code ${DEMO_VERIFICATION_CODE}`}
                    </button>
                  </form>
                )}
                <div className="text-center text-sm text-white/60 space-y-1 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyMode(verifyMode === 'real' ? 'demo' : 'real');
                      setFormError('');
                    }}
                    className="block w-full text-acm-pink hover:text-acm-pink/80 cursor-pointer"
                  >
                    {verifyMode === 'real' ? 'Use demo bypass' : 'Enter code from email'}
                  </button>
                  <Link
                    href="/auth/resend-verification"
                    className="block text-white/70 hover:text-acm-pink transition-colors cursor-pointer"
                  >
                    Resend verification email
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      const loginUrl = redirectPath
                        ? `/auth/login?redirect=${encodeURIComponent(redirectPath)}`
                        : '/auth/login';
                      router.push(loginUrl);
                    }}
                    className="block w-full text-white/70 hover:text-acm-pink transition-colors cursor-pointer"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            )}

            {status === 'success' && (
              <button
                type="button"
                title="Go to Login"
                onClick={() => {
                  const loginUrl = redirectPath
                    ? `/auth/login?redirect=${encodeURIComponent(redirectPath)}`
                    : '/auth/login';
                  router.push(loginUrl);
                }}
                className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-acm-pink to-acm-orange hover:brightness-110 transition-all cursor-pointer"
              >
                Go to Login
              </button>
            )}

            {status === 'registration-success' && (
              <div className="space-y-6 pt-2">
                {formError && (
                  <div className="p-3 rounded-lg bg-red-900/40 border border-red-500/60 text-red-200 text-sm">
                    {formError}
                  </div>
                )}
                {verifyMode === 'real' ? (
                  <form onSubmit={handleRealCodeVerify} className="space-y-4">
                    <label htmlFor="realCodeReg" className="block text-sm font-medium text-white/80 mb-1">
                      Verification code from email
                    </label>
                    <input
                      type="text"
                      id="realCodeReg"
                      title="Paste verification link or code from email"
                      value={realCodeInput}
                      onChange={(e) => setRealCodeInput(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                      placeholder="Paste link or code"
                      disabled={formLoading !== 'idle'}
                    />
                    <button
                      type="submit"
                      title="Verify"
                      disabled={formLoading !== 'idle'}
                      className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-acm-pink to-acm-orange hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {formLoading === 'realCode' ? 'Verifying...' : 'Verify'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleDemoVerify} className="space-y-4">
                    <label htmlFor="demoEmail" className="block text-sm font-medium text-white/80 mb-1">
                      Your email (demo bypass)
                    </label>
                    <input
                      type="email"
                      id="demoEmail"
                      title="Email used at registration"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-acm-pink focus:border-transparent"
                      placeholder="Your email"
                      disabled={formLoading !== 'idle'}
                    />
                    <button
                      type="submit"
                      title="Verify with demo code"
                      disabled={formLoading !== 'idle'}
                      className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-acm-pink to-acm-orange hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {formLoading === 'demo' ? 'Verifying...' : `Verify with code ${DEMO_VERIFICATION_CODE}`}
                    </button>
                  </form>
                )}
                <div className="text-center text-sm text-white/60 space-y-1 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setVerifyMode(verifyMode === 'real' ? 'demo' : 'real');
                      setFormError('');
                    }}
                    className="block w-full text-acm-pink hover:text-acm-pink/80 cursor-pointer"
                  >
                    {verifyMode === 'real' ? 'Use demo bypass' : 'Enter code from email'}
                  </button>
                  <Link
                    href="/auth/resend-verification"
                    className="block text-white/70 hover:text-acm-pink transition-colors cursor-pointer"
                  >
                    Resend verification email
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      const loginUrl = redirectPath
                        ? `/auth/login?redirect=${encodeURIComponent(redirectPath)}`
                        : '/auth/login';
                      router.push(loginUrl);
                    }}
                    className="block w-full text-white/70 hover:text-acm-pink transition-colors cursor-pointer"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Need help?{' '}
              <a href="/support" className="text-acm-pink hover:text-acm-pink/80 underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
