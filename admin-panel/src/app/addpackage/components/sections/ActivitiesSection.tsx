"use client";

import { Sparkles, Trash2, Plus } from "lucide-react";
import { PackageFormData } from "../../types/package.types";

interface Props {
  formData: PackageFormData;
  setFormData: React.Dispatch<React.SetStateAction<PackageFormData>>;
}

export function ActivitiesSection({ formData, setFormData }: Props) {
  const handleActivityChange = (index: number, key: "title" | "description", value: string) => {
    const updated = [...formData.activityDetails];
    updated[index][key] = value;
    setFormData((prev) => ({ ...prev, activityDetails: updated }));
  };

  const addActivity = () => {
    setFormData((prev) => ({
      ...prev,
      activityDetails: [...prev.activityDetails, { title: "", description: "" }],
    }));
  };

  const removeActivity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      activityDetails: prev.activityDetails.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-indigo-500" /> Activity Details
      </h3>
      {formData.activityDetails.map((activity, idx) => (
        <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Activity #{idx + 1}</span>
            {formData.activityDetails.length > 1 && (
              <button
                type="button"
                onClick={() => removeActivity(idx)}
                className="text-slate-400 hover:text-red-500 text-xs flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Activity Title"
              value={activity.title}
              onChange={(e) => handleActivityChange(idx, "title", e.target.value)}
              className="text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none"
            />
            <input
              type="text"
              placeholder="Activity Description"
              value={activity.description}
              onChange={(e) => handleActivityChange(idx, "description", e.target.value)}
              className="text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addActivity}
        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" /> Add Activity
      </button>
    </div>
  );
}