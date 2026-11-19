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
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 space-y-5 animate-in zoom-in-95 duration-150 relative">
        {/* Close "X" button on top-right */}
        <button
          type="button"
          disabled={loading}
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. Dedicated Top Centered Warning Icon (Independent from text layout) */}
        <div className="text-center space-y-2 pt-1">
          <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200/90 text-rose-600 shadow-xs">
            <AlertTriangle className="w-6 h-6 stroke-[2.2]" />
          </div>

          {/* 2. Text Content (Unobstructed & Clean) */}
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
              {description}
            </p>
          )}
        </div>

        {/* 3. Item Preview Container */}
        {(itemTitle || itemSubtitle) && (
          <div className="rounded-2xl bg-slate-50/90 border border-slate-200/80 p-3.5 text-xs text-left space-y-1">
            {itemTitle && (
              <p className="font-extrabold text-slate-900 line-clamp-2">
                {itemTitle}
              </p>
            )}
            {itemSubtitle && (
              <p className="text-[11px] font-semibold text-slate-500">
                {itemSubtitle}
              </p>
            )}
          </div>
        )}

        {/* 4. Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
