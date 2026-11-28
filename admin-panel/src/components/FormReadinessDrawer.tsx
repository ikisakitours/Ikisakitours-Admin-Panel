"use client";

import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  PanelRightClose,
  PanelRightOpen,
  Filter,
} from "lucide-react";

export interface FormReadinessItem {
  id: string;
  label: string;
  sectionName?: string;
  sectionId?: string; // Parent section ID for auto-expanding accordions
  isComplete: boolean;
  isRequired?: boolean;
  elementId?: string; // HTML ID of the exact input or textarea element to auto-scroll & highlight
  targetLang?: string; // Auto-switches form language tab (e.g. "en" or "ja") before focusing
  hint?: string;
}

interface FormReadinessDrawerProps {
  items: FormReadinessItem[];
  entityTitle?: string;
  onNavigateToField?: (item: FormReadinessItem) => void;
}

type FilterTab = "all" | "empty" | "filled";

export function FormReadinessDrawer({
  items,
  entityTitle = "Form",
  onNavigateToField,
}: FormReadinessDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filterTab, setFilterTab] = useState<FilterTab>("all");

  const totalItemsCount = items.length;
  const completedItems = useMemo(() => items.filter((item) => item.isComplete), [items]);
  const emptyItems = useMemo(() => items.filter((item) => !item.isComplete), [items]);

  const totalCompletedCount = completedItems.length;
  const totalEmptyCount = emptyItems.length;

  const allCompleted = totalItemsCount > 0 && totalCompletedCount === totalItemsCount;
  const completionPercentage =
    totalItemsCount > 0 ? Math.round((totalCompletedCount / totalItemsCount) * 100) : 100;

  // Filter items based on active tab
  const displayedItems = useMemo(() => {
    if (filterTab === "empty") return emptyItems;
    if (filterTab === "filled") return completedItems;
    return items;
  }, [filterTab, items, emptyItems, completedItems]);

  // 1-Click Smooth Scroll & Temporary Highlight Glow directly on the exact input
  const handleScrollToField = (field: FormReadinessItem) => {
    // 1. Immediately close the drawer so the full form is unobstructed
    setIsOpen(false);

    // 2. If language switch or custom navigation is needed, notify parent form
    if (onNavigateToField) {
      onNavigateToField(field);
    }

    // 3. Locate and focus the exact input element (with resilient polling to allow accordions/modals to expand)
    const startTime = Date.now();
    const tryFocus = () => {
      if (!field.elementId) return;

      const el =
        document.getElementById(field.elementId) ||
        document.querySelector(`[data-element-id="${field.elementId}"]`) ||
        document.querySelector(`[name="${field.elementId}"]`);

      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });

        // Highlight ring classes with ! prefix to cleanly override default focus borders temporarily
        const ringClasses = field.isComplete
          ? ["!ring-4", "!ring-emerald-500", "!border-emerald-500", "transition-all", "duration-500"]
          : ["!ring-4", "!ring-rose-500", "!border-rose-500", "transition-all", "duration-500"];

        el.classList.add(...ringClasses);

        // Focus if it's an input, textarea, or select
        if (typeof (el as HTMLElement).focus === "function") {
          (el as HTMLElement).focus();
        }

        setTimeout(() => {
          el.classList.remove(...ringClasses);
        }, 2500);
      } else if (Date.now() - startTime < 800) {
        setTimeout(tryFocus, 60);
      }
    };

    setTimeout(tryFocus, field.targetLang ? 150 : 80);
  };

  return (
    <>
      {/* ─────────────────────────────────────────────────────────────
          1. Vertical Floating Dock / Pill on the RIGHT EDGE
             (Positioned vertically at top-40, matching user's marked location)
         ───────────────────────────────────────────────────────────── */}
      <div className="fixed right-0 top-40 z-[100] select-none">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`group flex flex-col items-center gap-2.5 py-3.5 px-2 rounded-l-2xl shadow-2xl border-y border-l backdrop-blur-xl transition-all duration-300 cursor-pointer ${
            allCompleted
              ? "bg-slate-900/95 dark:bg-gray-900/95 text-white border-emerald-500/50 hover:border-emerald-400 hover:shadow-emerald-500/20"
              : "bg-slate-950/95 dark:bg-black/95 text-slate-100 border-amber-500/50 hover:border-amber-400 hover:shadow-amber-500/20"
          }`}
          title="Click to view form completion & empty fields"
        >
          {/* Circular Progress Gauge */}
          <div className="relative flex items-center justify-center w-8 h-8">
            <svg className="w-8 h-8 transform -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="12"
                className="text-slate-800"
                strokeWidth="3"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="16"
                cy="16"
                r="12"
                className={allCompleted ? "text-emerald-400" : "text-amber-400"}
                strokeWidth="3"
                strokeDasharray={75.4}
                strokeDashoffset={75.4 - (75.4 * completionPercentage) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <span className="absolute text-[9px] font-mono font-extrabold text-white">
              {completionPercentage}%
            </span>
          </div>

          {/* Vertical Text Label */}
          <div className="flex items-center gap-2 [writing-mode:vertical-rl] rotate-180 text-[10px] font-extrabold tracking-widest uppercase text-slate-300 group-hover:text-white transition-colors">
            <span>Form Status</span>
            {!allCompleted && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>

          {/* Empty Count Badge */}
          {totalEmptyCount > 0 ? (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold">
              {totalEmptyCount} Empty
            </span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}

          {/* Toggle Icon */}
          <div className="text-slate-400 group-hover:text-white transition-colors">
            {isOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
          </div>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. Collapsible Right-Side Drawer (Highest z-index: z-[110])
         ───────────────────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[110] bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 border-l border-slate-200 dark:border-gray-800 shadow-2xl flex flex-col z-[120] animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="relative p-5 pr-14 border-b border-slate-100 dark:border-gray-800 bg-slate-50/80 dark:bg-gray-800/50 flex items-start justify-between">
              <div className="min-w-0 pr-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="truncate">{entityTitle} Field Tracker</span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
                  Click any field to auto-close & jump to input.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                title="Close Field Tracker"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Overall Progress Gauge */}
            <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                  {completionPercentage}% Form Completed
                </span>
                <p className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium">
                  {allCompleted
                    ? "🟢 All fields are filled and ready!"
                    : `⚠️ ${totalEmptyCount} field${totalEmptyCount !== 1 ? "s are" : " is"} currently empty`}
                </p>
              </div>

              <div className="text-right font-mono text-xs font-bold text-indigo-900 dark:text-indigo-300">
                {totalCompletedCount}/{totalItemsCount} Filled
              </div>
            </div>

            {/* Quick Filter Tabs */}
            <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100/70 dark:bg-gray-800/60 border-b border-slate-200/80 dark:border-gray-800 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-gray-500 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> Filter:
              </span>
              <button
                type="button"
                onClick={() => setFilterTab("all")}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                  filterTab === "all"
                    ? "bg-white dark:bg-gray-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-gray-400 hover:text-slate-900"
                }`}
              >
                All ({totalItemsCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("empty")}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  filterTab === "empty"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "text-amber-700 dark:text-amber-400 hover:bg-amber-100/60 dark:hover:bg-amber-950/40"
                }`}
              >
                <span>Empty ({totalEmptyCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterTab("filled")}
                className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  filterTab === "filled"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/40"
                }`}
              >
                <span>Filled ({totalCompletedCount})</span>
              </button>
            </div>

            {/* Field Checklist Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {displayedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-gray-300">
                    No items in this filter
                  </p>
                </div>
              ) : (
                displayedItems.map((field) => (
                  <div
                    key={field.id}
                    onClick={() => handleScrollToField(field)}
                    className={`group p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                      field.isComplete
                        ? "bg-slate-50/70 dark:bg-gray-800/40 border-slate-200 dark:border-gray-700/60 hover:bg-slate-100 dark:hover:bg-gray-800"
                        : "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300/80 dark:border-amber-800/60 hover:bg-amber-100/60 hover:border-amber-400"
                    }`}
                  >
                    {/* Header Row: Title on Left, Status Badge on Top Right */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        {field.isComplete ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        )}
                        <p
                          className={`text-xs font-bold truncate ${
                            field.isComplete
                              ? "text-slate-800 dark:text-gray-200"
                              : "text-amber-950 dark:text-amber-200"
                          }`}
                        >
                          {field.label}
                        </p>
                      </div>

                      {/* Top Right Status Badge */}
                      <div className="shrink-0">
                        {field.isComplete ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                            ✓ Filled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200 border border-amber-300 dark:border-amber-700 animate-pulse">
                            Empty
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hint / Sub-section & Jump action */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400 pl-6">
                      <span className="truncate pr-2">
                        {field.hint || field.sectionName || (field.isComplete ? "Field is completed" : "Requires input")}
                      </span>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity font-semibold flex items-center gap-0.5 shrink-0">
                        Jump to field <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Admin Notice & SEO Best Practice */}
            <div className="p-4 bg-slate-50 dark:bg-gray-800/50 border-t border-slate-100 dark:border-gray-800 text-[11px] leading-relaxed space-y-2.5">
              <div className="flex items-start gap-2">
                <span className="text-sm shrink-0 select-none mt-0.5">💡</span>
                <div className="space-y-1">
                  <p className="font-bold text-slate-800 dark:text-slate-100">
                    Admin Notice &amp; Best Practices:
                  </p>
                  <p className="text-slate-600 dark:text-gray-300">
                    Filling all empty fields accurately is essential for maximizing Search Engine Optimization (SEO) and delivering a premium User Experience (UX) to prospective travelers.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-amber-800 dark:text-amber-300">
                <span className="text-sm shrink-0 select-none mt-0.5">⚠️</span>
                <p className="font-semibold">
                  Published changes go live immediately on the public website. Please review all multilingual entries carefully before saving.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FormReadinessDrawer;
