"use client";

import { Trash2, Plus } from "lucide-react";
import { PackageFormData } from "../../types/package.types";

interface Props {
  formData: PackageFormData;
  setFormData: React.Dispatch<React.SetStateAction<PackageFormData>>;
  locale: "en" | "ja";
}

type ListField = "highlights" | "includes" | "excludes";

export function HighlightsAndExtras({ formData, setFormData, locale }: Props) {
  
  // Resolve which array to map to based on locale (e.g., 'highlightsEn' or 'highlightsJa')
  const getFieldKey = (field: ListField): keyof PackageFormData => {
    const suffix = locale === "ja" ? "Ja" : "En";
    return `${field}${suffix}` as keyof PackageFormData;
  };

  const handleSimpleArrayChange = (field: ListField, index: number, value: string) => {
    const targetKey = getFieldKey(field);
    const currentArray = (formData[targetKey] as string[]) || [];
    const updated = [...currentArray];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [targetKey]: updated }));
  };

  const addSimpleArrayItem = (field: ListField) => {
    const targetKey = getFieldKey(field);
    const currentArray = (formData[targetKey] as string[]) || [];
    setFormData((prev) => ({ ...prev, [targetKey]: [...currentArray, ""] }));
  };

  const removeSimpleArrayItem = (field: ListField, index: number) => {
    const targetKey = getFieldKey(field);
    const currentArray = (formData[targetKey] as string[]) || [];
    setFormData((prev) => ({
      ...prev,
      [targetKey]: currentArray.filter((_, i) => i !== index),
    }));
  };

  const renderList = (field: ListField, title: string) => {
    const targetKey = getFieldKey(field);
    // Fallback to [""] so the user always sees at least one input box
    const items = (formData[targetKey] as string[]) || [""];

    return (
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-800">{title}</h4>
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
              <button type="button" onClick={() => removeSimpleArrayItem(field, idx)} className="text-slate-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={() => addSimpleArrayItem(field)} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
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