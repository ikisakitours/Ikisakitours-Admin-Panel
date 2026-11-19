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
  Smartphone,
  CheckCircle2,
  Cpu,
} from "lucide-react";
import { authService } from "@/services/auth.service";
import { AdminToast, type AdminToastState } from "@/components/AdminToast";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [totpCode, setTotpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<AdminToastState | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === "credentials") {
      if (!email.trim() || !password.trim()) {
        setToast({
          id: Date.now(),
          message: "Please enter both administrator email and access key.",
          variant: "error",
        });
        return;
      }

      try {
        setLoading(true);
        const res = await authService.login(email.trim(), password);

        if (res.requiresTwoFactor) {
          setStep("2fa");
          setToast({
            id: Date.now(),
            message: "Two-Factor Authentication required. Enter your 6-digit code.",
            variant: "info",
          });
          return;
        }

        if (res.success) {
          setToast({
            id: Date.now(),
            message: "Identity verified! Welcome to the Executive Dashboard.",
            variant: "success",
          });
          setTimeout(() => {
            router.push(redirectPath);
            router.refresh();
          }, 600);
        } else {
          setToast({
            id: Date.now(),
            message: res.message || "Invalid credentials. Access restricted.",
            variant: "error",
          });
        }
      } catch {
        setToast({
          id: Date.now(),
          message: "Authentication server unreachable. Verify network connection.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    } else {
      // 2FA step
      if (totpCode.trim().length !== 6) {
        setToast({
          id: Date.now(),
          message: "Please enter your 6-digit Google Authenticator code.",
          variant: "error",
        });
        return;
      }

      try {
        setLoading(true);
        const res = await authService.login(email.trim(), password, totpCode.trim());

        if (res.success) {
          setToast({
            id: Date.now(),
            message: "2FA verified successfully! Welcome to the Executive Dashboard.",
            variant: "success",
          });
          setTimeout(() => {
            router.push(redirectPath);
            router.refresh();
          }, 600);
        } else {
          setToast({
            id: Date.now(),
            message: res.message || "Invalid 2FA code. Please check your authenticator app.",
            variant: "error",
          });
        }
      } catch {
        setToast({
          id: Date.now(),
          message: "Failed to verify 2FA code. Please try again.",
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFillDemo = () => {
    setEmail("admin@ikisakitours.com");
    setPassword("IkisakiAdmin2026!");
    setToast({
      id: Date.now(),
      message: "Development admin credentials filled.",
      variant: "info",
    });
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-teal-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Luxury Split-Deck Container (Compact Horizon Layout) */}
      <div className="relative w-full max-w-4xl bg-white border border-slate-200/90 rounded-3xl shadow-2xl shadow-slate-300/30 overflow-hidden grid grid-cols-1 md:grid-cols-12 z-10 transition-all">
        {/* LEFT PANEL: Dark Executive Brand Deck (col-span-5) */}
        <div className="md:col-span-5 bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 p-7 sm:p-9 text-white flex flex-col justify-between relative overflow-hidden border-b md:border-b-0 md:border-r border-slate-800">
          {/* Subtle interior glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top: Brand Mark & Title */}
          <div className="space-y-4 relative z-10">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-emerald-400 to-teal-500 text-slate-950 font-black text-lg shadow-lg shadow-emerald-500/20">
              <span>IT</span>
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Ikisaki Tours</span>
              </h1>
              <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">
                Executive Operations Console
              </p>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              Centralized platform for private itineraries, dynamic group pricing, CMS catalogs, and customer inquiries.
            </p>
          </div>

          {/* Middle: Operational Security Badges (Single line, strictly no break) */}
          <div className="py-5 space-y-2 relative z-10">
            <div className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-white/5 border border-white/8 text-[11px] font-medium text-slate-300 whitespace-nowrap overflow-hidden">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Role-Based Access Control</span>
            </div>

            <div className="flex items-center gap-2.5 py-2 px-3 rounded-xl bg-white/5 border border-white/8 text-[11px] font-medium text-slate-300 whitespace-nowrap overflow-hidden">
              <Lock className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="truncate">Two-Factor Authentication (2FA)</span>
            </div>
          </div>

          {/* Bottom: System Status Pill & Compliance */}
          <div className="pt-2 border-t border-white/10 relative z-10 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Gateway Status</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold font-mono text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                ACTIVE &amp; MONITORED
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight">
              All administrative access attempts are audited, timestamped, and stored in compliance records.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL: Compact Credential Portal (col-span-7) */}
        <div className="md:col-span-7 p-7 sm:p-9 bg-white flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto space-y-5">
            {/* Header */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                {step === "credentials" ? "Operations Sign In" : "Two-Factor Verification"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {step === "credentials"
                  ? "Enter authorized staff credentials to access dashboard"
                  : "Enter the 6-digit TOTP code generated by your authenticator app"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === "credentials" ? (
                <>
                  {/* Email Field */}
                  <div className="space-y-1">
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
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs font-medium outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1">
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
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-xs font-medium outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20 transition-all font-mono"
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
                </>
              ) : (
                /* Step 2: 2FA TOTP Code */
                <div className="space-y-3">
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-1">
                    <p className="text-xs font-bold text-emerald-900 flex items-center justify-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      Google Authenticator Required
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Open your authenticator app and enter your live 6-digit code:
                    </p>
                  </div>

                  <div className="space-y-1 flex justify-center">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      autoFocus
                      value={totpCode}
                      onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="000000"
                      className="w-48 sm:w-52 text-center tracking-[0.35em] font-mono font-bold py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-lg outline-none focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500/20 shadow-xs transition-all"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep("credentials");
                      setTotpCode("");
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:underline block text-center w-full pt-1 cursor-pointer"
                  >
                    ← Back to Email &amp; Password
                  </button>
                </div>
              )}

              {/* Submit Button (Centered, balanced width) */}
              <div className="flex justify-center pt-1.5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-auto min-w-[240px] max-w-xs py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wide shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : step === "2fa" ? (
                    <>
                      <span>Verify &amp; Enter Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <span>Authenticate &amp; Enter Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer Notice */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <KeyRound className="w-3 h-3 text-emerald-600" />
                <span>Authorized Personnel Only</span>
              </span>
              <span>Session: 15-Minute Expiry</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Unified Admin Toast Component */}
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
