"use client";

import React from "react";
import { Plus, FileText } from "lucide-react";
import { LegalDocument, resolveLocalized } from "../types/legal.types";

// ─────────────────────────────────────────────────────────────────────────────
// DocumentSidebar – lists all policy documents and allows the admin to
// select or trigger the creation of a new custom document.
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_DOT: Record<string, string> = {
  emerald: "bg-emerald-400",
  indigo:  "bg-indigo-400",
  blue:    "bg-blue-400",
  amber:   "bg-amber-400",
  rose:    "bg-rose-400",
  violet:  "bg-violet-400",
  sky:     "bg-sky-400",
  orange:  "bg-orange-400",
};

interface Props {
  documents: LegalDocument[];
  activeId: string;
  locale: string;
  onSelect: (id: string) => void;
  onAddNew: () => void;
}

export default function DocumentSidebar({
  documents,
  activeId,
  locale,
  onSelect,
  onAddNew,
}: Props) {
  return (
    <aside className="w-full lg:w-64 shrink-0 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Policy Documents
          </span>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={onAddNew}
          title="Add new policy document"
          className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-[11px] font-semibold transition-all shadow-sm"
        >
          <Plus className="w-3 h-3" /> New
        </button>
      </div>

      {/* Document list */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {documents.map((doc) => {
          const isActive = doc.id === activeId;
          const dot = ACCENT_DOT[doc.accent ?? "indigo"] ?? ACCENT_DOT.indigo;
          const title = resolveLocalized(doc.title, locale, "Untitled Policy");

          return (
            <button
              key={doc.id}
              type="button"
              onClick={() => onSelect(doc.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all group ${
                isActive
                  ? "bg-indigo-50 border border-indigo-100 text-indigo-700"
                  : "border border-transparent hover:bg-slate-50 hover:border-slate-200 text-slate-700"
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />

              <div className="flex-1 min-w-0">
                <span
                  className={`block text-xs font-semibold truncate ${
                    isActive ? "text-indigo-700" : "text-slate-800"
                  }`}
                >
                  {title}
                </span>
                <span className="block text-[10px] text-slate-400 truncate font-mono">
                  /{doc.id}
                </span>
              </div>

              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${
                  isActive
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {doc.sections.length}
              </span>
            </button>
          );
        })}

        {documents.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
            <FileText className="w-6 h-6 mb-2 opacity-40" />
            <p className="text-xs">No documents yet.</p>
            <p className="text-[10px] mt-0.5">
              Click <strong>New</strong> to create one.
            </p>
          </div>
        )}
      </nav>

      {/* Footer hint */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50">
        <p className="text-[10px] text-slate-400 leading-relaxed">
          Click a document to open it in the editor on the right.
        </p>
      </div>
    </aside>
  );
}
