'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/admin';

  const [email, setEmail] = useState('neerajkumarmahato740@gmail.com');
  const [password, setPassword] = useState('123456!!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFillCredentials = () => {
    setEmail('neerajkumarmahato740@gmail.com');
    setPassword('123456!!');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'Invalid email or password');
      }

      setSuccess(true);
      // Seamless redirect to dashboard
      setTimeout(() => {
        router.push(redirectTarget);
        router.refresh();
      }, 500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during login.');
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#040e22] text-slate-100 overflow-hidden">
      {/* Ambient Radial Canvas Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[60rem] h-[40rem] rounded-full bg-[#09214b]/80 blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-[55rem] h-[35rem] rounded-full bg-[#061432] blur-[100px]" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[40rem] h-[25rem] rounded-full bg-[#e0a028]/10 blur-[130px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Card Container */}
        <div className="rounded-2xl border border-white/10 bg-[#09214b]/40 backdrop-blur-xl shadow-2xl p-8 transition-all">
          {/* Brand Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#09214b] to-[#061432] border border-[#e0a028]/40 flex items-center justify-center shadow-lg shadow-[#09214b]/60 mb-3 group">
              <ShieldCheck className="w-9 h-9 text-[#e0a028] transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0a028]/10 border border-[#e0a028]/30 text-xs font-medium text-[#e0a028] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Webphiser Education Portal</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Admin Control Center
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Sign in to manage courses, CBT quizzes & students
            </p>
          </div>

          {/* Quick Demo Credentials Badge */}
          <div
            onClick={handleFillCredentials}
            className="mb-6 p-3.5 rounded-xl bg-[#061432]/70 border border-[#e0a028]/25 hover:border-[#e0a028]/50 transition-colors cursor-pointer group"
            title="Click to fill credentials"
          >
            <div className="flex items-center justify-between text-xs text-[#e0a028] font-medium mb-1.5">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#e0a028]" />
                Pre-configured Owner Account
              </span>
              <span className="text-[10px] text-slate-400 group-hover:text-white transition-colors">
                Click to load
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300 space-y-0.5">
              <div className="truncate">
                <span className="text-slate-500">Email:</span>{' '}
                <span className="text-slate-200">neerajkumarmahato740@gmail.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span>
                  <span className="text-slate-500">Password:</span>{' '}
                  <span className="text-slate-200">123456!!</span>
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#e0a028]/20 text-[#e0a028] text-[10px] font-semibold uppercase tracking-wider">
                  owner
                </span>
              </div>
            </div>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@webphiser.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#061432]/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#e0a028]/50 focus:border-[#e0a028] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#061432]/80 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-[#e0a028]/50 focus:border-[#e0a028] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded bg-[#061432] border-white/20 text-[#e0a028] focus:ring-[#e0a028] w-3.5 h-3.5"
                />
                <span>Remember session (7 days)</span>
              </label>
              <span className="text-[#e0a028] hover:underline cursor-pointer">
                Need support?
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#e0a028] to-[#f3c25b] text-[#061432] shadow-lg shadow-[#e0a028]/20 hover:brightness-110 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#061432]" />
                  <span>Authorized! Redirecting...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* System footer */}
        <div className="text-center mt-6 text-xs text-slate-500 flex items-center justify-center gap-2">
          <span>Webphiser Education System</span>
          <span>•</span>
          <span className="font-mono text-slate-400">v2.4 (AIM Platform)</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#040e22] text-[#e0a028]">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
