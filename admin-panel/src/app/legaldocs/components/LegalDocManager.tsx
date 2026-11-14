"use client";

import React, { useState, useEffect } from "react";
import { Shield, FileText, RefreshCw, Loader2 } from "lucide-react";
import { LegalDocument } from "../types/legal.types";
import { INITIAL_LEGAL_DOCUMENTS } from "../data/mockData";
import { legalDocsService } from "@/services/legaldocs.service";
import DocumentSidebar from "./DocumentSidebar";
import LegalDocEditor from "./LegalDocEditor";
import NewDocumentModal from "./NewDocumentModal";

export default function LegalDocManager() {
  const [documents, setDocuments] = useState<LegalDocument[]>(INITIAL_LEGAL_DOCUMENTS);
  const [activeId, setActiveId]   = useState<string>(INITIAL_LEGAL_DOCUMENTS[0]?.id ?? "");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading]     = useState<boolean>(true);

  // Dynamic language management (matches PackageFormWrapper & FaqForm)
  const [locale, setLocale]                         = useState<string>("en");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(["en", "ja"]);

  const activeDoc = documents.find((d) => d.id === activeId) ?? null;

  // Scan configurations to discover any newly added languages
  const discoverLanguages = (docs: LegalDocument[]) => {
    const discovered = new Set<string>(["en", "ja"]);
    const scan = (obj: any) => {
      if (!obj || typeof obj !== "object") return;
      if (!Array.isArray(obj)) {
        Object.keys(obj).forEach((k) => {
          if (typeof k === "string" && k.length <= 5) {
            discovered.add(k);
          }
        });
      }
    };

    docs.forEach((doc) => {
      scan(doc.title);
      scan(doc.eyebrow);
      doc.sections?.forEach((s) => {
        scan(s.heading);
        scan(s.content);
        s.subItems?.forEach((si) => {
          scan(si.title);
          scan(si.body);
        });
      });
    });

    setAvailableLanguages(Array.from(discovered));
  };

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const data = await legalDocsService.getAllDocuments();
      if (Array.isArray(data) && data.length > 0) {
        setDocuments(data);
        if (!data.some((d) => d.id === activeId)) {
          setActiveId(data[0].id);
        }
        discoverLanguages(data);
      }
    } catch (err: any) {
      console.error("Failed to load legal documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

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

  const addDocument = async (newDoc: LegalDocument) => {
    try {
      await legalDocsService.insertDocument(newDoc);
      setDocuments((prev) => [...prev, newDoc]);
      setActiveId(newDoc.id);
    } catch (err: any) {
      alert("Failed to create document: " + err.message);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await legalDocsService.deleteDocument(id);
      const remaining = documents.filter((d) => d.id !== id);
      setDocuments(remaining);
      setActiveId(remaining[0]?.id ?? "");
    } catch (err: any) {
      alert("Failed to delete document: " + err.message);
    }
  };

  return (
    <div className="w-full space-y-6 relative">
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

        {/* Summary stats & Refresh */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={loadDocuments}
            disabled={loading}
            className="p-2 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-600 transition-all cursor-pointer disabled:opacity-50"
            title="Reload from Server"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

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
                {documents.reduce((acc, d) => acc + (d.sections?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-column Layout ────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-10 flex items-center justify-center rounded-2xl min-h-[400px]">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Loading legal documents...</span>
            </div>
          </div>
        )}

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
