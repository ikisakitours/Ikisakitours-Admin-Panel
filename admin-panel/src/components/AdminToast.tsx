"use client";

import React, { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface AdminToastState {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface AdminToastProps {
  toast: AdminToastState | null;
  onDismiss: () => void;
}

export function AdminToast({ toast, onDismiss }: AdminToastProps) {
  useEffect(() => {
    if (!toast) return;
    // Dynamic duration based on text length so users have ample time to read longer alerts
    const duration = Math.max(4500, Math.min(10000, toast.message.length * 75));
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const styles: Record<ToastVariant, string> = {
    success: "bg-emerald-950 text-emerald-50 border-emerald-700/60 shadow-emerald-950/30",
    error: "bg-rose-950 text-rose-50 border-rose-700/60 shadow-rose-950/30",
    warning: "bg-amber-950 text-amber-50 border-amber-700/60 shadow-amber-950/30",
    info: "bg-slate-900 text-slate-50 border-slate-700 shadow-slate-950/30",
  };

  return (
    <div className="fixed bottom-6 right-6 z-120 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-[min(36rem,calc(100vw-2rem))] flex justify-end">
      <div
        role="status"
        className={`pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xl w-auto max-w-xl min-w-[300px] sm:min-w-[340px] transition-all duration-200 ${styles[toast.variant]}`}
      >
        <div className="shrink-0 mt-0.5">
          {toast.variant === "success" && (
            <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
          )}
          {toast.variant === "error" && (
            <AlertTriangle className="h-4.5 w-4.5 text-rose-400" />
          )}
          {toast.variant === "warning" && (
            <AlertTriangle className="h-4.5 w-4.5 text-amber-400" />
          )}
          {toast.variant === "info" && (
            <Info className="h-4.5 w-4.5 text-sky-400" />
          )}
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <p className="text-xs sm:text-[13px] font-medium leading-relaxed break-words text-left select-text">
            {toast.message}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer -mr-1 -mt-0.5 text-slate-300"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
