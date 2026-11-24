"use client";

import React, { useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe,
  Hotel,
  Info,
  MapPin,
  Plane,
  Plus,
  Sparkles,
  Trash2,
  Users,
  Utensils,
} from "lucide-react";
import type {
  ItineraryCustomSection,
  ItineraryDay,
  ItineraryDocument,
  ItineraryFlight,
  ItineraryGuest,
  ItineraryLanguage,
} from "../types/itinerary.types";

interface ItineraryFormEditorProps {
  document: ItineraryDocument;
  onChange: (updated: ItineraryDocument) => void;
}

const MEAL_OPTIONS = ["HOTEL", "CLIENT", "NONE", "BOX MEAL", "RESTAURANT", "AIRPORT"];
const ROOM_TYPE_OPTIONS = ["1TWN", "1DBL", "1SGL", "2TWN", "2DBL", "FAMILY"];

export function ItineraryFormEditor({ document: doc, onChange }: ItineraryFormEditorProps) {
  const [activeSection, setActiveSection] = useState<string>("schedule");

  const updateDoc = (partial: Partial<ItineraryDocument>) => {
    onChange({
      ...doc,
      ...partial,
      updatedAt: new Date().toISOString(),
    });
  };

  const currentLang = doc.language || "en";
  const isJa = currentLang === "ja";

  // Toggle Language between English and Japanese
  const handleToggleLanguage = (newLang: ItineraryLanguage) => {
    if (newLang === currentLang) return;
    updateDoc({ language: newLang });
  };

  // --- GUEST HANDLERS ---
  const handleAddGuest = () => {
    const newGuest: ItineraryGuest = {
      id: `guest-${Date.now()}`,
      name: "NEW GUEST",
      roomType: "1TWN",
    };
    updateDoc({ guests: [...doc.guests, newGuest] });
  };

  const handleUpdateGuest = (id: string, partial: Partial<ItineraryGuest>) => {
    const updated = doc.guests.map((g) => (g.id === id ? { ...g, ...partial } : g));
    updateDoc({ guests: updated });
  };

  const handleDeleteGuest = (id: string) => {
    updateDoc({ guests: doc.guests.filter((g) => g.id !== id) });
  };

  // --- FLIGHT HANDLERS ---
  const handleAddFlight = () => {
    const newFlight: ItineraryFlight = {
      id: `flight-${Date.now()}`,
      type: "arrival",
      flightNo: "",
      route: "",
      date: "",
      time: "",
    };
    updateDoc({ flights: [...doc.flights, newFlight] });
  };

  const handleUpdateFlight = (id: string, partial: Partial<ItineraryFlight>) => {
    const updated = doc.flights.map((f) => (f.id === id ? { ...f, ...partial } : f));
    updateDoc({ flights: updated });
  };

  const handleDeleteFlight = (id: string) => {
    updateDoc({ flights: doc.flights.filter((f) => f.id !== id) });
  };

  // --- SCHEDULE HANDLERS (Multilingual Dynamic Switching) ---
  const handleAddDay = () => {
    const nextDayNum = doc.schedule.length + 1;
    const newDay: ItineraryDay = {
      id: `day-${Date.now()}`,
      dayNumber: nextDayNum,
      dateStr: isJa ? `${nextDayNum}日目` : `DAY ${nextDayNum}`,
      title: "",
      activities: [],
      scenicStops: [],
      bullets: [],
      hotelCheckIn: "",
      meals: {
        breakfast: "HOTEL",
        lunch: "CLIENT",
        dinner: "HOTEL",
      },
      rawEn: {
        dateStr: `DAY ${nextDayNum}`,
        title: "",
        activities: [],
        scenicStops: [],
        bullets: [],
        hotelCheckIn: "",
      },
      rawJa: {
        dateStr: `${nextDayNum}日目`,
        title: "",
        activities: [],
        scenicStops: [],
        bullets: [],
        hotelCheckIn: "",
      },
    };
    updateDoc({ schedule: [...doc.schedule, newDay] });
  };

  const handleUpdateDayField = (
    dayId: string,
    field: "dateStr" | "title" | "activities" | "scenicStops" | "bullets" | "hotelCheckIn",
    val: any
  ) => {
    const updated = doc.schedule.map((d) => {
      if (d.id !== dayId) return d;
      const clone = { ...d };

      if (isJa) {
        clone.rawJa = {
          dateStr: clone.rawJa?.dateStr ?? clone.dateStr,
          title: clone.rawJa?.title ?? clone.title,
          activities: clone.rawJa?.activities ?? clone.activities ?? [],
          scenicStops: clone.rawJa?.scenicStops ?? clone.scenicStops ?? [],
          bullets: clone.rawJa?.bullets ?? clone.bullets ?? [],
          hotelCheckIn: clone.rawJa?.hotelCheckIn ?? clone.hotelCheckIn,
          [field]: val,
        };
      } else {
        clone.rawEn = {
          dateStr: clone.rawEn?.dateStr ?? clone.dateStr,
          title: clone.rawEn?.title ?? clone.title,
          activities: clone.rawEn?.activities ?? clone.activities ?? [],
          scenicStops: clone.rawEn?.scenicStops ?? clone.scenicStops ?? [],
          bullets: clone.rawEn?.bullets ?? clone.bullets ?? [],
          hotelCheckIn: clone.rawEn?.hotelCheckIn ?? clone.hotelCheckIn,
          [field]: val,
        };
        (clone as any)[field] = val;
      }
      return clone;
    });
    updateDoc({ schedule: updated });
  };

  const handleUpdateDayMeals = (dayId: string, mealType: "breakfast" | "lunch" | "dinner", val: string) => {
    const updated = doc.schedule.map((d) => {
      if (d.id !== dayId) return d;
      return {
        ...d,
        meals: {
          ...d.meals,
          [mealType]: val,
        },
      };
    });
    updateDoc({ schedule: updated });
  };

  const handleDeleteDay = (id: string) => {
    const filtered = doc.schedule.filter((d) => d.id !== id);
    const renumbered = filtered.map((d, idx) => ({ ...d, dayNumber: idx + 1 }));
    updateDoc({ schedule: renumbered });
  };

  const handleMoveDay = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === doc.schedule.length - 1)
    ) {
      return;
    }
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const items = [...doc.schedule];
    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;
    const renumbered = items.map((d, idx) => ({ ...d, dayNumber: idx + 1 }));
    updateDoc({ schedule: renumbered });
  };

  // --- SECTION DELETE / RESTORE / CUSTOM SECTION HANDLERS ---
  const handleDeleteSection = (
    dayId: string,
    sectionKey: "activities" | "scenicStops" | "bullets"
  ) => {
    const updated = doc.schedule.map((day) => {
      if (day.id !== dayId) return day;
      const currentHidden = day.hiddenSections || [];
      const newHidden = currentHidden.includes(sectionKey)
        ? currentHidden
        : [...currentHidden, sectionKey];

      const clone = { ...day, hiddenSections: newHidden };
      if (sectionKey === "activities") {
        clone.activities = [];
        if (clone.rawEn) clone.rawEn.activities = [];
        if (clone.rawJa) clone.rawJa.activities = [];
      } else if (sectionKey === "scenicStops") {
        clone.scenicStops = [];
        if (clone.rawEn) clone.rawEn.scenicStops = [];
        if (clone.rawJa) clone.rawJa.scenicStops = [];
      } else if (sectionKey === "bullets") {
        clone.bullets = [];
        if (clone.rawEn) clone.rawEn.bullets = [];
        if (clone.rawJa) clone.rawJa.bullets = [];
      }
      return clone;
    });
    updateDoc({ schedule: updated });
  };

  const handleRestoreSection = (
    dayId: string,
    sectionKey: "activities" | "scenicStops" | "bullets"
  ) => {
    const updated = doc.schedule.map((day) => {
      if (day.id !== dayId) return day;
      const currentHidden = day.hiddenSections || [];
      const newHidden = currentHidden.filter((k) => k !== sectionKey);
      return { ...day, hiddenSections: newHidden };
    });
    updateDoc({ schedule: updated });
  };

  const handleAddCustomSection = (dayId: string) => {
    const updated = doc.schedule.map((day) => {
      if (day.id !== dayId) return day;
      const newSec: ItineraryCustomSection = {
        id: `csec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: "",
        description: "",
      };
      return {
        ...day,
        customSections: [...(day.customSections || []), newSec],
      };
    });
    updateDoc({ schedule: updated });
  };

  const handleUpdateCustomSection = (
    dayId: string,
    sectionId: string,
    field: "title" | "description",
    value: string
  ) => {
    const updated = doc.schedule.map((day) => {
      if (day.id !== dayId) return day;
      const sections = (day.customSections || []).map((sec) => {
        if (sec.id !== sectionId) return sec;
        if (isJa) {
          if (field === "title") return { ...sec, titleJa: value };
          if (field === "description") return { ...sec, descriptionJa: value };
        } else {
          if (field === "title") return { ...sec, title: value };
          if (field === "description") return { ...sec, description: value };
        }
        return sec;
      });
      return { ...day, customSections: sections };
    });
    updateDoc({ schedule: updated });
  };

  const handleDeleteCustomSection = (dayId: string, sectionId: string) => {
    const updated = doc.schedule.map((day) => {
      if (day.id !== dayId) return day;
      const sections = (day.customSections || []).filter((sec) => sec.id !== sectionId);
      return { ...day, customSections: sections };
    });
    updateDoc({ schedule: updated });
  };

  // --- REMARKS HANDLER (Preserves newlines while typing) ---
  const handleRemarksChange = (text: string) => {
    const lines = text.split("\n");
    if (isJa) {
      updateDoc({ remarksJa: lines });
    } else {
      updateDoc({ remarks: lines });
    }
  };

  const activeRemarks = isJa
    ? (doc.remarksJa && doc.remarksJa.length > 0 ? doc.remarksJa : [])
    : doc.remarks;

  return (
    <div className="w-full space-y-4">
      {/* ── TOP LANGUAGE & NAVIGATION BAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-xs">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 flex-1">
          {[
            { id: "metadata", label: "Tour Info", icon: Info },
            { id: "guests", label: `Guests (${doc.guests.length})`, icon: Users },
            { id: "flights", label: `Flights (${doc.flights.length})`, icon: Plane },
            { id: "schedule", label: `Schedule (${doc.schedule.length} Days)`, icon: Calendar },
            { id: "remarks", label: "Remarks", icon: FileText },
            { id: "company", label: "Branding", icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-emerald-700 shadow-xs border border-slate-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Language Switcher Pill (Point 02: Only (EN) and (JA)) */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => handleToggleLanguage("en")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentLang === "en"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            (EN)
          </button>
          <button
            type="button"
            onClick={() => handleToggleLanguage("ja")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              currentLang === "ja"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            (JA)
          </button>
        </div>
      </div>

      {/* ── 1. TOUR INFO SECTION ── */}
      {activeSection === "metadata" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-600" />
              Document &amp; Tour Metadata
            </h3>
            <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Editing: {currentLang.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Internal Document Title
              </label>
              <input
                type="text"
                value={doc.title}
                onChange={(e) => updateDoc({ title: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Document Reference Number
              </label>
              <input
                type="text"
                value={doc.referenceNo}
                onChange={(e) => updateDoc({ referenceNo: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Tour Package Title switches depending on language */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Tour Package Name {isJa ? "(JA)" : "(EN)"}
              </label>
              <input
                type="text"
                value={isJa ? (doc.tourNameJa || "") : doc.tourName}
                onChange={(e) => {
                  if (isJa) {
                    updateDoc({ tourNameJa: e.target.value });
                  } else {
                    updateDoc({ tourName: e.target.value });
                  }
                }}
                placeholder={isJa ? "e.g. Japanese Package Title" : "Classic Sri Lanka Tour"}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-black text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Tour Date Range switches depending on language */}
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Tour Date Range {isJa ? "(JA)" : "(EN)"}
              </label>
              <input
                type="text"
                value={isJa ? (doc.tourDatesJa || "") : doc.tourDates}
                onChange={(e) => {
                  if (isJa) {
                    updateDoc({ tourDatesJa: e.target.value });
                  } else {
                    updateDoc({ tourDates: e.target.value });
                  }
                }}
                placeholder={isJa ? "e.g. 3月12日 〜 3月18日" : "12-MAR to 18-MAR"}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── 2. GUESTS SECTION ── */}
      {activeSection === "guests" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                Guest Names &amp; Room Allocations
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Configure guest names, party count, and room configurations (Twin, Double, Single).
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddGuest}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Guest
            </button>
          </div>

          <div className="space-y-2.5">
            {doc.guests.map((guest, idx) => (
              <div
                key={guest.id}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/50"
              >
                <span className="text-xs font-extrabold text-slate-400 w-5 text-center">
                  {idx + 1}
                </span>
                <input
                  type="text"
                  placeholder="Guest Name (e.g. MR. HIRAI TATSUYA)"
                  value={guest.name}
                  onChange={(e) => handleUpdateGuest(guest.id, { name: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs font-black uppercase text-slate-900 bg-white focus:outline-none focus:border-emerald-500"
                />
                <select
                  aria-label="Room Type"
                  value={guest.roomType}
                  onChange={(e) => handleUpdateGuest(guest.id, { roomType: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-800 bg-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {ROOM_TYPE_OPTIONS.map((rt) => (
                    <option key={rt} value={rt}>
                      {rt}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleDeleteGuest(guest.id)}
                  aria-label="Delete guest"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. FLIGHTS SECTION ── */}
      {activeSection === "flights" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Plane className="w-4 h-4 text-emerald-600" />
                Inbound &amp; Outbound Flight Schedules
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Provide airline flight numbers, transit routes, and scheduled times.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddFlight}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Flight
            </button>
          </div>

          <div className="space-y-2.5">
            {doc.flights.map((flight) => (
              <div
                key={flight.id}
                className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 items-center text-xs"
              >
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Flight No</label>
                  <input
                    type="text"
                    value={flight.flightNo}
                    onChange={(e) => handleUpdateFlight(flight.id, { flightNo: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Route</label>
                  <input
                    type="text"
                    value={flight.route}
                    onChange={(e) => handleUpdateFlight(flight.id, { route: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Date</label>
                  <input
                    type="text"
                    value={flight.date}
                    onChange={(e) => handleUpdateFlight(flight.id, { date: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Time</label>
                  <input
                    type="text"
                    value={flight.time}
                    onChange={(e) => handleUpdateFlight(flight.id, { time: e.target.value })}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono bg-white"
                  />
                </div>
                <div className="flex items-center justify-end pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => handleDeleteFlight(flight.id)}
                    aria-label="Delete flight"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 4. DAILY SCHEDULE SECTION (Multilingual Language Switching) ── */}
      {activeSection === "schedule" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                Daily Itinerary Schedule ({doc.schedule.length} Days)
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Editing in <span className="font-bold text-emerald-700">{isJa ? "Japanese (JA)" : "English (EN)"}</span>. Switch language pill above to view/edit the other language.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddDay}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer self-start sm:self-center"
            >
              <Plus className="w-4 h-4" />
              Add Day
            </button>
          </div>

          <div className="space-y-4">
            {doc.schedule.map((day, idx) => {
              // Dynamically display language-specific values
              const currentTitle = isJa ? (day.rawJa?.title ?? day.title) : (day.rawEn?.title ?? day.title);
              const currentDateStr = isJa ? (day.rawJa?.dateStr ?? day.dateStr) : (day.rawEn?.dateStr ?? day.dateStr);
              const currentActivities = isJa
                ? (day.rawJa?.activities ?? day.activities ?? [])
                : (day.rawEn?.activities ?? day.activities ?? []);
              const currentScenicStops = isJa
                ? (day.rawJa?.scenicStops ?? day.scenicStops ?? [])
                : (day.rawEn?.scenicStops ?? day.scenicStops ?? []);
              const currentBullets = isJa
                ? (day.rawJa?.bullets ?? day.bullets ?? [])
                : (day.rawEn?.bullets ?? day.bullets ?? []);
              const currentHotel = isJa
                ? (day.rawJa?.hotelCheckIn ?? (day.hotelCheckIn || ""))
                : (day.rawEn?.hotelCheckIn ?? (day.hotelCheckIn || ""));

              const isActivitiesHidden = day.hiddenSections?.includes("activities");
              const isScenicHidden = day.hiddenSections?.includes("scenicStops");
              const isBulletsHidden = day.hiddenSections?.includes("bullets");

              return (
                <div
                  key={day.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-3 shadow-2xs"
                >
                  {/* Header row: Day #, Date, Heading, Reorder, Delete */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
                    <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-extrabold shrink-0">
                        D{day.dayNumber}
                      </span>
                      <input
                        type="text"
                        placeholder={isJa ? "e.g. 3月12日 (木)" : "e.g. 12TH MAR (THU)"}
                        value={currentDateStr}
                        onChange={(e) => handleUpdateDayField(day.id, "dateStr", e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono font-bold text-xs text-slate-900 w-44"
                      />
                      <input
                        type="text"
                        placeholder="Day Heading / Destinations"
                        value={currentTitle}
                        onChange={(e) => handleUpdateDayField(day.id, "title", e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-bold text-xs text-slate-900"
                      />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveDay(idx, "up")}
                        aria-label="Move day up"
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === doc.schedule.length - 1}
                        onClick={() => handleMoveDay(idx, "down")}
                        aria-label="Move day down"
                        className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDay(day.id)}
                        aria-label="Delete day"
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 1. Activities (With Trash Icon to delete) */}
                  {!isActivitiesHidden && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-extrabold uppercase text-emerald-800 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Activities (One item per line)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(day.id, "activities")}
                          title="Delete Activities"
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={currentActivities.join("\n")}
                        onChange={(e) =>
                          handleUpdateDayField(
                            day.id,
                            "activities",
                            e.target.value.split("\n")
                          )
                        }
                        placeholder="Enter activities, one per line"
                        className="w-full p-2.5 rounded-xl border border-emerald-200 bg-white text-xs text-slate-800 leading-relaxed font-sans focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* 2. Scenic Stops (With Trash Icon to delete) */}
                  {!isScenicHidden && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-extrabold uppercase text-indigo-800 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Scenic Stops &amp; Viewpoints (One item per line)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(day.id, "scenicStops")}
                          title="Delete Scenic Stops & Viewpoints"
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={currentScenicStops.join("\n")}
                        onChange={(e) =>
                          handleUpdateDayField(
                            day.id,
                            "scenicStops",
                            e.target.value.split("\n")
                          )
                        }
                        placeholder="Enter scenic stops or viewpoints, one per line"
                        className="w-full p-2.5 rounded-xl border border-indigo-200 bg-white text-xs text-slate-800 leading-relaxed font-sans focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {/* 3. Tour Highlights / Day Notes (With Trash Icon to delete) */}
                  {!isBulletsHidden && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[10px] font-extrabold uppercase text-slate-600 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-slate-500" />
                          <span>Tour Highlights &amp; Notes (One bullet point per line)</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDeleteSection(day.id, "bullets")}
                          title="Delete Tour Highlights & Notes"
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={2}
                        value={currentBullets.join("\n")}
                        onChange={(e) =>
                          handleUpdateDayField(
                            day.id,
                            "bullets",
                            e.target.value.split("\n")
                          )
                        }
                        placeholder="Enter tour highlights, one bullet per line"
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 leading-relaxed font-sans focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  )}

                  {/* 4. Custom Sections (Title + Description + Trash Icon) */}
                  {(day.customSections || []).map((sec, sIdx) => {
                    const currentTitle = isJa ? (sec.titleJa ?? sec.title) : sec.title;
                    const currentDesc = isJa ? (sec.descriptionJa ?? sec.description) : sec.description;

                    return (
                      <div
                        key={sec.id}
                        className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase text-amber-800 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>Custom Section #{sIdx + 1} {isJa ? "(JA)" : "(EN)"}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCustomSection(day.id, sec.id)}
                            title="Delete this custom section"
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Section Title (Optional)
                          </label>
                          <input
                            type="text"
                            value={currentTitle}
                            onChange={(e) =>
                              handleUpdateCustomSection(day.id, sec.id, "title", e.target.value)
                            }
                            placeholder="e.g. Special Instructions, Optional Excursions"
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-600 mb-1">
                            Description (One bullet point per line)
                          </label>
                          <textarea
                            rows={2}
                            value={currentDesc}
                            onChange={(e) =>
                              handleUpdateCustomSection(day.id, sec.id, "description", e.target.value)
                            }
                            placeholder="Enter description points, one bullet per line..."
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs text-slate-800 leading-relaxed font-sans focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Section Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                    <button
                      type="button"
                      onClick={() => handleAddCustomSection(day.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-600" />
                      <span>Add Custom Section</span>
                    </button>

                    {isActivitiesHidden && (
                      <button
                        type="button"
                        onClick={() => handleRestoreSection(day.id, "activities")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Add Activities</span>
                      </button>
                    )}

                    {isScenicHidden && (
                      <button
                        type="button"
                        onClick={() => handleRestoreSection(day.id, "scenicStops")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Add Scenic Stops</span>
                      </button>
                    )}

                    {isBulletsHidden && (
                      <button
                        type="button"
                        onClick={() => handleRestoreSection(day.id, "bullets")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-slate-600" />
                        <span>Add Tour Highlights</span>
                      </button>
                    )}
                  </div>

                  {/* Hotel Check-In & Meals - English label */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 flex items-center gap-1">
                        <Hotel className="w-3.5 h-3.5 text-indigo-500" />
                        Hotel Check-In Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Hotel Check-In Name"
                        value={currentHotel}
                        onChange={(e) => handleUpdateDayField(day.id, "hotelCheckIn", e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1 flex items-center gap-1">
                        <Utensils className="w-3.5 h-3.5 text-amber-500" />
                        Meal Indicators (Breakfast / Lunch / Dinner)
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 mb-0.5">Breakfast</span>
                          <select
                            aria-label="Breakfast Option"
                            value={day.meals?.breakfast || "NONE"}
                            onChange={(e) => handleUpdateDayMeals(day.id, "breakfast", e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[11px] font-bold"
                          >
                            {MEAL_OPTIONS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 mb-0.5">Lunch</span>
                          <select
                            aria-label="Lunch Option"
                            value={day.meals?.lunch || "CLIENT"}
                            onChange={(e) => handleUpdateDayMeals(day.id, "lunch", e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[11px] font-bold"
                          >
                            {MEAL_OPTIONS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 mb-0.5">Dinner</span>
                          <select
                            aria-label="Dinner Option"
                            value={day.meals?.dinner || "HOTEL"}
                            onChange={(e) => handleUpdateDayMeals(day.id, "dinner", e.target.value)}
                            className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-[11px] font-bold"
                          >
                            {MEAL_OPTIONS.map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 5. REMARKS SECTION ── */}
      {activeSection === "remarks" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-emerald-600" />
              Important Remarks &amp; Tour Conditions {isJa ? "(JA)" : "(EN)"}
            </h3>
            <span className="text-[11px] font-bold text-slate-400">
              One condition per line
            </span>
          </div>

          <textarea
            rows={7}
            value={activeRemarks.join("\n")}
            onChange={(e) => handleRemarksChange(e.target.value)}
            className="w-full p-3.5 rounded-xl border border-slate-200 text-xs leading-relaxed text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>
      )}

      {/* ── 6. BRANDING & COMPANY INFO ── */}
      {activeSection === "company" && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4 animate-in fade-in duration-150">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            Company Footer &amp; Licensing Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Company Name (English)
              </label>
              <input
                type="text"
                value={doc.companyInfo.nameEn}
                onChange={(e) =>
                  updateDoc({ companyInfo: { ...doc.companyInfo, nameEn: e.target.value } })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Company Name (Japanese)
              </label>
              <input
                type="text"
                value={doc.companyInfo.nameJa}
                onChange={(e) =>
                  updateDoc({ companyInfo: { ...doc.companyInfo, nameJa: e.target.value } })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Registration / PV Number
              </label>
              <input
                type="text"
                value={doc.companyInfo.registrationNo}
                onChange={(e) =>
                  updateDoc({ companyInfo: { ...doc.companyInfo, registrationNo: e.target.value } })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                SLTDA License
              </label>
              <input
                type="text"
                value={doc.companyInfo.sltdaNo}
                onChange={(e) =>
                  updateDoc({ companyInfo: { ...doc.companyInfo, sltdaNo: e.target.value } })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Official Address
              </label>
              <input
                type="text"
                value={doc.companyInfo.address}
                onChange={(e) =>
                  updateDoc({ companyInfo: { ...doc.companyInfo, address: e.target.value } })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Telephone Contact
              </label>
              <input
                type="text"
                value={doc.companyInfo.tel}
                onChange={(e) =>
                  updateDoc({ companyInfo: { ...doc.companyInfo, tel: e.target.value } })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Email &amp; Website
              </label>
              <input
                type="text"
                value={`${doc.companyInfo.email} | ${doc.companyInfo.website}`}
                disabled
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono text-slate-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
