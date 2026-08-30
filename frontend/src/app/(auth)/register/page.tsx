"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Lock, Building2, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ROLES = ["Safety Officer", "Site Manager", "HSE Manager", "Supervisor", "Worker", "Admin"] as const;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase",     pass: /[A-Z]/.test(password) },
    { label: "Number",        pass: /\d/.test(password)     },
    { label: "Special char",  pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const color = score <= 1 ? "bg-red-500" : score <= 2 ? "bg-amber-500" : score === 3 ? "bg-blue-500" : "bg-green-500";
  const label = ["Weak", "Weak", "Fair", "Good", "Strong"][score];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={cn("h-1 flex-1 rounded-full transition-all duration-300",
            n <= score ? color : "bg-secondary/60")} />
        ))}
        <span className={cn("ml-2 text-[10px] font-semibold",
          score <= 1 ? "text-red-400" : score <= 2 ? "text-amber-400" : score === 3 ? "text-blue-400" : "text-green-400"
        )}>{label}</span>
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {checks.map(({ label, pass }) => (
          <span key={label} className={cn("text-[10px]", pass ? "text-green-400" : "text-muted-foreground/60")}>
            {pass ? "✓" : "·"} {label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "", email: "", company: "", role: "", password: "", confirm: "",
  });
  const [showPw,   setShowPw]   = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (!accepted) { setError("Please accept the terms to continue."); return; }
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setError("Demo mode — backend not connected yet.");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-7">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-400/10 ring-1 ring-amber-400/20">
          <ShieldCheck className="h-5 w-5 text-amber-400" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-black text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start protecting your workforce today — free for 30 days
        </p>
      </div>

      {/* Google OAuth */}
      <button type="button" id="register-google-btn"
        className="mb-5 flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-white/20 hover:bg-white/8 hover:shadow-md"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Sign up with Google
      </button>

      <div className="mb-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or with email</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" id="register-form">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="register-name" label="Full Name" placeholder="Arjun Mehta"
            value={form.fullName} onChange={set("fullName")}
            leftIcon={<User className="h-4 w-4" />} required />
          <Input id="register-email" type="email" label="Work Email" placeholder="you@company.com"
            value={form.email} onChange={set("email")}
            leftIcon={<Mail className="h-4 w-4" />} required />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input id="register-company" label="Company Name" placeholder="Tata Steel Ltd."
            value={form.company} onChange={set("company")}
            leftIcon={<Building2 className="h-4 w-4" />} required />
          <div className="space-y-1.5">
            <label htmlFor="register-role" className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Role
            </label>
            <select id="register-role" value={form.role} onChange={set("role")} required
              className="w-full rounded-xl border border-input bg-secondary/40 px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary appearance-none"
            >
              <option value="" disabled>Select role…</option>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="relative">
              <Input id="register-password" type={showPw ? "text" : "password"} label="Password"
                placeholder="Min. 8 characters" value={form.password} onChange={set("password")}
                leftIcon={<Lock className="h-4 w-4" />} required minLength={8} />
              <button type="button" onClick={() => setShowPw((v) => !v)} aria-label={showPw ? "Hide" : "Show password"}
                className="absolute bottom-3 right-3 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <PasswordStrength password={form.password} />
          </div>
          <Input id="register-confirm" type={showPw ? "text" : "password"} label="Confirm Password"
            placeholder="Repeat password" value={form.confirm} onChange={set("confirm")}
            leftIcon={<Lock className="h-4 w-4" />} required />
        </div>

        {/* Terms */}
        <label className="flex cursor-pointer items-start gap-3" htmlFor="register-terms">
          <input id="register-terms" type="checkbox" checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5 accent-amber-400" />
          <span className="text-xs text-muted-foreground">
            I agree to the{" "}
            <Link href="#" className="text-amber-400 hover:underline">Terms of Service</Link> and{" "}
            <Link href="#" className="text-amber-400 hover:underline">Privacy Policy</Link>.
          </span>
        </label>

        {error && (
          <p role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
            {error}
          </p>
        )}

        <Button id="register-submit-btn" type="submit" isLoading={loading} className="w-full" size="lg">
          <span>Create Account</span>
          {!loading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
        </Button>
      </form>

      <div className="mt-5 flex items-center justify-center gap-4">
        {["OSHA Compliant", "ISO 45001", "SOC 2"].map((b) => (
          <span key={b} className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
            <ShieldCheck className="h-3 w-3 text-green-400/60" aria-hidden="true" />{b}
          </span>
        ))}
      </div>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-amber-400 hover:underline">Sign in →</Link>
      </p>
    </motion.div>
  );
}
