"use client";

import React, { useState } from "react";
import {
  X,
  Settings2,
  Save,
  Calendar,
} from "lucide-react";
import { LegalDocument, resolveLocalized } from "../types/legal.types";

// ─────────────────────────────────────────────────────────────────────────────
// DocumentMetaModal – edit the top-level metadata of an existing document
// (title & eyebrow for the active language, accent colour, last-updated date).
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_OPTIONS = [
  { value: "emerald", label: "Emerald" },
  { value: "indigo",  label: "Indigo"  },
  { value: "blue",    label: "Blue"    },
  { value: "amber",   label: "Amber"   },
  { value: "rose",    label: "Rose"    },
  { value: "violet",  label: "Violet"  },
  { value: "sky",     label: "Sky"     },
  { value: "orange",  label: "Orange"  },
];

interface Props {
  doc: LegalDocument;
  locale: string;
  onClose: () => void;
  onSave: (updated: LegalDocument) => void;
}

export default function DocumentMetaModal({ doc, locale, onClose, onSave }: Props) {
  const [title, setTitle]             = useState(doc.title?.[locale] ?? "");
  const [eyebrow, setEyebrow]         = useState(doc.eyebrow?.[locale] ?? "");
  const [accent, setAccent]           = useState(doc.accent ?? "indigo");
  const [lastUpdated, setLastUpdated] = useState(doc.lastUpdated);

  const langLabel = locale.toUpperCase();
  const displayTitle = resolveLocalized(doc.title, locale, "Untitled");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...doc,
      title: { ...doc.title, [locale]: title.trim() },
      eyebrow: { ...(doc.eyebrow ?? {}), [locale]: eyebrow.trim() },
      accent,
      lastUpdated: lastUpdated.trim(),
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600">
              <Settings2 className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Document Settings ({langLabel})
              </h2>
              <p className="text-[10px] text-slate-400">
                Edit metadata for <span className="font-semibold text-slate-600">{displayTitle}</span>
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
              Document Title ({langLabel}) {locale === "en" && "*"}
            </label>
            <input
              type="text"
              required={locale === "en"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`Title in ${langLabel}…`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
              Eyebrow Label ({langLabel})
            </label>
            <input
              type="text"
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              placeholder={`e.g. Legal & Compliance (${langLabel})`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Accent Colour</label>
              <select
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
              >
                {ACCENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                <Calendar className="w-3 h-3 inline mr-1" />
                Last Updated
              </label>
              <input
                type="text"
                value={lastUpdated}
                onChange={(e) => setLastUpdated(e.target.value)}
                placeholder="e.g. November 1, 2026"
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <Save className="w-3.5 h-3.5" /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
