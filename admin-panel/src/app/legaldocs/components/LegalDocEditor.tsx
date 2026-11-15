"use client";

import React, { useState } from "react";
import {
  Plus,
  Save,
  Trash2,
  Settings2,
  Eye,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  LegalDocument,
  LegalSection,
  SectionType,
  resolveLocalized,
  ACCENT_BADGE,
} from "../types/legal.types";
import SectionEditor from "./SectionEditor";
import DocumentPreviewPanel from "./DocumentPreviewPanel";
import DocumentMetaModal from "./DocumentMetaModal";
import { LegalIcon } from "./LegalIcon";
import { legalDocsService } from "@/services/legaldocs.service";

// ─────────────────────────────────────────────────────────────────────────────
// LegalDocEditor – the main per-document editing pane:
//   • Dynamic Language Switcher (EN / JA + Add Custom Language)
//   • Tabbed header: "Editor" | "Live Preview"
//   • Add Section toolbar
//   • SectionEditor list
//   • Save / Delete document buttons
// ─────────────────────────────────────────────────────────────────────────────

function uid(): string {
  return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

const DEFAULT_TYPE: SectionType = "paragraph";

interface Props {
  doc: LegalDocument;
  locale: string;
  availableLanguages: string[];
  onLocaleChange: (lang: string) => void;
  onAddLanguage: () => void;
  onUpdate: (updated: LegalDocument) => void;
  onDelete: () => void;
}

type Tab = "editor" | "preview";

export default function LegalDocEditor({
  doc,
  locale,
  availableLanguages,
  onLocaleChange,
  onAddLanguage,
  onUpdate,
  onDelete,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("editor");
  const [metaOpen, setMetaOpen]   = useState(false);
  const [saved, setSaved]         = useState(false);
  const [saving, setSaving]       = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const badgeClass = ACCENT_BADGE[doc.accent ?? "indigo"] ?? ACCENT_BADGE.indigo;
  const displayTitle = resolveLocalized(doc.title, locale, "Untitled Policy");
  const displayEyebrow = resolveLocalized(doc.eyebrow, locale);

  // ── Section CRUD ────────────────────────────────────────────────────────

  const addSection = () => {
    const newSection: LegalSection = {
      id: uid(),
      heading: { [locale]: "" },
      sectionIcon: "FileText",
      type: DEFAULT_TYPE,
      content: { [locale]: "" },
      subItems: [],
      expanded: true,
    };
    onUpdate({ ...doc, sections: [...doc.sections, newSection] });
  };

  const updateSection = (idx: number, updated: LegalSection) => {
    const sections = [...doc.sections];
    sections[idx] = updated;
    onUpdate({ ...doc, sections });
  };

  const deleteSection = (idx: number) => {
    if (!confirm("Remove this section?")) return;
    onUpdate({ ...doc, sections: doc.sections.filter((_: LegalSection, i: number) => i !== idx) });
  };

  // ── Save (API Upsert) ─────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true);
    setErrorMessage(null);
    try {
      await legalDocsService.saveDocument(doc);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save legal document.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 shrink-0">
            <LegalIcon name={doc.sections[0]?.sectionIcon} className="w-5 h-5" />
          </span>
          <div className="min-w-0">
            {displayEyebrow && (
              <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border mb-1 ${badgeClass}`}>
                {displayEyebrow}
              </span>
            )}
            <h2 className="text-base font-extrabold text-slate-900 truncate">{displayTitle}</h2>
            <p className="text-[10px] text-slate-400">
              Last updated: <span className="text-slate-600 font-medium">{doc.lastUpdated}</span>
              {" · "}
              <span className="font-medium">{doc.sections.length}</span> section{doc.sections.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {/* Dynamic Language Switcher (matches PackageFormWrapper & FaqForm) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap">
            {availableLanguages.map((langKey) => (
              <button
                key={langKey}
                type="button"
                onClick={() => onLocaleChange(langKey)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all uppercase cursor-pointer ${
                  locale === langKey
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-200"
                }`}
              >
                {langKey}
              </button>
            ))}
            <button
              type="button"
              onClick={onAddLanguage}
              className="p-1.5 text-slate-500 hover:text-indigo-600 text-xs flex items-center gap-0.5 font-semibold cursor-pointer"
              title="Add new language code"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Meta edit */}
          <button
            type="button"
            onClick={() => setMetaOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-all"
          >
            <Settings2 className="w-3.5 h-3.5" /> Settings
          </button>

          {/* Delete document */}
          <button
            type="button"
            onClick={() => {
              if (confirm(`Delete "${displayTitle}" permanently?`)) onDelete();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-lg text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-60 ${
              saved
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" /> Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Error Alert Banner (only shown if an error occurs) ─────────── */}
      {errorMessage && (
        <div className="flex items-center justify-between gap-3 px-5 py-3 bg-red-50 border-b border-red-200 text-red-800 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-800 text-[11px] font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex border-b border-slate-100 px-5 gap-0">
        {(["editor", "preview"] as Tab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-semibold capitalize border-b-2 transition-all ${
              activeTab === tab
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab === "editor" ? (
              <><FileText className="w-3.5 h-3.5" /> Editor ({locale.toUpperCase()})</>
            ) : (
              <><Eye className="w-3.5 h-3.5" /> Live Preview ({locale.toUpperCase()})</>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "editor" ? (
        <div className="p-5 space-y-4 flex-1 overflow-y-auto">
          {/* Add Section bar */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sections ({doc.sections.length}) · {locale.toUpperCase()}
            </span>
            <button
              type="button"
              onClick={addSection}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Add Section
            </button>
          </div>

          {/* Empty state */}
          {doc.sections.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-xl">
              <FileText className="w-10 h-10 mb-3 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No sections yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Click <strong>Add Section</strong> above to build out this document&apos;s content.
              </p>
            </div>
          )}

          {/* Section list */}
          <div className="space-y-2">
            {doc.sections.map((section: LegalSection, idx: number) => (
              <SectionEditor
                key={section.id}
                section={section}
                index={idx}
                locale={locale}
                onUpdate={(updated) => updateSection(idx, updated)}
                onDelete={() => deleteSection(idx)}
              />
            ))}
          </div>

          {/* Footer save reminder */}
          {doc.sections.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Remember to click <strong>Save Changes</strong> after editing.
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          <DocumentPreviewPanel doc={doc} locale={locale} />
        </div>
      )}

      {/* Meta Modal */}
      {metaOpen && (
        <DocumentMetaModal
          doc={doc}
          locale={locale}
          onClose={() => setMetaOpen(false)}
          onSave={(updated) => {
            onUpdate(updated);
            setMetaOpen(false);
          }}
        />
      )}
    </div>
  );
}
