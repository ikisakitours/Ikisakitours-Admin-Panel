"use client";

import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import {
  availabilityService,
  AvailabilityPayload,
  DateDetailItem,
} from "@/services/availability.service";
import {
  TOUR_TYPES,
  MONTHS,
  YEARS,
  DateConfig,
  getTourTypesForDate,
} from "./availability.constants";
import AvailabilityHeader from "./AvailabilityHeader";
import AvailabilityCalendar from "./AvailabilityCalendar";
import DateConfigPanel from "./DateConfigPanel";
import ClosedDatesList from "./ClosedDatesList";

// Re-export constants & types for backwards compatibility
export { TOUR_TYPES, MONTHS, YEARS };
export type { DateConfig };

export default function AvailabilityManager() {
  const [currentMonth, setCurrentMonth] = useState(10); // November (0-indexed: 10)
  const [currentYear, setCurrentYear] = useState(2026);

  const [closedDates, setClosedDates] = useState<string[]>([]);
  const [dateDetails, setDateDetails] = useState<Record<string, DateConfig>>({});

  // Dynamic language management (matches LegalDocManager, PackageFormWrapper & FaqForm)
  const [noteLocale, setNoteLocale] = useState<string>("en");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(["en", "ja"]);

  // Selected date on calendar for editing in the side panel
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTourTypes, setSelectedTourTypes] = useState<string[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<Record<string, string>>({ en: "", ja: "" });

  // Loading & Saving states
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Discover languages present in dateDetails
  const discoverLanguages = (details: Record<string, DateConfig>) => {
    const discovered = new Set<string>(["en", "ja"]);
    Object.values(details || {}).forEach((item) => {
      if (item.notes && typeof item.notes === "object") {
        Object.keys(item.notes).forEach((k) => {
          if (k.trim()) discovered.add(k.trim().toLowerCase());
        });
      }
    });
    setAvailableLanguages(Array.from(discovered));
  };

  const addCustomLanguage = () => {
    const lang = prompt("Enter new language code (e.g. fr, de, es, zh, it):")?.toLowerCase().trim();
    if (lang && !availableLanguages.includes(lang)) {
      setAvailableLanguages((prev) => [...prev, lang]);
      setNoteLocale(lang);
    }
  };

  // Fetch existing availability on component mount
  const loadAvailability = async () => {
    setFetching(true);
    setErrorMessage(null);
    try {
      const data = await availabilityService.getAvailability();
      if (data) {
        if (Array.isArray(data.apiClosedDates)) {
          setClosedDates(data.apiClosedDates);
        }
        if (data.dateDetails) {
          setDateDetails(data.dateDetails);
          discoverLanguages(data.dateDetails as Record<string, DateConfig>);
        }
      }
      setHasUnsavedChanges(false);
    } catch (err: any) {
      console.error("Failed to load availability:", err);
      setErrorMessage(err.message || "Failed to load availability from server.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  // When selectedDate changes, populate the form
  useEffect(() => {
    if (selectedDate) {
      const existing = dateDetails[selectedDate];
      if (existing) {
        const types = getTourTypesForDate(existing);
        setSelectedTourTypes(types.length > 0 ? types : ["all"]);

        if (existing.notes && typeof existing.notes === "object") {
          setSelectedNotes({ en: "", ja: "", ...existing.notes });
        } else if (existing.note) {
          setSelectedNotes({ en: existing.note, ja: "" });
        } else {
          setSelectedNotes({ en: "", ja: "" });
        }
      } else {
        setSelectedTourTypes([]);
        setSelectedNotes({ en: "", ja: "" });
      }
    }
  }, [selectedDate, dateDetails]);

  // Toggle individual or all tour services for the selected date
  const toggleTourType = (typeValue: string) => {
    if (typeValue === "all") {
      if (selectedTourTypes.includes("all")) {
        setSelectedTourTypes([]);
      } else {
        setSelectedTourTypes(TOUR_TYPES.map((t) => t.value));
      }
      return;
    }

    setSelectedTourTypes((prev) => {
      let updated: string[];
      if (prev.includes(typeValue)) {
        updated = prev.filter((t) => t !== typeValue && t !== "all");
      } else {
        updated = [...prev.filter((t) => t !== "all"), typeValue];
        const nonAllTypes = TOUR_TYPES.filter((t) => t.value !== "all").map((t) => t.value);
        if (nonAllTypes.every((t) => updated.includes(t))) {
          updated = ["all", ...nonAllTypes];
        }
      }
      return updated;
    });
  };

  const handleSelectAllTourTypes = () => {
    if (selectedTourTypes.length === TOUR_TYPES.length) {
      setSelectedTourTypes([]);
    } else {
      setSelectedTourTypes(TOUR_TYPES.map((t) => t.value));
    }
  };

  // Selecting a day on calendar opens it in configuration panel
  const handleSelectDay = (dayNum: number) => {
    const m = String(currentMonth + 1).padStart(2, "0");
    const d = String(dayNum).padStart(2, "0");
    const formatted = `${currentYear}-${m}-${d}`;
    setSelectedDate(formatted);
  };

  // Apply or update restriction on the selected date
  const handleApplyRestriction = () => {
    if (!selectedDate) return;

    if (selectedTourTypes.length === 0) {
      handleRemoveRestriction(selectedDate);
      return;
    }

    if (!closedDates.includes(selectedDate)) {
      setClosedDates((prev) => [...prev, selectedDate].sort());
    }

    const matchedTypes = TOUR_TYPES.filter((t) => selectedTourTypes.includes(t.value));
    const primary = matchedTypes[0] || TOUR_TYPES[0];

    const currentNoteString =
      selectedNotes[noteLocale] ||
      selectedNotes["en"] ||
      Object.values(selectedNotes).find(Boolean) ||
      "";

    const cleanedNotes: Record<string, string> = {};
    Object.entries(selectedNotes).forEach(([k, v]) => {
      if (v?.trim()) cleanedNotes[k] = v.trim();
    });

    setDateDetails((prev) => ({
      ...prev,
      [selectedDate]: {
        tourType: selectedTourTypes.includes("all") ? "all" : selectedTourTypes.join(", "),
        tourTypes: selectedTourTypes,
        color: primary.color,
        colors: matchedTypes.map((t) => t.color),
        hex: primary.hex,
        hexes: matchedTypes.map((t) => t.hex),
        note: currentNoteString,
        notes: cleanedNotes,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Remove restriction (make date available again)
  const handleRemoveRestriction = (dateToRemove?: string) => {
    const target = dateToRemove || selectedDate;
    if (!target) return;

    setClosedDates((prev) => prev.filter((d) => d !== target));
    setDateDetails((prev) => {
      const copy = { ...prev };
      delete copy[target];
      return copy;
    });

    if (selectedDate === target) {
      setSelectedTourTypes([]);
      setSelectedNotes({ en: "", ja: "" });
    }
    setHasUnsavedChanges(true);
  };

  // Month navigation helpers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const closedDateDetails: DateDetailItem[] = closedDates.map((date) => {
        const detail = dateDetails[date];
        const types = getTourTypesForDate(detail);
        const matchedTypes = TOUR_TYPES.filter((t) => types.includes(t.value));
        const primary = matchedTypes[0] || TOUR_TYPES[0];

        const noteString = detail?.notes
          ? detail.notes[noteLocale] || detail.notes["en"] || Object.values(detail.notes).find(Boolean) || detail?.note || ""
          : detail?.note || "";

        return {
          date,
          tourType: types.includes("all") ? "all" : types.join(", "),
          tourTypes: types,
          color: primary.color,
          colors: matchedTypes.map((t) => t.color),
          hex: primary.hex,
          hexes: matchedTypes.map((t) => t.hex),
          note: noteString,
          notes: detail?.notes || (detail?.note ? { en: detail.note } : {}),
        };
      });

      const payload: AvailabilityPayload = {
        apiClosedDates: closedDates,
        dateDetails,
        closedDateDetails,
      };

      await availabilityService.updateAvailability(payload);
      setSaved(true);
      setHasUnsavedChanges(false);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not save availability changes.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
        <div className="flex items-center justify-center gap-2.5 text-xs font-semibold text-slate-600">
          <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
          <span>Loading calendar availability...</span>
        </div>
      </div>
    );
  }

  const isSelectedDateClosed = selectedDate ? closedDates.includes(selectedDate) : false;

  return (
    <div className="w-full space-y-5">
      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-600 hover:text-red-800 text-[11px] font-bold cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Card Container */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {/* Top Header Bar */}
        <AvailabilityHeader
          noteLocale={noteLocale}
          availableLanguages={availableLanguages}
          onLocaleChange={setNoteLocale}
          onAddLanguage={addCustomLanguage}
          loading={loading}
          saved={saved}
          hasUnsavedChanges={hasUnsavedChanges}
          onReload={loadAvailability}
          onSave={handleSave}
        />

        {/* Main Two-Column Layout: Calendar (Left) & Date Config / List (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
          {/* Left Column: Calendar Grid */}
          <div className="lg:col-span-7">
            <AvailabilityCalendar
              currentMonth={currentMonth}
              currentYear={currentYear}
              onMonthChange={setCurrentMonth}
              onYearChange={setCurrentYear}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              closedDates={closedDates}
              dateDetails={dateDetails}
              selectedDate={selectedDate}
              onSelectDay={handleSelectDay}
            />
          </div>

          {/* Right Column: Selected Date Control & Configured Dates List */}
          <div className="lg:col-span-5 space-y-5">
            <DateConfigPanel
              selectedDate={selectedDate}
              isSelectedDateClosed={isSelectedDateClosed}
              selectedTourTypes={selectedTourTypes}
              onToggleTourType={toggleTourType}
              onSelectAllTourTypes={handleSelectAllTourTypes}
              selectedNotes={selectedNotes}
              onNotesChange={setSelectedNotes}
              noteLocale={noteLocale}
              availableLanguages={availableLanguages}
              onLocaleChange={setNoteLocale}
              onAddLanguage={addCustomLanguage}
              onApply={handleApplyRestriction}
              onRemove={() => handleRemoveRestriction()}
              onClose={() => setSelectedDate(null)}
            />

            <ClosedDatesList
              closedDates={closedDates}
              dateDetails={dateDetails}
              selectedDate={selectedDate}
              noteLocale={noteLocale}
              onSelectDate={setSelectedDate}
              onRemoveDate={handleRemoveRestriction}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
