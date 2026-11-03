"use client";

import React, { useState } from "react";
import { PackageFormData } from "../../types/package.types";
import { Upload, FileCode } from "lucide-react";

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
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Helper to dynamically extract language keys from translation record objects
  const extractLanguages = (data: any): string[] => {
    const langs = new Set<string>();
    const findLangs = (obj: any) => {
      if (obj && typeof obj === "object" && !Array.isArray(obj)) {
        const keys = Object.keys(obj);
        // If keys look like language codes (e.g. 'en', 'ja', 'fr', etc.)
        if (keys.length > 0 && keys.every((k) => k.length <= 5)) {
          keys.forEach((k) => langs.add(k));
        }
        Object.values(obj).forEach((val) => findLangs(val));
      }
    };
    findLangs(data);
    return langs.size > 0 ? Array.from(langs) : ["en"];
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        applyJsonData(parsed);
      } catch (err) {
        setError("Invalid JSON file format.");
      }
    };
    reader.readAsText(file);
  };

  const applyJsonData = (parsed: any) => {
    setError(null);
    try {
      // 1. Detect languages dynamically from uploaded data
      const detectedLangs = extractLanguages(parsed);
      setAvailableLanguages(detectedLangs);
      if (!detectedLangs.includes(activeLang)) {
        setActiveLang(detectedLangs[0] || "en");
      }

      // 2. Populate form data state
      setFormData((prev) => ({
        ...prev,
        ...parsed,
      }));

      setSuccessMessage("JSON file successfully loaded and form populated!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError("Failed to apply JSON data to form.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 mb-6">
      <h2 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
        <FileCode className="w-4 h-4 text-indigo-500" /> JSON Package Uploader & Language Hub
      </h2>
      <p className="text-xs text-slate-500 mb-4">
        Upload a pre-formatted JSON file to instantly populate all multilingual fields. Languages will be detected dynamically.
      </p>

      {/* Dynamic Language Navigation Bar */}
      <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-slate-700">Active Form Language:</span>
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                activeLang === lang
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Detected: {availableLanguages.map((l) => l.toUpperCase()).join(", ")}
        </div>
      </div>

      {/* Streamlined File Upload Box */}
      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-indigo-500 transition-colors bg-slate-50/50">
        <label className="cursor-pointer block">
          <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
          <span className="text-xs font-bold text-slate-700 block mb-1">Click to upload JSON package file (.json)</span>
          <span className="text-[11px] text-slate-400 block mb-3">Select your structured multi-language JSON file</span>
          <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          <span className="inline-block px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-semibold hover:bg-indigo-100 transition-colors">
            Browse File
          </span>
        </label>
      </div>

      {error && <p className="mt-3 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg">{error}</p>}
      {successMessage && <p className="mt-3 text-xs text-emerald-600 bg-emerald-50 p-2.5 rounded-lg">{successMessage}</p>}
    </div>
  );
};