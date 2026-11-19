"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { authService } from "@/services/auth.service";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter your administrator email and access key.");
      return;
    }

    try {
      setLoading(true);
      const res = await authService.login(email.trim(), password);

      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(redirectPath);
          router.refresh();
        }, 500);
      } else {
        setError(res.message || "Invalid credentials. Access restricted.");
      }
    } catch {
      setError("Authentication server unreachable. Please verify network connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("admin@ikisakitours.com");
    setPassword("IkisakiAdmin2026!");
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Subtle background ambient accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/6 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Login Card (Matching Light Luxury Project Aesthetic) */}
      <div className="relative w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-xl shadow-slate-200/50 space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          {/* Brand Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 text-white font-black text-xl shadow-md ring-4 ring-emerald-50 mb-1 relative">
            <span>IT</span>
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Ikisaki Tours
          </h1>
          <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
            Executive Admin Portal
          </p>
          <p className="text-xs text-slate-500 max-w-xs mx-auto pt-0.5 leading-relaxed">
            Restricted access portal for authorized operations, pricing, bookings, and content management.
          </p>
        </div>

        {/* Security Protocol Badge */}
        <div className="flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-700">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>256-Bit Encrypted Session</span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500">Zero Trust Guard</span>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <p className="font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p className="font-bold">Identity verified. Entering command center...</p>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
              Staff Administrator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ikisakitours.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs font-medium outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                Access Secret Key
              </label>
              <button
                type="button"
                onClick={handleFillDemo}
                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer transition-colors"
                title="Fill initial admin key"
              >
                Use Admin Key
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs font-medium outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? "Hide key" : "Show key"}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wide shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Verifying Secure Signature...</span>
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Access Granted</span>
              </>
            ) : (
              <>
                <span>Authenticate &amp; Enter Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-1">
          <p className="text-[10px] text-slate-500 flex items-center justify-center gap-1 font-mono font-medium">
            <KeyRound className="w-3 h-3 text-emerald-600" />
            <span>Authorized Operations Personnel Only</span>
          </p>
          <p className="text-[9px] text-slate-400">
            All unauthorized access attempts are monitored, logged, and reported by IP.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center text-emerald-600">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
