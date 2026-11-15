"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import {
  TOUR_TYPES,
  DateConfig,
  getTourTypesForDate,
} from "./availability.constants";

interface ClosedDatesListProps {
  closedDates: string[];
  dateDetails: Record<string, DateConfig>;
  selectedDate: string | null;
  noteLocale: string;
  onSelectDate: (date: string) => void;
  onRemoveDate: (date: string) => void;
}

export default function ClosedDatesList({
  closedDates,
  dateDetails,
  selectedDate,
  noteLocale,
  onSelectDate,
  onRemoveDate,
}: ClosedDatesListProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Configured Closed Dates ({closedDates.length})
        </h4>
        {closedDates.length > 0 && (
          <span className="text-[11px] text-slate-400 font-medium">
            Sorted by date
          </span>
        )}
      </div>

      <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1">
        {closedDates.length === 0 ? (
          <p className="text-xs text-slate-400 italic p-3 bg-slate-50 rounded-xl text-center">
            No closed dates configured. All calendar dates are currently open for booking.
          </p>
        ) : (
          closedDates.map((date) => {
            const detail = dateDetails[date];
            const types = getTourTypesForDate(detail);
            const matchedTypes = TOUR_TYPES.filter((t) => types.includes(t.value));
            const isCurrent = selectedDate === date;

            return (
              <div
                key={date}
                onClick={() => onSelectDate(date)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-2 ${
                  isCurrent
                    ? "bg-indigo-50/40 border-indigo-300 ring-1 ring-indigo-200 shadow-2xs"
                    : "bg-white hover:bg-slate-50 border-slate-200 shadow-2xs"
                }`}
              >
                {/* 1. Top Row: Date, Service Count & Delete Button */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {date}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({types.includes("all") ? "Full Day Closed" : `${types.length} service${types.length > 1 ? "s" : ""} closed`})
                    </span>
                    {isCurrent && (
                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 uppercase tracking-wider">
                        Active
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveDate(date);
                    }}
                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Remove restriction"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 2. Middle Row: Closed Tour Service Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {types.includes("all") ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border bg-rose-50 text-rose-800 border-rose-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                      <span>All Tours &amp; Services (Full Day Closed)</span>
                    </span>
                  ) : (
                    matchedTypes.map((mt) => (
                      <span
                        key={mt.value}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${mt.badgeColor}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${mt.dotColor}`}
                        />
                        <span>{mt.label.split("(")[0].trim()}</span>
                      </span>
                    ))
                  )}
                </div>

                {/* 3. Bottom Row: Multilingual Note (if present) */}
                {detail && (detail.notes || detail.note) && (() => {
                  const noteText = detail.notes
                    ? detail.notes[noteLocale] ||
                      detail.notes["en"] ||
                      Object.values(detail.notes).find(Boolean) ||
                      detail.note
                    : detail.note;
                  if (!noteText) return null;

                  const filledLangs = detail.notes
                    ? Object.keys(detail.notes).filter((k) =>
                        detail.notes?.[k]?.trim()
                      )
                    : [];

                  return (
                    <div className="text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-amber-700 font-bold text-[10px] mr-1.5 uppercase tracking-wider">
                          Note ({noteLocale.toUpperCase()}):
                        </span>
                        <span className="text-slate-700 font-medium break-words">
                          {noteText}
                        </span>
                      </div>
                      {filledLangs.length > 0 && (
                        <div className="flex items-center gap-1 shrink-0 mt-0.5">
                          {filledLangs.map((lang) => (
                            <span
                              key={lang}
                              className={`text-[9px] px-1 py-0.2 rounded font-mono uppercase font-bold ${
                                lang === noteLocale
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-slate-200 text-slate-600"
                              }`}
                            >
                              {lang}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
