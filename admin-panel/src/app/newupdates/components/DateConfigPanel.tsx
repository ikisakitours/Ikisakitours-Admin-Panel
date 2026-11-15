"use client";

import React from "react";
import {
  Calendar as CalendarIcon,
  Check,
  CheckSquare,
  FileText,
  Trash2,
  AlertCircle,
  Plus,
  X,
} from "lucide-react";
import { TOUR_TYPES } from "./availability.constants";

interface DateConfigPanelProps {
  selectedDate: string | null;
  isSelectedDateClosed: boolean;
  selectedTourTypes: string[];
  onToggleTourType: (typeValue: string) => void;
  onSelectAllTourTypes: () => void;
  selectedNotes: Record<string, string>;
  onNotesChange: (notes: Record<string, string>) => void;
  noteLocale: string;
  availableLanguages: string[];
  onLocaleChange: (lang: string) => void;
  onAddLanguage: () => void;
  onApply: () => void;
  onRemove: () => void;
  onClose: () => void;
}

export default function DateConfigPanel({
  selectedDate,
  isSelectedDateClosed,
  selectedTourTypes,
  onToggleTourType,
  onSelectAllTourTypes,
  selectedNotes,
  onNotesChange,
  noteLocale,
  availableLanguages,
  onLocaleChange,
  onAddLanguage,
  onApply,
  onRemove,
  onClose,
}: DateConfigPanelProps) {
  if (!selectedDate) {
    return (
      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400">
        <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
        <p className="text-xs font-semibold text-slate-600">
          Click on any date on the calendar
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Select a date to set its tour type and special note.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-sm space-y-4">
      {/* Date Header & Status */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
            Selected Date Configuration
          </span>
          <h3 className="text-sm font-bold text-slate-900 mt-0.5">
            {selectedDate}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
              isSelectedDateClosed
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {isSelectedDateClosed ? "🔴 Restricted" : "🟢 Available"}
          </span>

          {/* Close Panel Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            title="Close date configuration"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Multi-Select Tour Services (Select Multiple Tour Types) */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
            Closed Tour Services (Select Multiple) *
          </label>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onSelectAllTourTypes}
              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
            >
              {selectedTourTypes.length === TOUR_TYPES.length
                ? "Deselect All"
                : "Select All"}
            </button>
            <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              {selectedTourTypes.length} Selected
            </span>
          </div>
        </div>

        <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
          {TOUR_TYPES.map((type) => {
            const isSelected = selectedTourTypes.includes(type.value);
            return (
              <div
                key={type.value}
                onClick={() => onToggleTourType(type.value)}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all select-none ${
                  isSelected
                    ? "bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-200 shadow-2xs"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600 shadow-2xs"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {/* Checkbox Icon Indicator */}
                  <div
                    className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                      isSelected
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-2xs"
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <span className={`w-2 h-2 rounded-full shrink-0 ${type.dotColor}`} />
                  <span
                    className={`truncate text-xs ${
                      isSelected ? "font-bold text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {type.label}
                  </span>
                </div>

                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 border ml-2 ${
                    isSelected ? type.badgeColor : "text-slate-400 border-transparent"
                  }`}
                >
                  {isSelected ? "Closed" : "Open"}
                </span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          Tick each tour service that is unavailable on this date.
        </p>
      </div>

      {/* 2. Special Note Box (Multilingual) */}
      <div>
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
          <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-indigo-500" />
            Special Note / Reason ({noteLocale.toUpperCase()})
          </label>

          {/* Dynamic Language Switcher (matches LegalDocEditor & PackageFormWrapper) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap">
            {availableLanguages.map((langKey) => (
              <button
                key={langKey}
                type="button"
                onClick={() => onLocaleChange(langKey)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all uppercase cursor-pointer ${
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
              className="p-1 text-slate-500 hover:text-indigo-600 text-xs flex items-center gap-0.5 font-semibold cursor-pointer"
              title="Add new language code"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <textarea
          rows={2}
          value={selectedNotes[noteLocale] || ""}
          onChange={(e) =>
            onNotesChange({
              ...selectedNotes,
              [noteLocale]: e.target.value,
            })
          }
          placeholder={
            noteLocale === "ja"
              ? "例: ポヤデーの祝日 / 満席 / ドライバー不足のため終日休業"
              : "e.g. Poya Day Holiday / Fully Booked / No Drivers Available"
          }
          className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 transition-all resize-none"
        />

        <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
          <span>
            {noteLocale === "ja"
              ? "日本語 (JA) で理由を入力中"
              : `Editing reason in ${noteLocale.toUpperCase()}`}
          </span>
          <span className="font-mono">
            {Object.entries(selectedNotes).filter(([_, v]) => v?.trim()).length} /{" "}
            {availableLanguages.length} lang(s) filled
          </span>
        </div>
      </div>

      {/* Action Buttons for Selected Date */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={onApply}
          className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer text-center"
        >
          {isSelectedDateClosed ? "Update Restriction" : "Mark as Closed"}
        </button>

        {isSelectedDateClosed && (
          <button
            type="button"
            onClick={onRemove}
            className="py-2 px-3 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-bold rounded-xl border border-slate-200 hover:border-red-200 transition-all cursor-pointer flex items-center gap-1"
            title="Make this date available"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        )}
      </div>

      {/* Important save reminder note directly below action buttons */}
      <div className="flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed mt-2 shadow-2xs">
        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
        <div className="space-y-0.5 text-[11px]">
          <p className="font-bold text-amber-900">
            Remember to click Save Changes after editing.
          </p>
          <p className="text-[10px] text-amber-700 leading-normal">
            Any change made here (such as clicking{" "}
            <strong>
              {isSelectedDateClosed ? "Update Restriction" : "Mark as Closed"}
            </strong>{" "}
            or removing a date) will only be permanently stored in the database
            once you click <strong>Save Changes</strong> at the top.
          </p>
        </div>
      </div>
    </div>
  );
}
