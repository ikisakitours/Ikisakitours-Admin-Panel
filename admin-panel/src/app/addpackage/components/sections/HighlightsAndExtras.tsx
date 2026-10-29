"use client";

import { Trash2, Plus } from "lucide-react";
import { PackageFormData } from "../../types/package.types";

interface Props {
  formData: PackageFormData;
  setFormData: React.Dispatch<React.SetStateAction<PackageFormData>>;
}

export function HighlightsAndExtras({ formData, setFormData }: Props) {
  const handleSimpleArrayChange = (
    field: "highlights" | "includes" | "excludes",
    index: number,
    value: string
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  const addSimpleArrayItem = (field: "highlights" | "includes" | "excludes") => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeSimpleArrayItem = (field: "highlights" | "includes" | "excludes", index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-800">Highlights</h4>
        {formData.highlights.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleSimpleArrayChange("highlights", idx, e.target.value)}
              placeholder={`Highlight #${idx + 1}`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
            />
            {formData.highlights.length > 1 && (
              <button type="button" onClick={() => removeSimpleArrayItem("highlights", idx)} className="text-slate-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addSimpleArrayItem("highlights")} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-800">Includes</h4>
        {formData.includes.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleSimpleArrayChange("includes", idx, e.target.value)}
              placeholder={`Included Item #${idx + 1}`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
            />
            {formData.includes.length > 1 && (
              <button type="button" onClick={() => removeSimpleArrayItem("includes", idx)} className="text-slate-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addSimpleArrayItem("includes")} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-800">Excludes</h4>
        {formData.excludes.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleSimpleArrayChange("excludes", idx, e.target.value)}
              placeholder={`Excluded Item #${idx + 1}`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
            />
            {formData.excludes.length > 1 && (
              <button type="button" onClick={() => removeSimpleArrayItem("excludes", idx)} className="text-slate-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addSimpleArrayItem("excludes")} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </div>
  );
}