"use client";

import React, { useState, useRef, useCallback } from "react";
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

interface JsonImporterProps {
  onLoadJson: (jsonData: any) => void;
}

export default function JsonImporter({ onLoadJson }: JsonImporterProps) {
  const [mode, setMode] = useState<"upload" | "paste">("upload");
  const [pastedJson, setPastedJson] = useState<string>("");
  const [toast, setToast] = useState<AdminToastState | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

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
        applyData(parsed);
      } catch (err) {
        notify("Invalid JSON file format. Please verify the file structure.", "error");
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
        applyData(parsed);
      } catch (err) {
        notify("Invalid JSON file format. Please verify the file structure.", "error");
      }
    };
    reader.readAsText(file);
  };

  const handleApplyPastedJson = () => {
    if (!pastedJson.trim()) {
      notify("Please paste your blog JSON into the editor box.", "warning");
      return;
    }

    try {
      const cleanContent = sanitizeJsonString(pastedJson);
      const parsed = JSON.parse(cleanContent);
      applyData(parsed);
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
      // Fallback
    }
  };

  const handleQuickPasteAndApply = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const clipText = await navigator.clipboard.readText();
      if (!clipText || !clipText.trim()) {
        setMode("paste");
        notify("Clipboard is empty. Copy the blog JSON from Gemini/ChatGPT and paste it below.", "warning");
        return;
      }
      const cleanContent = sanitizeJsonString(clipText);
      const parsed = JSON.parse(cleanContent);
      setPastedJson(cleanContent);
      applyData(parsed);
    } catch (err: any) {
      setMode("paste");
      if (err.name === "NotAllowedError" || err.message?.includes("permission")) {
        notify("Clipboard read permission was not granted by your browser. Please paste your JSON directly into the box below (Ctrl+V) and click 'Apply JSON to Blog'.", "warning");
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

  const applyData = (parsed: any) => {
    try {
      onLoadJson(parsed);
      notify("Blog article data successfully loaded and form populated!", "success");
    } catch {
      notify("Failed to apply blog JSON data.", "error");
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
            Import Blog Article via JSON
          </h2>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            AI Ready
          </span>
        </div>
        {/* Full-width description paragraph (never wraps awkwardly) */}
        <p className="text-xs text-slate-500 dark:text-gray-400 leading-relaxed">
          Upload a <code className="text-indigo-600 font-bold">.json</code> file or paste AI-generated JSON directly to pre-fill multilingual title, summary, content, author, and category.
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

      {/* Mode 1: Drag & Drop File Upload Box */}
      {mode === "upload" && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 ${
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

          <div className="max-w-md mx-auto space-y-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 mx-auto shadow-xs border border-slate-200/80 dark:border-gray-700 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-5 h-5" />
            </div>

            <div className="space-y-0.5">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                Click to browse or drag &amp; drop blog JSON
              </p>
              <p className="text-[11px] text-slate-500 dark:text-gray-400">
                Upload your structured multi-language <code className="text-indigo-600 font-semibold">sample-blog.json</code> file
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" /> Browse File
              </button>

              <button
                type="button"
                onClick={handleQuickPasteAndApply}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                title="Read clipboard directly from Gemini / ChatGPT and populate form in 1 click"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>1-Click Paste &amp; Apply</span>
              </button>

              <button
                type="button"
                onClick={() => setMode("paste")}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-gray-800 hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-200 border border-slate-200 dark:border-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <ClipboardPaste className="w-3.5 h-3.5 text-indigo-500" />
                <span>Paste Code</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Paste Raw AI JSON Directly */}
      {mode === "paste" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-gray-300">
            <span className="font-semibold flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-indigo-600" />
              Paste AI-Generated Blog Article JSON:
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
              rows={6}
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
              placeholder={`Paste raw Blog JSON here...\n{\n  "title": { "en": "Top 10 Hidden Gems in Sri Lanka", "ja": "..." },\n  "author": "Ikisaki Travel Team",\n  "summary": { "en": "...", "ja": "..." },\n  "blog": { "en": "...", "ja": "..." }\n}`}
              className="w-full text-xs font-mono p-3.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-900 text-emerald-300 placeholder:text-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
            <p className="text-[11px] text-slate-400">
              Markdown fences (<code>```json</code>) are stripped automatically.
            </p>
            <button
              type="button"
              onClick={handleApplyPastedJson}
              disabled={!pastedJson.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Apply JSON to Blog</span>
            </button>
          </div>
        </div>
      )}

      {/* Executive Toast Notification */}
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
