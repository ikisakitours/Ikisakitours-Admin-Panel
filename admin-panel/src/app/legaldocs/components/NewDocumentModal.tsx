"use client";

import React, { useState } from "react";
import {
  X,
  Plus,
  FileText,
} from "lucide-react";
import { LegalDocument } from "../types/legal.types";

// ─────────────────────────────────────────────────────────────────────────────
// NewDocumentModal – lets the admin create a brand-new policy document
// with a custom title, ID, eyebrow label, accent colour, and date.
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
  locale: string;
  onClose: () => void;
  onAdd: (doc: LegalDocument) => void;
  existingIds: string[];
}

export default function NewDocumentModal({ locale, onClose, onAdd, existingIds }: Props) {
  const [title, setTitle]             = useState("");
  const [docId, setDocId]             = useState("");
  const [eyebrow, setEyebrow]         = useState("Legal & Compliance");
  const [accent, setAccent]           = useState("indigo");
  const [lastUpdated, setLastUpdated] = useState(
    new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  );
  const [idError, setIdError]         = useState<string | null>(null);

  const langLabel = locale.toUpperCase();

  const autoId = (val: string) =>
    val.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!docId || docId === autoId(title)) {
      const generated = autoId(val);
      setDocId(generated);
      setIdError(existingIds.includes(generated) ? "This ID is already in use." : null);
    }
  };

  const handleIdChange = (val: string) => {
    const sanitized = autoId(val) || val.toLowerCase();
    setDocId(sanitized);
    setIdError(existingIds.includes(sanitized) ? "This ID is already in use." : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !docId.trim()) return;
    if (idError) return;

    const newDoc: LegalDocument = {
      id: docId,
      title: { [locale]: title.trim(), ...(locale !== "en" ? { en: title.trim() } : {}) },
      eyebrow: { [locale]: eyebrow.trim() || "Legal" },
      accent,
      lastUpdated: lastUpdated.trim() || new Date().toLocaleDateString(),
      sections: [],
    };

    onAdd(newDoc);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </span>
            <div>
              <h2 className="text-sm font-bold text-slate-900">New Policy Document</h2>
              <p className="text-[10px] text-slate-400">Create a custom legal document ({langLabel})</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
              Document Title ({langLabel}) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Refund Policy"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
              Document ID (slug) *
            </label>
            <input
              type="text"
              required
              value={docId}
              onChange={(e) => handleIdChange(e.target.value)}
              placeholder="e.g. refund-policy"
              className={`w-full text-xs border rounded-lg p-2.5 outline-none bg-white font-mono transition-all ${
                idError
                  ? "border-red-300 focus:ring-red-100"
                  : "border-slate-200 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
              }`}
            />
            {idError && (
              <p className="mt-1 text-[10px] text-red-500 font-medium">{idError}</p>
            )}
            <p className="mt-1 text-[10px] text-slate-400">
              Auto-generated from title. Must be unique.
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
              Eyebrow Label ({langLabel})
            </label>
            <input
              type="text"
              value={eyebrow}
              onChange={(e) => setEyebrow(e.target.value)}
              placeholder="e.g. Legal & Compliance"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                Accent Colour
              </label>
              <select
                value={accent}
                onChange={(e) => setAccent(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
              >
                {ACCENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                Last Updated Date
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
              disabled={!!idError || !title.trim() || !docId.trim()}
              className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Create Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
