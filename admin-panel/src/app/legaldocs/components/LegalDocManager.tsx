"use client";

import React, { useState, useEffect } from "react";
import { Shield, FileText, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { LegalDocument } from "../types/legal.types";
import { legalDocsService } from "@/services/legaldocs.service";
import DocumentSidebar from "./DocumentSidebar";
import LegalDocEditor from "./LegalDocEditor";
import NewDocumentModal from "./NewDocumentModal";

export default function LegalDocManager() {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [activeId, setActiveId]   = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading]     = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    setErrorMessage(null);
    try {
      await legalDocsService.insertDocument(newDoc);
      setDocuments((prev) => [...prev, newDoc]);
      setActiveId(newDoc.id);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create document.");
    }
  };

  const deleteDocument = async (id: string) => {
    setErrorMessage(null);
    try {
      await legalDocsService.deleteDocument(id);
      const remaining = documents.filter((d) => d.id !== id);
      setDocuments(remaining);
      setActiveId(remaining[0]?.id ?? "");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to delete document.");
    }
  };

  return (
    <div className="w-full space-y-6 relative">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pb-5 border-b border-slate-200">
        <div className="flex items-start gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs shrink-0 mt-0.5">
            <Shield className="w-4 h-4" />
          </span>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Legal Documents
            </h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Create, edit, and manage IkiSaki Tours policy documents across dynamic languages — Terms of Service, Privacy Policy, Booking Policy, Payment Policy, Cookie Policy, and custom policies.
            </p>
          </div>
        </div>

        {/* Buttons & Stats Pills placed below paragraph, aligned to the right */}
        <div className="flex items-center justify-end gap-2.5 w-full flex-wrap">
          <button
            type="button"
            onClick={loadDocuments}
            disabled={loading}
            className="flex items-center justify-center w-9 h-9 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
            title="Reload from Server"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50/80 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-700 shadow-xs">
            <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>Documents</span>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[11px] tabular-nums shrink-0">
              {documents.length}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50/80 border border-emerald-100 rounded-xl text-xs font-semibold text-emerald-700 shadow-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Total Sections</span>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-white font-bold text-[11px] tabular-nums shrink-0">
              {documents.reduce((acc, d) => acc + (d.sections?.length || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Error Alert Banner (only shown if an error occurs) ─────────── */}
      {errorMessage && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold shadow-xs">
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
