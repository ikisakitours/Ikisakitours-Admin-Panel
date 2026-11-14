"use client";

import React, { useState } from "react";
import { Shield, FileText, Info } from "lucide-react";
import { LegalDocument } from "../types/legal.types";
import { INITIAL_LEGAL_DOCUMENTS } from "../data/mockData";
import DocumentSidebar from "./DocumentSidebar";
import LegalDocEditor from "./LegalDocEditor";
import NewDocumentModal from "./NewDocumentModal";

// ─────────────────────────────────────────────────────────────────────────────
// LegalDocManager – top-level orchestrator for the entire Legal Docs page.
//   • Manages all document state & dynamic languages (useState-only, no backend)
//   • Renders the two-column layout: sidebar + editor
//   • Opens/closes the NewDocumentModal
// ─────────────────────────────────────────────────────────────────────────────

export default function LegalDocManager() {
  const [documents, setDocuments] = useState<LegalDocument[]>(INITIAL_LEGAL_DOCUMENTS);
  const [activeId, setActiveId]   = useState<string>(INITIAL_LEGAL_DOCUMENTS[0]?.id ?? "");
  const [modalOpen, setModalOpen] = useState(false);

  // Dynamic language management (matches PackageFormWrapper & FaqForm)
  const [locale, setLocale]                         = useState<string>("en");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(["en", "ja"]);

  const activeDoc = documents.find((d) => d.id === activeId) ?? null;

  const addCustomLanguage = () => {
    const lang = prompt("Enter new language code (e.g. fr, de, es, zh):")?.toLowerCase().trim();
    if (lang && !availableLanguages.includes(lang)) {
      setAvailableLanguages((prev) => [...prev, lang]);
      setLocale(lang);
    }
  };

  // ── Document CRUD ──────────────────────────────────────────────────────────

  const updateDocument = (updated: LegalDocument) => {
    setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const addDocument = (newDoc: LegalDocument) => {
    setDocuments((prev) => [...prev, newDoc]);
    setActiveId(newDoc.id);
  };

  const deleteDocument = (id: string) => {
    const remaining = documents.filter((d) => d.id !== id);
    setDocuments(remaining);
    setActiveId(remaining[0]?.id ?? "");
  };

  return (
    <div className="w-full space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600">
              <Shield className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Legal Documents
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Create, edit, and manage IkiSaki Tours policy documents across dynamic languages — Terms of Service, Privacy Policy, Booking Policy, Payment Policy, Cookie Policy, and custom policies.
          </p>
        </div>

        {/* Summary stats */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-indigo-50 border border-indigo-100 rounded-xl">
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            <div>
              <p className="text-[10px] text-indigo-400 font-semibold uppercase">Documents</p>
              <p className="text-sm font-extrabold text-indigo-700 leading-none">{documents.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-100 rounded-xl">
            <Shield className="w-3.5 h-3.5 text-emerald-500" />
            <div>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase">Total Sections</p>
              <p className="text-sm font-extrabold text-emerald-700 leading-none">
                {documents.reduce((acc, d) => acc + d.sections.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info Banner ──────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
        <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-400" />
        <p>
          Changes are managed in React state only — no backend calls are made.
          Use the <code className="font-mono text-blue-600 bg-blue-100 px-1 py-0.5 rounded">EN / JA / +</code> switcher to edit or add translations for any language.
        </p>
      </div>

      {/* ── Two-column Layout ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Left: Document Selector Sidebar */}
        <DocumentSidebar
          documents={documents}
          activeId={activeId}
          locale={locale}
          onSelect={setActiveId}
          onAddNew={() => setModalOpen(true)}
        />

        {/* Right: Editor */}
        <div className="flex-1 min-w-0 w-full">
          {activeDoc ? (
            <LegalDocEditor
              key={activeDoc.id}
              doc={activeDoc}
              locale={locale}
              availableLanguages={availableLanguages}
              onLocaleChange={setLocale}
              onAddLanguage={addCustomLanguage}
              onUpdate={updateDocument}
              onDelete={() => deleteDocument(activeDoc.id)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-28 bg-white rounded-2xl border border-slate-200 shadow-xs text-center">
              <FileText className="w-12 h-12 mb-4 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No document selected</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Choose a document from the sidebar on the left, or create a new one.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* New Document Modal */}
      {modalOpen && (
        <NewDocumentModal
          locale={locale}
          onClose={() => setModalOpen(false)}
          onAdd={addDocument}
          existingIds={documents.map((d) => d.id)}
        />
      )}
    </div>
  );
}
