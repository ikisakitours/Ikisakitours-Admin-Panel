"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  MONTHS,
  YEARS,
  TOUR_TYPES,
  DateConfig,
  getTourTypesForDate,
} from "./availability.constants";

interface AvailabilityCalendarProps {
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  closedDates: string[];
  dateDetails: Record<string, DateConfig>;
  selectedDate: string | null;
  onSelectDay: (dayNum: number) => void;
}

export default function AvailabilityCalendar({
  currentMonth,
  currentYear,
  onMonthChange,
  onYearChange,
  onPrevMonth,
  onNextMonth,
  closedDates,
  dateDetails,
  selectedDate,
  onSelectDay,
}: AvailabilityCalendarProps) {
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const formatDateString = (day: number) => {
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${currentYear}-${m}-${d}`;
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const startDay = getFirstDayOfMonth(currentMonth, currentYear);

  return (
    <div className="bg-slate-50/70 border border-slate-200 p-5 rounded-2xl space-y-4">
      {/* Month & Year Navigation */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onPrevMonth}
            className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-600 transition-all cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-600 transition-all cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-slate-800 ml-1">
            {MONTHS[currentMonth]} {currentYear}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={currentMonth}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {MONTHS.map((m, idx) => (
              <option key={m} value={idx}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={currentYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Days of Week */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((d) => (
          <span key={d} className="text-[11px] font-bold text-slate-400">
            {d}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`blank-${i}`} className="h-[52px]" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const formatted = formatDateString(dayNum);
          const isClosed = closedDates.includes(formatted);
          const isSelected = selectedDate === formatted;
          const config = dateDetails[formatted];
          const types = getTourTypesForDate(config);
          const matchedTypes = TOUR_TYPES.filter((t) => types.includes(t.value));

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => onSelectDay(dayNum)}
              className={`min-h-[52px] py-1.5 px-1 rounded-xl flex flex-col items-center justify-between text-xs font-semibold transition-all relative cursor-pointer ${
                isSelected
                  ? "ring-2 ring-indigo-600 ring-offset-2 z-10 bg-indigo-50/40 border-indigo-400"
                  : isClosed
                  ? "bg-slate-50 hover:bg-white border-slate-300 hover:border-indigo-400 shadow-2xs"
                  : "bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-600 border border-slate-200 shadow-2xs"
              }`}
            >
              {/* Optional Note indicator (amber dot at top-left) */}
              {Boolean(
                config?.notes
                  ? Object.values(config.notes).some(Boolean)
                  : config?.note
              ) && (
                <span
                  className="absolute top-1 left-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 ring-1 ring-white"
                  title="Special Note attached"
                />
              )}

              {/* Day Number */}
              <span
                className={`text-xs font-bold leading-tight ${
                  isClosed ? "text-slate-900" : "text-slate-700"
                }`}
              >
                {dayNum}
              </span>

              {/* Restriction Color Dots (clearly visible row underneath the date number) */}
              {isClosed ? (
                <div className="flex items-center justify-center gap-1 flex-wrap w-full min-h-[10px] pb-0.5 px-0.5">
                  {types.includes("all") ? (
                    <span
                      className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-500 text-white shadow-2xs tracking-wider"
                      title="All Tours & Services Closed"
                    >
                      ALL
                    </span>
                  ) : (
                    matchedTypes.map((mt) => (
                      <span
                        key={mt.value}
                        className={`w-2 h-2 rounded-full ${mt.dotColor} ring-1 ring-white shadow-2xs shrink-0`}
                        title={mt.label}
                      />
                    ))
                  )}
                </div>
              ) : (
                <div className="min-h-[10px]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar Legend & Tour Type Color Indicators */}
      <div className="pt-3 border-t border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
            Status Legend &amp; Color Identifiers
          </span>
          <span className="text-[10px] text-slate-400">Synced to Client UI</span>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-600 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-100 border border-slate-300" />
            <span className="font-medium text-slate-700">Available</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full border-2 border-indigo-600" />
            <span className="font-medium text-slate-700">Selected Date</span>
          </div>

          {TOUR_TYPES.map((t) => (
            <div
              key={t.value}
              className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-2xs"
            >
              <span className={`w-2 h-2 rounded-full ${t.dotColor}`} />
              <span className="font-medium text-slate-700 text-[10px]">
                {t.label.split("(")[0].trim()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
