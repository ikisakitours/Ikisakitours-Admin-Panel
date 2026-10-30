"use client";

import { Calendar, Trash2, Plus, X } from "lucide-react";
import { PackageFormData, ItineraryItem } from "../../types/package.types";

interface Props {
  formData: PackageFormData;
  setFormData: React.Dispatch<React.SetStateAction<PackageFormData>>;
}

export function ItinerarySection({ formData, setFormData }: Props) {
  const handleItineraryChange = (index: number, key: keyof ItineraryItem, value: any) => {
    const updated = [...formData.itinerary];
    updated[index] = { ...updated[index], [key]: value };
    setFormData((prev) => ({ ...prev, itinerary: updated }));
  };

  // Helper for dynamic string arrays (locations, route, details, scenicStops, activities)
  const handleArrayItemChange = (dayIndex: number, arrayKey: 'locations' | 'route' | 'details' | 'scenicStops' | 'activities', itemIndex: number, value: string) => {
    const updated = [...formData.itinerary];
    const currentArray = [...(updated[dayIndex][arrayKey] || [])];
    currentArray[itemIndex] = value;
    updated[dayIndex] = { ...updated[dayIndex], [arrayKey]: currentArray };
    setFormData((prev) => ({ ...prev, itinerary: updated }));
  };

  const addArrayItem = (dayIndex: number, arrayKey: 'locations' | 'route' | 'details' | 'scenicStops' | 'activities') => {
    const updated = [...formData.itinerary];
    const currentArray = [...(updated[dayIndex][arrayKey] || [])];
    currentArray.push("");
    updated[dayIndex] = { ...updated[dayIndex], [arrayKey]: currentArray };
    setFormData((prev) => ({ ...prev, itinerary: updated }));
  };

  const removeArrayItem = (dayIndex: number, arrayKey: 'locations' | 'route' | 'details' | 'scenicStops' | 'activities', itemIndex: number) => {
    const updated = [...formData.itinerary];
    const currentArray = [...(updated[dayIndex][arrayKey] || [])];
    currentArray.splice(itemIndex, 1);
    updated[dayIndex] = { ...updated[dayIndex], [arrayKey]: currentArray };
    setFormData((prev) => ({ ...prev, itinerary: updated }));
  };

  const addItineraryDay = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        {
          day: prev.itinerary.length + 1,
          title: "",
          travelTime: "",
          locations: [""],
          route: [""],
          details: [""],
          scenicStops: [""],
          activities: [""],
          meals: "",
          accommodation: "",
        },
      ],
    }));
  };

  const removeItineraryDay = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      itinerary: prev.itinerary
        .filter((_, i) => i !== index)
        .map((item, idx) => ({ ...item, day: idx + 1 })),
    }));
  };

  return (
    <div className="space-y-6 pt-4 border-t border-slate-100">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-indigo-500" /> Itinerary
      </h3>

      {formData.itinerary.map((item, idx) => (
        <div key={idx} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
            <span className="text-xs font-bold text-indigo-600">Day {item.day} Configuration</span>
            {formData.itinerary.length > 1 && (
              <button
                type="button"
                onClick={() => removeItineraryDay(idx)}
                className="text-slate-400 hover:text-red-500 text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Day
              </button>
            )}
          </div>

          {/* Row 1: Day Number, Title, Travel Time */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Day No.</label>
              <input
                type="number"
                value={item.day}
                onChange={(e) => handleItineraryChange(idx, "day", Number(e.target.value))}
                className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none"
              />
            </div>
            <div className="sm:col-span-7">
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Day Title</label>
              <input
                type="text"
                placeholder="e.g. Polonnaruwa Ancient Kingdom Half-Day Tour"
                value={item.title}
                onChange={(e) => handleItineraryChange(idx, "title", e.target.value)}
                className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Travel Time</label>
              <input
                type="text"
                placeholder="e.g. 5 Hours"
                value={item.travelTime || ""}
                onChange={(e) => handleItineraryChange(idx, "travelTime", e.target.value)}
                className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none"
              />
            </div>
          </div>

          {/* Row 2: Meals & Accommodation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Meals</label>
              <input
                type="text"
                placeholder="e.g. None (Refreshment water provided)"
                value={item.meals || ""}
                onChange={(e) => handleItineraryChange(idx, "meals", e.target.value)}
                className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Accommodation</label>
              <input
                type="text"
                placeholder="e.g. N/A (Day Tour) or Luxury Hotel"
                value={item.accommodation || ""}
                onChange={(e) => handleItineraryChange(idx, "accommodation", e.target.value)}
                className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none"
              />
            </div>
          </div>

          {/* Dynamic Lists Section (Locations, Route, Details, Scenic Stops, Activities) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Locations */}
            <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200/80">
              <label className="block text-[11px] font-bold text-slate-700">Locations</label>
              {(item.locations || []).map((loc, lIdx) => (
                <div key={lIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Habarana / Sigiriya"
                    value={loc}
                    onChange={(e) => handleArrayItemChange(idx, "locations", lIdx, e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-slate-50 rounded-lg p-2 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(idx, "locations", lIdx)}
                    className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem(idx, "locations")}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer pt-1"
              >
                <Plus className="w-3 h-3" /> Add Location
              </button>
            </div>

            {/* Route Stops */}
            <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200/80">
              <label className="block text-[11px] font-bold text-slate-700">Route Flow</label>
              {(item.route || []).map((rt, rIdx) => (
                <div key={rIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Hotel Pickup / Gal Vihara"
                    value={rt}
                    onChange={(e) => handleArrayItemChange(idx, "route", rIdx, e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-slate-50 rounded-lg p-2 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(idx, "route", rIdx)}
                    className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem(idx, "route")}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer pt-1"
              >
                <Plus className="w-3 h-3" /> Add Route Stop
              </button>
            </div>

            {/* Details Bullet Points */}
            <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200/80 md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-700">Detailed Schedule Bullet Points</label>
              {(item.details || []).map((det, dIdx) => (
                <div key={dIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Convenient pickup from your hotel by an air-conditioned vehicle"
                    value={det}
                    onChange={(e) => handleArrayItemChange(idx, "details", dIdx, e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-slate-50 rounded-lg p-2 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(idx, "details", dIdx)}
                    className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem(idx, "details")}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer pt-1"
              >
                <Plus className="w-3 h-3" /> Add Detail Point
              </button>
            </div>

            {/* Scenic Stops */}
            <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200/80">
              <label className="block text-[11px] font-bold text-slate-700">Scenic Stops (Optional)</label>
              {(item.scenicStops || []).map((st, sIdx) => (
                <div key={sIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Parakrama Samudra Viewpoint"
                    value={st}
                    onChange={(e) => handleArrayItemChange(idx, "scenicStops", sIdx, e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-slate-50 rounded-lg p-2 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(idx, "scenicStops", sIdx)}
                    className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem(idx, "scenicStops")}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer pt-1"
              >
                <Plus className="w-3 h-3" /> Add Scenic Stop
              </button>
            </div>

            {/* Activities */}
            <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200/80">
              <label className="block text-[11px] font-bold text-slate-700">Activities (Optional)</label>
              {(item.activities || []).map((act, aIdx) => (
                <div key={aIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Historical Tour, Cycling, Photography"
                    value={act}
                    onChange={(e) => handleArrayItemChange(idx, "activities", aIdx, e.target.value)}
                    className="w-full text-xs border border-slate-200 bg-slate-50 rounded-lg p-2 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeArrayItem(idx, "activities", aIdx)}
                    className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem(idx, "activities")}
                className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer pt-1"
              >
                <Plus className="w-3 h-3" /> Add Activity
              </button>
            </div>

          </div>

        </div>
      ))}

      <button
        type="button"
        onClick={addItineraryDay}
        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer pt-2"
      >
        <Plus className="w-3.5 h-3.5" /> Add Itinerary Day
      </button>
    </div>
  );
}