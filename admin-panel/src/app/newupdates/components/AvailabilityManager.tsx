"use client";

import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Save, XCircle } from "lucide-react";
import { availabilityService } from "@/services/availability.service";

const MONTHS = [
  "January", "February", "March", "April", "May", "June", 
  "July", "August", "September", "October", "November", "December"
];

const YEARS = [2026, 2027, 2028];

export default function AvailabilityManager() {
  const [currentMonth, setCurrentMonth] = useState(7);
  const [currentYear, setCurrentYear] = useState(2026);
  
  const [closedDates, setClosedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch existing availability on component mount using the service
  useEffect(() => {
    async function loadAvailability() {
      try {
        const data = await availabilityService.getAvailability();
        if (data && data.apiClosedDates) {
          setClosedDates(data.apiClosedDates);
        }
      } catch (err) {
        console.error("Failed to load availability, defaulting to empty", err);
      } finally {
        setFetching(false);
      }
    }
    loadAvailability();
  }, []);

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

  const toggleDate = (day: number) => {
    const formatted = formatDateString(day);
    setClosedDates((prev) =>
      prev.includes(formatted)
        ? prev.filter((date) => date !== formatted)
        : [...prev, formatted].sort()
    );
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await availabilityService.updateAvailability({ apiClosedDates: closedDates });
      alert("Availability updated successfully!");
    } catch (err: any) {
      alert(`Save error: ${err.message || "Could not save changes"}`);
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const startDay = getFirstDayOfMonth(currentMonth, currentYear);

  if (fetching) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading calendar availability...</div>;
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600" /> Tour Date Availability
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Click dates to toggle between Available and Not Available.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" /> {loading ? "Saving..." : "Save Availability"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200 p-5 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(Number(e.target.value))}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>

            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {["SU", "MO", "TU", "WE", "TH", "FR", "SA"].map((d) => (
              <span key={d} className="text-[11px] font-bold text-slate-400">
                {d}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: startDay }).map((_, i) => (
              <div key={`blank-${i}`} className="h-9" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const formatted = formatDateString(dayNum);
              const isClosed = closedDates.includes(formatted);

              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => toggleDate(dayNum)}
                  className={`h-9 rounded-xl flex items-center justify-center text-xs font-semibold transition-all relative cursor-pointer ${
                    isClosed
                      ? "bg-red-50 text-red-400 line-through border border-red-200"
                      : "bg-white text-slate-700 hover:border-indigo-500 hover:text-indigo-600 border border-slate-200 shadow-2xs"
                  }`}
                >
                  {dayNum}
                  {isClosed && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Output Array Payload
          </h3>
          
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 overflow-x-auto">
            <span className="text-emerald-400">apiClosedDates</span> = {JSON.stringify(closedDates, null, 2)};
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-700">
              Disabled Dates ({closedDates.length})
            </h4>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {closedDates.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No closed dates selected.</p>
              ) : (
                closedDates.map((date) => (
                  <div
                    key={date}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    <span className="text-slate-800 font-mono font-medium">{date}</span>
                    <span className="flex items-center gap-1 text-[10px] text-red-600 font-semibold bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                      <XCircle className="w-3 h-3" /> Not Available
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}