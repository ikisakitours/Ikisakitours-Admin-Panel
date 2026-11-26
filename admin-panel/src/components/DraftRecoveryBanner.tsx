"use client";

import {
  CheckCircle2,
  Trash2,
  Save,
  Loader2,
  Sparkles,
  ShieldCheck,
  X,
} from "lucide-react";

interface DraftRecoveryBannerProps {
  hasDraft: boolean;
  draftSavedAt: string | null;
  onRestore: () => void;
  onDiscard: () => void;
  lastSaved?: Date | null;
  isSaving?: boolean;
  onSaveNow?: () => void;
  entityName?: string;
  className?: string;
  showLeaveConfirm?: boolean;
  onCancelLeave?: () => void;
  onConfirmLeave?: () => void;
}

export function DraftRecoveryBanner({
  hasDraft,
  draftSavedAt,
  onRestore,
  onDiscard,
  lastSaved,
  isSaving,
  onSaveNow,
  entityName = "Form",
  className = "",
  showLeaveConfirm,
  onCancelLeave,
  onConfirmLeave,
}: DraftRecoveryBannerProps) {
  return (
    <>
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 01) TOP-RIGHT UNSAVED CHANGES MODAL CARD (Inline Icon & Red Hover X)*/}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {showLeaveConfirm && (
        <div className="fixed top-6 right-6 z-[9999] max-w-sm w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl shadow-black/20 animate-in slide-in-from-top-4 fade-in duration-200">
          {/* Header Row: Inline Shield Icon + Proportional Title + Red-Hover Close Button */}
          <div className="flex items-center justify-between pb-1 gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                Unsaved Changes (Draft Protected)
              </h4>
            </div>
            {onCancelLeave && (
              <button
                type="button"
                onClick={onCancelLeave}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-all shrink-0"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Description: Aligned to the Left */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed text-left">
            Your edits are safely preserved as a local draft. You can safely leave this page and restore your progress whenever you return!
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 justify-end mt-3.5">
            <button
              type="button"
              onClick={onCancelLeave}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Stay on Page
            </button>
            <button
              type="button"
              onClick={onConfirmLeave}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              Leave &amp; Keep Draft
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 02 & 03) BOTTOM-RIGHT FLOATING DRAFT CONTROLS                        */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-7 right-7 z-50 flex flex-col items-end gap-3 pointer-events-none select-none ${className}`}
      >
        {/* 02) Compact Floating Recovery Card (Inline Sparkle Icon & Red Hover Close) */}
        {hasDraft && (
          <div className="pointer-events-auto w-80 sm:w-96 p-4 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-amber-500/40 shadow-2xl shadow-amber-500/10 flex flex-col gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
            {/* Header Row: Inline Sparkle Icon + Title + Time Badge + Close X */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                  Draft Found
                </span>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 whitespace-nowrap shrink-0">
                  {draftSavedAt || "Saved"}
                </span>
              </div>
              <button
                type="button"
                onClick={onDiscard}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:border-red-400 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-all shrink-0"
                title="Discard draft"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Description: Aligned to the Left */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug text-left">
              Restore previous {entityName} edits?
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-2 self-end mt-1">
              <button
                type="button"
                onClick={onRestore}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Restore</span>
              </button>
              <button
                type="button"
                onClick={onDiscard}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/30 text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 text-xs font-medium border border-slate-200 hover:border-red-300 dark:border-slate-700 dark:hover:border-red-800 transition-all cursor-pointer whitespace-nowrap"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>No Need</span>
              </button>
            </div>
          </div>
        )}

        {/* 03) PROMINENT, CLEAR & LARGE LIVE AUTO-SAVE PILL WITH REAL BUTTON (NO WRAPPING) */}
        <div
          style={{ whiteSpace: "nowrap", flexShrink: 0, width: "max-content" }}
          className="pointer-events-auto inline-flex flex-nowrap items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-black/10 text-xs text-slate-700 dark:text-slate-200 transition-all whitespace-nowrap shrink-0 max-w-none"
        >
          {isSaving ? (
            <span
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
              className="flex flex-nowrap items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold font-mono whitespace-nowrap shrink-0"
            >
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span style={{ whiteSpace: "nowrap", flexShrink: 0 }} className="whitespace-nowrap inline-block">Saving draft...</span>
            </span>
          ) : lastSaved ? (
            <div
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
              className="flex flex-nowrap items-center gap-2.5 font-mono whitespace-nowrap shrink-0"
            >
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span
                style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                className="font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap inline-block"
              >
                Draft Protected
              </span>
              <span
                style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                className="text-[11px] font-medium px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 whitespace-nowrap shrink-0 inline-block"
              >
                {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            </div>
          ) : (
            <div
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
              className="flex flex-nowrap items-center gap-2 font-mono whitespace-nowrap shrink-0"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span
                style={{ whiteSpace: "nowrap", flexShrink: 0 }}
                className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap inline-block"
              >
                Draft Auto-Save: Active
              </span>
            </div>
          )}

          {onSaveNow && (
            <button
              type="button"
              onClick={onSaveNow}
              title="Force save draft to browser storage"
              style={{ whiteSpace: "nowrap", flexShrink: 0 }}
              className="inline-flex flex-nowrap items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold cursor-pointer transition-all shadow-xs hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap shrink-0"
            >
              <Save className="w-3.5 h-3.5 text-white shrink-0" />
              <span style={{ whiteSpace: "nowrap", flexShrink: 0 }} className="whitespace-nowrap inline-block">
                Save Draft Now
              </span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
