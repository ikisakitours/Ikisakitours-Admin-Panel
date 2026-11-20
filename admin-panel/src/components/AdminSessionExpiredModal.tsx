"use client";

import React from "react";
import { Lock, LogIn, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminSessionExpiredModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export function AdminSessionExpiredModal({ isOpen }: AdminSessionExpiredModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleSignInAgain = () => {
    // Purge expired tokens from storage and cookies
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
    }
    if (typeof document !== "undefined") {
      document.cookie = "admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
      document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict";
    }
    // Redirect to login with expiration query flag
    router.push("/login?expired=true");
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
      className="fixed inset-0 z-150 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
        {/* Security Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        {/* Text Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-800 text-[11px] font-bold tracking-wide">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>SECURITY NOTICE</span>
          </div>
          <h2 id="session-expired-title" className="text-xl font-black text-slate-900 tracking-tight">
            Session Expired
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
            Your administrative session has timed out due to inactivity. For security compliance, please sign in again to continue managing Ikisaki Tours.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSignInAgain}
            className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In Again</span>
          </button>
        </div>

        {/* Footer Note */}
        <p className="text-[10px] text-slate-400">
          Unsaved drafts or changes can be re-submitted once re-authenticated.
        </p>
      </div>
    </div>
  );
}
