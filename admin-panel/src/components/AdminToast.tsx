"use client";

import React, { useEffect } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

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
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const styles: Record<ToastVariant, string> = {
    success: "bg-emerald-950 text-emerald-50 border-emerald-700/60 shadow-emerald-950/20",
    error: "bg-rose-950 text-rose-50 border-rose-700/60 shadow-rose-950/20",
    info: "bg-slate-900 text-slate-50 border-slate-700 shadow-slate-950/20",
  };

  return (
    <div className="fixed bottom-6 right-6 z-[120] pointer-events-none animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div
        role="status"
        className={`pointer-events-auto inline-flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-xs w-auto max-w-md min-w-[240px] ${styles[toast.variant]}`}
      >
        {toast.variant === "success" && (
          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
        )}
        {toast.variant === "error" && (
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
        )}
        {toast.variant === "info" && (
          <Info className="h-4 w-4 text-sky-400 shrink-0" />
        )}
        <p className="text-xs font-semibold leading-snug break-words">{toast.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss notification"
          className="ml-auto shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100 hover:bg-white/10 transition-all cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
