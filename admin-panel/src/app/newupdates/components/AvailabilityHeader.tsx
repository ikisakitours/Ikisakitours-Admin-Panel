"use client";

import React from "react";
import {
  Calendar as CalendarIcon,
  Save,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Plus,
} from "lucide-react";

interface AvailabilityHeaderProps {
  noteLocale: string;
  availableLanguages: string[];
  onLocaleChange: (lang: string) => void;
  onAddLanguage: () => void;
  loading: boolean;
  saved: boolean;
  hasUnsavedChanges: boolean;
  onReload: () => void;
  onSave: () => void;
}

export default function AvailabilityHeader({
  noteLocale,
  availableLanguages,
  onLocaleChange,
  onAddLanguage,
  loading,
  saved,
  hasUnsavedChanges,
  onReload,
  onSave,
}: AvailabilityHeaderProps) {
  return (
    <div className="flex flex-col gap-3 pb-5 border-b border-slate-100">
      {/* Top Header Block: Icon + Full Width Title & Paragraph */}
      <div className="flex items-start gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-xs shrink-0 mt-0.5">
          <CalendarIcon className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Tour Date Availability &amp; Booking Controls
          </h2>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Select a date on the calendar to configure closed tour types (multiday, one-day, custom, charter, transfer) and special notes across dynamic languages.
          </p>
        </div>
      </div>

      {/* Buttons & Actions placed below paragraph, aligned to the right */}
      <div className="flex items-center justify-end gap-2.5 w-full flex-wrap">
        {/* Dynamic Language Switcher (matches LegalDocEditor & PackageFormWrapper) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap">
          {availableLanguages.map((langKey) => (
            <button
              key={langKey}
              type="button"
              onClick={() => onLocaleChange(langKey)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all uppercase cursor-pointer ${
                noteLocale === langKey
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

        {/* Reload from server */}
        <button
          type="button"
          onClick={onReload}
          disabled={loading}
          className="flex items-center justify-center w-9 h-9 border border-slate-200 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-slate-800 transition-all cursor-pointer disabled:opacity-50 shadow-xs"
          title="Reload from Server"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
        </button>

        {/* Save Changes Button */}
        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60 ${
            saved
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : hasUnsavedChanges
              ? "bg-indigo-600 hover:bg-indigo-700 text-white ring-2 ring-amber-400 ring-offset-2"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving...
            </>
          ) : saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" /> Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Changes
              {hasUnsavedChanges && (
                <span
                  className="w-2 h-2 rounded-full bg-amber-400 shrink-0"
                  title="Unsaved changes pending"
                />
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
