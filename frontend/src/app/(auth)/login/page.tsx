"use client";

import { useState } from "react";
import Link from "next/link";
import { Activity, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail]       = useState("safety.officer@plant.com");
  const [password, setPassword] = useState("••••••••••••");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle industrial grid pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] bg-[radial-gradient(#0F172A_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Centered White Authentication Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm space-y-6">
        
        {/* RescueFlowAI Logo & Welcome */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-amber-400 font-bold shadow-xs">
              <Activity className="h-5 w-5 text-amber-400" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Rescue<span className="text-amber-500">FlowAI</span>
            </span>
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-50 pt-2">Welcome Back</h1>
          <p className="text-xs text-slate-500">Sign in to access your Industrial Safety Command Centre.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Work Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 pl-9 pr-3 py-2.5 text-sm text-slate-900 dark:text-slate-50 focus:border-amber-500 focus:bg-white outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Password</label>
              <a href="#" className="text-xs font-bold text-amber-600 hover:underline">
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 pl-9 pr-3 py-2.5 text-sm text-slate-900 dark:text-slate-50 focus:border-amber-500 focus:bg-white outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3 text-sm font-bold text-slate-950 shadow-xs hover:bg-amber-400 transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          <span className="absolute bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            OR
          </span>
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          onClick={() => { window.location.href = "/dashboard"; }}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 transition-all"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-bold text-amber-600 hover:underline">
            Register Site
          </Link>
        </p>

      </div>
    </div>
  );
}
