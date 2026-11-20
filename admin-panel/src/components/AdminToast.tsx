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

  const isLongMessage = toast.message.length > 95;

  return (
    <div className="fixed bottom-5 right-5 z-120 pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200 max-w-[calc(100vw-2.5rem)] flex justify-end">
      <div
        role="status"
        className={`pointer-events-auto inline-flex items-center gap-2.5 rounded-xl border px-3.5 py-2 shadow-xl backdrop-blur-md w-auto max-w-[min(52rem,calc(100vw-3rem))] transition-all duration-200 ${styles[toast.variant]}`}
      >
        <div className="shrink-0">
          {toast.variant === "success" && (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          )}
          {toast.variant === "error" && (
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          )}
          {toast.variant === "warning" && (
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          )}
          {toast.variant === "info" && (
            <Info className="h-4 w-4 text-sky-400" />
          )}
        </div>
        <p
          className={`text-[11px] sm:text-xs font-semibold leading-tight text-left select-text ${
            isLongMessage ? "whitespace-normal break-words leading-snug" : "whitespace-nowrap max-sm:whitespace-normal"
          }`}
        >
          {toast.message}
        </p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="shrink-0 rounded-md p-0.5 opacity-70 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer ml-1 text-slate-300"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
