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

      <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
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
                className={`p-3 rounded-xl border transition-all cursor-pointer text-xs ${
                  isCurrent
                    ? "bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-200"
                    : "bg-white hover:bg-slate-50 border-slate-200 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    {date}
                  </span>

                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    <div className="flex items-center gap-1 flex-wrap justify-end">
                      {matchedTypes.map((mt) => (
                        <span
                          key={mt.value}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${mt.badgeColor}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${mt.dotColor}`}
                          />
                          <span>{mt.label.split("(")[0].trim()}</span>
                        </span>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveDate(date);
                      }}
                      className="p-1 hover:text-red-600 text-slate-400 transition-all rounded-md shrink-0"
                      title="Remove restriction"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

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
                    <div className="mt-1.5 text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-amber-600 font-bold shrink-0 text-[10px]">
                          Note ({noteLocale.toUpperCase()}):
                        </span>
                        {filledLangs.length > 0 && (
                          <div className="flex items-center gap-1">
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
                      <p className="truncate text-slate-700 font-medium">
                        {noteText}
                      </p>
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
