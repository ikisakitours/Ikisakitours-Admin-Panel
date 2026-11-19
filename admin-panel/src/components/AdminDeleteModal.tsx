"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Loader2, X } from "lucide-react";

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
      className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-xl md:max-w-2xl bg-white rounded-3xl p-8 sm:p-9 shadow-2xl border border-slate-100 space-y-6 animate-in zoom-in-95 duration-150 relative">
        {/* Close "X" button on top-right */}
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Dedicated Top Centered Warning Icon (Independent from text layout) */}
        <div className="text-center space-y-3 pt-1">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200/90 text-rose-600 shadow-xs">
            <AlertTriangle className="w-7 h-7 stroke-[2.2]" />
          </div>

          {/* 2. Text Content (Unobstructed & Clean) */}
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-lg mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* 3. Item Preview Container (Full text, no truncation) */}
        {(itemTitle || itemSubtitle) && (
          <div className="rounded-2xl bg-slate-50/90 border border-slate-200/80 p-5 text-xs text-left space-y-2">
            {itemTitle && (
              <p className="text-sm font-extrabold text-slate-900 leading-snug wrap-break-word">
                {itemTitle}
              </p>
            )}
            {itemSubtitle && (
              <p className="text-xs font-medium text-slate-600 leading-relaxed wrap-break-word whitespace-pre-wrap">
                {itemSubtitle}
              </p>
            )}
          </div>
        )}

        {/* 4. Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-5 py-2.5 text-xs sm:text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
