"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Loader2, X, Trash2 } from "lucide-react";

export interface AdminDeleteModalProps {
  isOpen: boolean;
  title: string;
  description?: string;
  itemTitle?: string;
  itemSubtitle?: string;
  loading?: boolean;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

export function AdminDeleteModal({
  isOpen,
  title,
  description = "This action will permanently remove this record from the database. It cannot be undone.",
  itemTitle,
  itemSubtitle,
  loading = false,
  confirmLabel = "Confirm Delete",
  onClose,
  onConfirm,
}: AdminDeleteModalProps) {
  // ESC key handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-gray-800 space-y-4 animate-in zoom-in-95 duration-150 relative">
        {/* Close "X" button on top-right */}
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Top Centered Warning Icon (Above Title) */}
        <div className="flex justify-center pt-1">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 shadow-2xs">
            <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        {/* 2. Title & Centered Description Paragraph */}
        <div className="space-y-1.5 text-center">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed max-w-sm mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* 2. Structured Item Preview Container (Compact, Organized, Full Text) */}
        {(itemTitle || itemSubtitle) && (
          <div className="rounded-xl bg-slate-50 dark:bg-gray-800/60 border border-slate-200/70 dark:border-gray-700/70 p-3.5 text-left space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 block">
              Affected Record:
            </span>
            {itemTitle && (
              <p className="text-xs font-bold text-slate-900 dark:text-gray-100 line-clamp-2">
                {itemTitle}
              </p>
            )}
            {itemSubtitle && (
              <p className="text-[11px] font-mono text-slate-500 dark:text-gray-400 line-clamp-2">
                {itemSubtitle}
              </p>
            )}
          </div>
        )}

        {/* 3. Professional Compact Actions Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-gray-800">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
