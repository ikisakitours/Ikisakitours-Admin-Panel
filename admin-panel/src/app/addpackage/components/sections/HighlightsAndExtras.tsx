"use client";

import { Trash2, Plus } from "lucide-react";
import { PackageFormData } from "../../types/package.types";

interface Props {
  formData: PackageFormData;
  setFormData: React.Dispatch<React.SetStateAction<PackageFormData>>;
  locale: string;
}

type ListField = "highlights" | "includes" | "excludes";

export function HighlightsAndExtras({ formData, setFormData, locale }: Props) {

  const handleSimpleArrayChange = (field: ListField, index: number, value: string) => {
    const record = formData[field] || {};
    const currentArray = [...(record[locale] || [])];
    currentArray[index] = value;

    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [locale]: currentArray,
      },
    }));
  };

  const addSimpleArrayItem = (field: ListField) => {
    const record = formData[field] || {};
    const currentArray = [...(record[locale] || [])];

    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [locale]: [...currentArray, ""],
      },
    }));
  };

  const removeSimpleArrayItem = (field: ListField, index: number) => {
    const record = formData[field] || {};
    const currentArray = [...(record[locale] || [])];
    const filteredArray = currentArray.filter((_, i) => i !== index);

    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [locale]: filteredArray,
      },
    }));
  };

  const renderList = (field: ListField, title: string) => {
    const record = formData[field] || {};
    // Fallback to [""] if the list for the current locale is empty so an input box is always visible
    const items = record[locale] && record[locale].length > 0 ? record[locale] : [""];

    return (
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-800">
          {title} ({locale.toUpperCase()})
        </h4>
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleSimpleArrayChange(field, idx, e.target.value)}
              placeholder={`${title} #${idx + 1}`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeSimpleArrayItem(field, idx)}
                className="text-slate-400 hover:text-red-500 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={() => addSimpleArrayItem(field)}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
      {renderList("highlights", "Highlights")}
      {renderList("includes", "Includes")}
      {renderList("excludes", "Excludes")}
    </div>
  );
}