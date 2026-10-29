"use client";

import { Calendar, Trash2, Plus } from "lucide-react";
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

  const addItineraryDay = () => {
    setFormData((prev) => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        { day: prev.itinerary.length + 1, title: "", description: "", images: [] },
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
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <Calendar className="w-4 h-4 text-indigo-500" /> Itinerary
      </h3>
      {formData.itinerary.map((item, idx) => (
        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-600">Day {item.day}</span>
            {formData.itinerary.length > 1 && (
              <button
                type="button"
                onClick={() => removeItineraryDay(idx)}
                className="text-slate-400 hover:text-red-500 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Day
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Day Number</label>
              <input
                type="number"
                value={item.day}
                onChange={(e) => handleItineraryChange(idx, "day", e.target.value)}
                className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-[11px] font-medium text-slate-500 mb-1">Day Title</label>
              <input
                type="text"
                placeholder="e.g. Arrival in Colombo & City Exploration"
                value={item.title}
                onChange={(e) => handleItineraryChange(idx, "title", e.target.value)}
                className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Day Description</label>
            <textarea
              rows={2}
              placeholder="Day schedule details..."
              value={item.description}
              onChange={(e) => handleItineraryChange(idx, "description", e.target.value)}
              className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none resize-y"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addItineraryDay}
        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" /> Add Itinerary Day
      </button>
    </div>
  );
}