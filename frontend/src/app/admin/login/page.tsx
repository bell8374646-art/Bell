// page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  IconLock,
  IconMail,
  IconLoader2,
  IconShield,
  IconAlertCircle,
  IconArrowRight,
  IconBell,
} from '@tabler/icons-react';
import { adminApi, setAccessToken } from '@/utils/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [require2FA, setRequire2FA] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await adminApi.login({ email, password });
      if (data.require2FA) {
        setRequire2FA(true);
        setTempToken(data.tempToken);
      } else {
        setAccessToken(data.accessToken);
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2Fa = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!tempToken) {
      setError('Session expired. Please try logging in again.');
      setRequire2FA(false);
      setLoading(false);
      return;
    }

    try {
      const data = await adminApi.verify2Fa({ tempToken, code });
      setAccessToken(data.accessToken);
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err?.message || '2FA verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 relative overflow-hidden bg-primary-bg">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand/Header */}
        <div className="text-center mb-8 flex flex-col items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group mb-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-glass border border-accent-gold/30 group-hover:border-accent-gold/80 transition-all duration-300">
              <IconBell className="h-6 w-6 text-accent-gold group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-display text-2xl font-bold tracking-wider text-text-primary">
              BELL COIN
            </span>
          </Link>
          <span className="font-display text-xs font-bold uppercase tracking-widest text-accent-gold">
            Administration Portal
          </span>
        </div>

        {/* Card */}
        <div className="glass-panel p-8 gold-glow border-accent-gold/25 relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-gold/40 to-transparent" />

          <h2 className="font-display text-xl font-bold text-text-primary mb-6 text-center">
            {require2FA ? 'Two-Factor Authentication' : 'Admin Sign In'}
          </h2>

          {error && (
            <div className="mb-6 rounded-lg bg-red-950/45 border border-red-500/25 p-3 flex items-start gap-2.5 text-xs text-red-200">
              <IconAlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {!require2FA ? (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <IconMail className="absolute left-3 h-5 w-5 text-text-secondary/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@bellcoin.com"
                    className="w-full rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-3 pl-10 pr-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-none transition-colors placeholder:text-text-secondary/35"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Password
                </label>
                <div className="relative flex items-center">
                  <IconLock className="absolute left-3 h-5 w-5 text-text-secondary/60" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-3 pl-10 pr-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-none transition-colors placeholder:text-text-secondary/35"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-accent-gold py-3 text-sm font-bold text-primary-bg hover:bg-accent-champagne hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md shadow-accent-gold/15 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <IconLoader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <IconArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify2Fa} className="flex flex-col gap-4">
              <p className="text-xs text-text-secondary leading-relaxed mb-2 text-center">
                Please open your authenticator app and enter the 6-digit verification code.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  Verification Code
                </label>
                <div className="relative flex items-center">
                  <IconShield className="absolute left-3 h-5 w-5 text-text-secondary/60" />
                  <input
                    type="text"
                    maxLength={6}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    required
                    placeholder="123456"
                    className="w-full rounded-lg bg-primary-bg/50 border border-accent-gold/15 py-3 pl-10 pr-4 text-sm text-text-primary focus:border-accent-gold/50 focus:outline-none transition-colors tracking-widest font-mono text-center placeholder:tracking-normal placeholder:text-text-secondary/35"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-accent-gold py-3 text-sm font-bold text-primary-bg hover:bg-accent-champagne hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md shadow-accent-gold/15 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <IconLoader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Verify Code
                    <IconArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setRequire2FA(false)}
                className="mt-2 text-xs text-accent-gold/75 hover:text-accent-gold hover:underline transition-colors text-center cursor-pointer"
              >
                Back to Sign In
              </button>
            </form>
          )}
        </div>

        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-text-secondary hover:text-accent-gold transition-colors inline-flex items-center gap-1"
          >
            ← Back to main site
          </Link>
        </div>
      </div>
    </div>
  );
}
