"use client";

import React, { useState } from "react";
import { PackageFormData } from "../../types/package.types";

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
  const [jsonInput, setJsonInput] = useState("");
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

  const handlePasteUpload = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      applyJsonData(parsed);
    } catch (err) {
      setError("Invalid JSON syntax in text box.");
    }
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

      setSuccessMessage("JSON successfully loaded and form populated!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError("Failed to apply JSON data to form.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
      <h2 className="text-xl font-bold text-gray-900 mb-2">📦 JSON Package Uploader & Language Hub</h2>
      <p className="text-sm text-gray-600 mb-4">
        Upload a JSON file or paste JSON data below. Languages will be detected dynamically to generate navigation buttons.
      </p>

      {/* Dynamic Language Navigation Bar */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-700">Active Form Language:</span>
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setActiveLang(lang)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeLang === lang
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-500 font-medium">
          Detected: {availableLanguages.map((l) => l.toUpperCase()).join(", ")}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* File Upload Box */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
          <label className="cursor-pointer block">
            <span className="text-sm font-medium text-gray-700 block mb-1">Upload JSON File (.json)</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
            <span className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-md text-xs font-semibold hover:bg-blue-100 transition-colors">
              Browse File
            </span>
          </label>
        </div>

        {/* Paste JSON Box */}
        <div className="flex flex-col gap-2">
          <textarea
            rows={3}
            placeholder="Or paste JSON string here..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full text-xs p-2 border border-gray-300 rounded-md font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handlePasteUpload}
            className="self-end px-4 py-1.5 bg-gray-900 text-white rounded-md text-xs font-semibold hover:bg-gray-800 transition-colors"
          >
            Load JSON
          </button>
        </div>
      </div>

      {error && <p className="mt-3 text-xs text-red-600 bg-red-50 p-2 rounded">{error}</p>}
      {successMessage && <p className="mt-3 text-xs text-green-600 bg-green-50 p-2 rounded">{successMessage}</p>}
    </div>
  );
};