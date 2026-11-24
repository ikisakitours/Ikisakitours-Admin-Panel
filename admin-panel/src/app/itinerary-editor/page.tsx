"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Eye,
  FileEdit,
  Home,
  Printer,
  Save,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  DEFAULT_COMPANY_INFO,
  type ItineraryDocument,
  type ItineraryLanguage,
} from "./types/itinerary.types";
import { ItineraryPreviewA4 } from "./components/ItineraryPreviewA4";
import { ItineraryFormEditor } from "./components/ItineraryFormEditor";
import { ItineraryWordHub } from "./components/ItineraryWordHub";
import { generateItineraryFromPackage } from "./utils/itineraryGenerator";
import { packageService } from "@/services/package.service";

const ACTIVE_DRAFT_KEY = "ikisaki_active_itinerary_draft";
const DRAFTS_COLLECTION_KEY = "ikisaki_itinerary_drafts";

function cleanBulletsFromList(list?: string[]): string[] {
  if (!Array.isArray(list)) return [];
  return list.map((s) => s.replace(/^[\s•\-\*▪▸\u2022\u25AA\u25B8\u25B6]+\s*/, ""));
}

// Blank Document Creator (Zero Mock Data)
export function createBlankDocument(): ItineraryDocument {
  return {
    id: `itin-blank-${Date.now()}`,
    title: "New Custom Itinerary",
    referenceNo: `IK-${Math.floor(1000 + Math.random() * 9000)}AW`,
    language: "en",
    tourName: "",
    tourNameJa: "",
    tourDates: "",
    tourDatesJa: "",
    guests: [],
    flights: [],
    schedule: [],
    remarks: [
      "Lunches by client unless specified under special package inclusions.",
      "Modest dress code is strictly required at Buddhist and Hindu sacred temples.",
      "Check-in time at hotels is 14:00 hrs and Check-out time is 12:00 noon.",
    ],
    remarksJa: [
      "昼食はお客様実費負担となります（特記プランを除く）。",
      "寺院参拝時は肩と膝が隠れる服装が必要です。",
      "チェックインは14:00、チェックアウトは12:00です。",
    ],
    companyInfo: { ...DEFAULT_COMPANY_INFO },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function ItineraryEditorPage() {
  const [currentScreen, setCurrentScreen] = useState<"hub" | "editor">("hub");
  const [doc, setDoc] = useState<ItineraryDocument>(() => createBlankDocument());
  const [drafts, setDrafts] = useState<ItineraryDocument[]>([]);
  // Only Edit and Preview modes (Split mode removed per Point 01)
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [zoom, setZoom] = useState<number>(0.95);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // On mount: check if explicitly arriving from a tour booking (Point 03)
  useEffect(() => {
    try {
      const collectionRaw = localStorage.getItem(DRAFTS_COLLECTION_KEY);
      if (collectionRaw) {
        const parsed = JSON.parse(collectionRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sanitized = parsed.map((d: any) => {
            const copy = { ...d };
            if (
              !copy.companyInfo ||
              copy.companyInfo.address?.includes("World Trade Center") ||
              copy.companyInfo.tel?.includes("0117")
            ) {
              copy.companyInfo = { ...DEFAULT_COMPANY_INFO };
            }
            if (copy.remarks) copy.remarks = cleanBulletsFromList(copy.remarks);
            if (copy.remarksJa) copy.remarksJa = cleanBulletsFromList(copy.remarksJa);
            return copy;
          });
          setDrafts(sanitized);
        }
      }

      // Check URL parameters
      const searchParams = new URLSearchParams(window.location.search);
      const fromBooking = searchParams.get("fromBooking") === "true";

      if (fromBooking) {
        const activeRaw = localStorage.getItem(ACTIVE_DRAFT_KEY);
        if (activeRaw) {
          let activeDoc = JSON.parse(activeRaw);
          if (activeDoc && activeDoc.id) {
            if (
              !activeDoc.companyInfo ||
              activeDoc.companyInfo.address?.includes("World Trade Center") ||
              activeDoc.companyInfo.tel?.includes("0117")
            ) {
              activeDoc = { ...activeDoc, companyInfo: { ...DEFAULT_COMPANY_INFO } };
            }
            if (activeDoc.remarks) activeDoc.remarks = cleanBulletsFromList(activeDoc.remarks);
            if (activeDoc.remarksJa) activeDoc.remarksJa = cleanBulletsFromList(activeDoc.remarksJa);
            setDoc(activeDoc);
            setCurrentScreen("editor");
            setViewMode("edit");
            return;
          }
        }
      }

      // If clicked from sidebar (no fromBooking query parameter), ALWAYS open the Word Hub!
      setCurrentScreen("hub");
    } catch {
      setCurrentScreen("hub");
    }
  }, []);

  // Save current document to localStorage
  const handleSaveDraft = () => {
    try {
      const updatedDoc = { ...doc, updatedAt: new Date().toISOString() };
      setDoc(updatedDoc);
      localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(updatedDoc));

      const existingIdx = drafts.findIndex((d) => d.id === updatedDoc.id);
      let newDrafts: ItineraryDocument[];
      if (existingIdx >= 0) {
        newDrafts = [...drafts];
        newDrafts[existingIdx] = updatedDoc;
      } else {
        newDrafts = [updatedDoc, ...drafts];
      }
      setDrafts(newDrafts);
      localStorage.setItem(DRAFTS_COLLECTION_KEY, JSON.stringify(newDrafts));

      showToast("Document saved to local drafts!");
    } catch {
      showToast("Failed to save draft");
    }
  };

  const handleOpenDocument = (selected: ItineraryDocument) => {
    setDoc(selected);
    localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(selected));
    setCurrentScreen("editor");
    setViewMode("edit");
  };

  const handleDeleteDraft = (id: string) => {
    const updated = drafts.filter((d) => d.id !== id);
    setDrafts(updated);
    localStorage.setItem(DRAFTS_COLLECTION_KEY, JSON.stringify(updated));
    showToast("Document deleted");
  };

  const handleNewBlank = () => {
    const blank = createBlankDocument();
    setDoc(blank);
    localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(blank));
    setCurrentScreen("editor");
    setViewMode("edit");
  };

  const handleNewFromPackage = async (slug: string) => {
    try {
      const fullPkg = await packageService.getPackageBySlug(slug);
      const itineraryDoc = generateItineraryFromPackage(fullPkg);
      setDoc(itineraryDoc);
      localStorage.setItem(ACTIVE_DRAFT_KEY, JSON.stringify(itineraryDoc));
      const collectionRaw = localStorage.getItem(DRAFTS_COLLECTION_KEY);
      const list = collectionRaw ? JSON.parse(collectionRaw) : [];
      const updatedList = [itineraryDoc, ...list.filter((d: any) => d.id !== itineraryDoc.id)];
      localStorage.setItem(DRAFTS_COLLECTION_KEY, JSON.stringify(updatedList));
      setDrafts(updatedList);
      setCurrentScreen("editor");
      setViewMode("edit");
      showToast(`Loaded package itinerary: ${itineraryDoc.tourName}`);
    } catch {
      showToast("Failed to load tour package details");
    }
  };

  const handleToggleLanguage = (lang: ItineraryLanguage) => {
    setDoc((prev) => ({
      ...prev,
      language: lang,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  // Disabled in Edit mode, enabled ONLY in Preview mode (Point 06)
  const isPrintDisabled = viewMode !== "preview";

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col itinerary-studio-root print:bg-white print:min-h-0 print:block print:p-0 print:m-0">
      {/* Toast Notification (Hidden in Print) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-xl animate-in fade-in duration-200 print:hidden">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SCREEN A: WORD-STYLE START HUB (Point 03)
      ══════════════════════════════════════════════════════════ */}
      {currentScreen === "hub" && (
        <div className="flex-1 overflow-y-auto">
          {/* Header Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-xs">
            <div className="max-w-[1400px] mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-extrabold text-sm shadow-xs">
                  IT
                </span>
                <div>
                  <h1 className="text-base font-extrabold text-slate-900">
                    PDF Itinerary Studio
                  </h1>
                  <p className="text-xs text-slate-500">
                    Microsoft Word style layout • Manage tour itineraries, drafts, and print-ready PDFs
                  </p>
                </div>
              </div>

              <Link
                href="/tours"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Tour Bookings</span>
              </Link>
            </div>
          </div>

          <ItineraryWordHub
            drafts={drafts}
            onOpenDocument={handleOpenDocument}
            onNewBlank={handleNewBlank}
            onNewFromPackage={handleNewFromPackage}
            onDeleteDraft={handleDeleteDraft}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SCREEN B: ITINERARY STUDIO (Edit / Preview - Point 01)
      ══════════════════════════════════════════════════════════ */}
      {currentScreen === "editor" && (
        <div className="flex-1 flex flex-col itinerary-studio-screen print:block print:p-0 print:m-0 print:w-full print:bg-white">
          {/* TOP STUDIO TOOLBAR (Hidden in Print) */}
          <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs print:hidden">
            <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
              {/* Left: Hub Navigation & Title */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("hub")}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-50 transition-colors cursor-pointer"
                  title="Return to Documents Hub"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Documents Hub</span>
                </button>

                <div className="h-5 w-px bg-slate-200" />

                <div className="flex items-center gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xs font-black text-slate-900 uppercase">
                        {doc.referenceNo}
                      </h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                        {doc.schedule.length} Days
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate max-w-xs">
                      {doc.title || doc.tourName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Center: Language & View Mode & Zoom */}
              <div className="flex items-center gap-2">
                {/* Language Switcher: (EN) and (JA) only (Point 02) */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleToggleLanguage("en")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      doc.language === "en"
                        ? "bg-emerald-600 text-white shadow-xs font-extrabold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    (EN)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleLanguage("ja")}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      doc.language === "ja"
                        ? "bg-emerald-600 text-white shadow-xs font-extrabold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    (JA)
                  </button>
                </div>

                {/* View Mode Toggle: Edit & Preview only (Split removed per Point 01) */}
                <div className="flex items-center p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  <button
                    type="button"
                    onClick={() => setViewMode("edit")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      viewMode === "edit"
                        ? "bg-white text-emerald-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Full Width Editor Form"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("preview")}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      viewMode === "preview"
                        ? "bg-white text-emerald-700 shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Full A4 Preview (Required to Print)"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                </div>

                {/* Zoom Controls (when preview mode) */}
                {viewMode === "preview" && (
                  <div className="hidden md:flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.max(0.5, Number((z - 0.1).toFixed(2))))}
                      className="p-1 rounded-md text-slate-600 hover:text-slate-950 cursor-pointer"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-[11px] text-slate-700 w-11 text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))))}
                      className="p-1 rounded-md text-slate-600 hover:text-slate-950 cursor-pointer"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 text-xs font-extrabold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-xs cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Save Draft</span>
                </button>

                {/* Print/Download Button: DISABLED in Edit mode (Point 06) */}
                <div className="relative group">
                  <button
                    type="button"
                    disabled={isPrintDisabled}
                    onClick={handlePrint}
                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-extrabold transition-all shadow-sm ${
                      isPrintDisabled
                        ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60"
                        : "bg-slate-900 text-white hover:bg-emerald-600 cursor-pointer"
                    }`}
                    title={
                      isPrintDisabled
                        ? "Switch to Preview mode to Print / Download PDF"
                        : "Print or Download PDF Document"
                    }
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / Download PDF</span>
                  </button>

                  {isPrintDisabled && (
                    <span className="hidden group-hover:block absolute right-0 top-full mt-1.5 px-2.5 py-1 rounded-lg bg-slate-900 text-[10px] font-bold text-white whitespace-nowrap z-50 shadow-lg">
                      Switch to Preview mode to Print
                    </span>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* WORKSPACE AREA: Edit Form or A4 Preview (Split removed per Point 01) */}
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto itinerary-studio-main print:p-0 print:m-0 print:overflow-visible print:block print:w-full print:max-w-none print:bg-white">
            <div className="max-w-6xl mx-auto itinerary-studio-container print:max-w-none print:w-full print:m-0 print:p-0">
              {/* 1. Full Editor Mode */}
              {viewMode === "edit" && (
                <div className="w-full">
                  <ItineraryFormEditor document={doc} onChange={setDoc} />
                </div>
              )}

              {/* 2. Full Preview Mode (Ready to Print) */}
              {viewMode === "preview" && (
                <div className="flex flex-col items-center py-4 space-y-4 itinerary-preview-center print:p-0 print:m-0 print:block print:w-full">
                  <div className="print:hidden p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Document is in full preview. Ready to Print or Save as PDF.</span>
                  </div>
                  <ItineraryPreviewA4 document={doc} zoom={zoom} />
                </div>
              )}
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
