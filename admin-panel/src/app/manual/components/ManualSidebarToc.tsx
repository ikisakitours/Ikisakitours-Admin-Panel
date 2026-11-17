"use client";

import React, { useEffect } from "react";
import { BookMarked, Download, FileJson, X } from "lucide-react";
import {
  MANUAL_TOC_ITEMS,
  ManualSectionId,
  SAMPLE_TEMPLATES,
} from "../data/manualMockData";
import { ManualIcon } from "./ManualIcon";

interface ManualSidebarTocProps {
  isOpen: boolean;
  onClose: () => void;
  activeSection: ManualSectionId;
  matchingSectionIds: Set<ManualSectionId>;
  searchQuery: string;
  onSelectSection: (id: ManualSectionId) => void;
  onClearSearch: () => void;
}

export function ManualSidebarToc({
  isOpen,
  onClose,
  activeSection,
  matchingSectionIds,
  searchQuery,
  onSelectSection,
  onClearSearch,
}: ManualSidebarTocProps) {
  // Close drawer with Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePick = (id: ManualSectionId) => {
    onSelectSection(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-xs animate-in fade-in duration-150"
      />

      {/* Slide-Over Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Guide Contents"
        className="relative z-10 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-200"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-400/30 text-emerald-300">
              <BookMarked className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-white">
                Guide Contents
              </h2>
              <p className="text-[10px] text-slate-400">
                Showing {matchingSectionIds.size} of {MANUAL_TOC_ITEMS.length} sections
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Guide Contents"
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Sections List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {MANUAL_TOC_ITEMS.map((item) => {
            if (!matchingSectionIds.has(item.id)) return null;
            const active = activeSection === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePick(item.id)}
                className={`w-full flex items-start gap-3 rounded-xl px-3.5 py-2.5 text-left transition-all cursor-pointer ${
                  active
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200 shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                }`}
              >
                <ManualIcon
                  name={item.icon}
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    active ? "text-emerald-600" : "text-slate-400"
                  }`}
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold leading-snug truncate">
                    {item.number}. {item.title}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    {item.shortDesc}
                  </p>
                </div>
              </button>
            );
          })}

          {matchingSectionIds.size === 0 && (
            <div className="py-10 text-center space-y-2">
              <p className="text-xs font-semibold text-slate-500">
                No sections match &quot;{searchQuery}&quot;
              </p>
              <button
                type="button"
                onClick={onClearSearch}
                className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
              >
                Clear search
              </button>
            </div>
          )}
        </nav>

        {/* Drawer Footer: Sample JSON Templates */}
        <div className="border-t border-slate-200 bg-indigo-50/70 p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-indigo-800">
            <FileJson className="w-4 h-4 shrink-0" />
            <h3 className="text-[11px] font-extrabold uppercase tracking-wider">
              Sample JSON Templates
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_TEMPLATES.map((tpl) => (
              <a
                key={tpl.fileName}
                href={tpl.href}
                download={tpl.fileName}
                className="flex items-center justify-between gap-1.5 rounded-xl bg-white border border-indigo-200 px-3 py-2 text-[11px] font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors"
                title={tpl.description}
              >
                <span className="truncate">{tpl.shortLabel}</span>
                <Download className="w-3.5 h-3.5 shrink-0" />
              </a>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
