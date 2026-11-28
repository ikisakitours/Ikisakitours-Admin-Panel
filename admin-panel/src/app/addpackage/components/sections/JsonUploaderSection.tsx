"use client";

import React, { useState, useRef, useCallback } from "react";
import { PackageFormData } from "../../types/package.types";
import { AdminToast, type AdminToastState, type ToastVariant } from "@/components/AdminToast";
import {
  UploadCloud,
  FileCode,
  ClipboardPaste,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileText,
  RotateCcw,
  Code2,
} from "lucide-react";

interface JsonUploaderSectionProps {
  formData: PackageFormData;
  setFormData: React.Dispatch<React.SetStateAction<PackageFormData>>;
  activeLang: string;
  setActiveLang: (lang: string) => void;
  availableLanguages: string[];
  setAvailableLanguages: React.Dispatch<React.SetStateAction<string[]>>;
}

export const JsonUploaderSection: React.FC<JsonUploaderSectionProps> = ({
  formData,
  setFormData,
  activeLang,
  setActiveLang,
  availableLanguages,
  setAvailableLanguages,
}) => {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [pastedJson, setPastedJson] = useState<string>("");
  const [toast, setToast] = useState<AdminToastState | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  // Helper to dynamically extract language keys from translation record objects
  const extractLanguages = (data: any): string[] => {
    const langs = new Set<string>();
    const findLangs = (obj: any) => {
      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        const keys = Object.keys(obj);
        if (keys.length > 0 && keys.every((k) => k.length <= 5)) {
          keys.forEach((k) => langs.add(k));
        }
        Object.values(obj).forEach((val) => findLangs(val));
      }
    };
    findLangs(data);
    return langs.size > 0 ? Array.from(langs) : ["en"];
  };

  // Clean raw AI input (removes markdown fences like ```json ... ```)
  const sanitizeJsonString = (raw: string): string => {
    let clean = raw.trim();
    if (clean.startsWith("```")) {
      clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }
    return clean.trim();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const cleanContent = sanitizeJsonString(event.target?.result as string);
        const parsed = JSON.parse(cleanContent);
        applyJsonData(parsed);
      } catch (err) {
        notify("Invalid JSON file format. Please verify the file syntax.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json")) {
      notify("Please select a valid .json file.", "warning");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const cleanContent = sanitizeJsonString(event.target?.result as string);
        const parsed = JSON.parse(cleanContent);
        applyJsonData(parsed);
      } catch (err) {
        notify("Invalid JSON file format. Please verify the file syntax.", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPastedJson = () => {
    if (!pastedJson.trim()) {
      notify("Please paste your JSON code into the editor box below.", "warning");
      return;
    }

    try {
      const cleanContent = sanitizeJsonString(pastedJson);
      const parsed = JSON.parse(cleanContent);
      applyJsonData(parsed);
    } catch (err: any) {
      notify(`Invalid JSON syntax: ${err.message || "Please check brackets, quotes, or trailing commas."}`, "error");
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setPastedJson(clipText);
      }
    } catch {
      // Fallback if permission blocked
    }
  };

  const handleQuickPasteAndApply = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const clipText = await navigator.clipboard.readText();
      if (!clipText || !clipText.trim()) {
        setMode("paste");
        notify("Clipboard is empty. Copy the JSON from Gemini/ChatGPT and paste it below.", "warning");
        return;
      }
      const cleanContent = sanitizeJsonString(clipText);
      const parsed = JSON.parse(cleanContent);
      setPastedJson(cleanContent);
      applyJsonData(parsed);
    } catch (err: any) {
      setMode("paste");
      if (err.name === "NotAllowedError" || err.message?.includes("permission")) {
        notify("Clipboard read permission was not granted by your browser. Please paste your JSON directly into the box below (Ctrl+V) and click 'Apply JSON to Form'.", "warning");
      } else {
        notify(`Invalid JSON syntax from clipboard: ${err.message || "Please check brackets, quotes, or trailing commas."}`, "error");
      }
    }
  };

  const handleFormatPastedJson = () => {
    try {
      const cleanContent = sanitizeJsonString(pastedJson);
      const parsed = JSON.parse(cleanContent);
      setPastedJson(JSON.stringify(parsed, null, 2));
    } catch {
      notify("Cannot format: JSON contains syntax errors.", "error");
    }
  };

  const applyJsonData = (parsed: any) => {
    try {
      // 1. Detect languages dynamically from uploaded/pasted data
      const detectedLangs = extractLanguages(parsed);
      setAvailableLanguages(detectedLangs);
      if (!detectedLangs.includes(activeLang)) {
        setActiveLang(detectedLangs[0] || "en");
      }

      // 2. Populate form data state, ensuring pricingNotes & pricingConfig are deep-merged
      setFormData((prev) => {
        const mergedPricingConfig = {
          ...(prev.pricingConfig || {}),
          ...(parsed.pricingConfig || {}),
          pricingNotes:
            parsed.pricingConfig?.pricingNotes ||
            parsed.pricingNotes ||
            prev.pricingConfig?.pricingNotes,
        };

        return {
          ...prev,
          ...parsed,
          pricingConfig: mergedPricingConfig,
          pricingNotes: mergedPricingConfig.pricingNotes || prev.pricingNotes,
        };
      });

      notify("JSON package successfully loaded and all form fields populated!", "success");
    } catch (err) {
      notify("Failed to apply JSON data to form.", "error");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xs border border-slate-200 dark:border-gray-800 p-5 sm:p-6 mb-6 transition-all">
      {/* Header Bar */}
      <div className="flex flex-col gap-2 mb-4 pb-3.5 border-b border-slate-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <FileCode className="w-4 h-4" />
          </span>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            JSON Package Importer &amp; Language Hub
          </h2>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            AI Ready
          </span>
        </div>
        {/* Full-width description paragraph (never wraps awkwardly) */}
        <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
          Upload a <code className="text-indigo-600 font-bold">.json</code> file or paste AI-generated JSON directly to instantly populate all tour overview, pricing, itinerary, and multilingual fields.
        </p>

        {/* Dual Mode Switcher Tabs placed on bottom right */}
        <div className="flex items-center justify-end pt-1">
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-gray-800 border border-slate-200/80 dark:border-gray-700 shrink-0">
            <button
              type="button"
              onClick={() => setMode("upload")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === "upload"
                  ? "bg-white dark:bg-gray-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-slate-200/60 dark:border-gray-700"
                  : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("paste")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === "paste"
                  ? "bg-white dark:bg-gray-900 text-indigo-700 dark:text-indigo-300 shadow-xs border border-slate-200/60 dark:border-gray-700"
                  : "text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Paste JSON Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Language Navigation Bar */}
      <div className="mb-4 p-3 bg-slate-50 dark:bg-gray-800/50 rounded-xl border border-slate-100 dark:border-gray-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">
            Active Form Language:
          </span>
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                activeLang === lang
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-gray-700 hover:bg-slate-100 dark:hover:bg-gray-700"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-500 dark:text-gray-400 font-medium flex items-center gap-1.5">
          <span>Detected in Data:</span>
          <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
            {availableLanguages.map((l) => l.toUpperCase()).join(", ")}
          </span>
        </div>
      </div>

      {/* Mode 1: Professional Drag & Drop File Upload Box */}
      {mode === "upload" && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[0.99]"
              : "border-slate-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-slate-50/60 dark:bg-gray-800/30 hover:bg-slate-50 dark:hover:bg-gray-800/50"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />

          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 mx-auto shadow-xs border border-slate-200/80 dark:border-gray-700 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Click to browse or drag &amp; drop JSON file
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Upload your structured multi-language <code className="text-indigo-600 font-semibold">.json</code> package file
              </p>
            </div>

          

            <div className="pt-2 flex items-center justify-center gap-2.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" /> Browse File
              </button>

              <button
                type="button"
                onClick={handleQuickPasteAndApply}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Read clipboard directly from Gemini / ChatGPT and populate form in 1 click"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>1-Click Paste &amp; Apply</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("paste")}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-indigo-500" />
                <span>Paste Code</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Paste Raw AI JSON Directly (No Notepad Needed!) */}
      {mode === "paste" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-gray-300">
            <span className="font-semibold flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-indigo-600" />
              Paste AI-Generated JSON String (from ChatGPT, Gemini, or Claude):
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <ClipboardPaste className="w-3 h-3" /> Paste from Clipboard
              </button>
              <span className="text-slate-300 dark:text-gray-700">|</span>
              <button
                type="button"
                onClick={handleFormatPastedJson}
                disabled={!pastedJson.trim()}
                className="text-[11px] font-semibold text-slate-600 dark:text-gray-300 hover:text-indigo-600 flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Sparkles className="w-3 h-3" /> Format
              </button>
              <span className="text-slate-300 dark:text-gray-700">|</span>
              <button
                type="button"
                onClick={() => {
                  setPastedJson("");
                  setToast(null);
                }}
                disabled={!pastedJson.trim()}
                className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>

          <div className="relative">
            <textarea
              rows={8}
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
              placeholder={`Paste raw JSON here (e.g. from ChatGPT or Gemini)...\n{\n  "title": { "en": "The Ultimate Sri Lanka Grand Explorer", "ja": "..." },\n  "type": "multiday",\n  "pricingConfig": { ... }\n}`}
              className="w-full text-xs font-mono p-4 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-900 text-emerald-300 placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <p className="text-[11px] text-slate-400">
              Markdown fences (<code>```json</code>) are stripped automatically. No need to save to Notepad!
            </p>
            <button
              type="button"
              onClick={handleApplyPastedJson}
              disabled={!pastedJson.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Apply JSON to Form</span>
            </button>
          </div>
        </div>
      )}

      {/* Executive Toast Notification */}
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
};
