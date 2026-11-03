"use client";

import { Tag } from "lucide-react";
import { PackageFormData, PackageBadge } from "../../types/package.types";

interface Props {
  formData: PackageFormData;
  setFormData: React.Dispatch<React.SetStateAction<PackageFormData>>;
  locale: string;
}

export function BasicOverviewSection({ formData, setFormData, locale }: Props) {

  // Helper to generate a slug from combined Title 1 and Title 2
  const updateSlug = (title1: string, title2: string) => {
    const combined = `${title1} ${title2}`;
    return combined
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleRecordChange = (field: keyof PackageFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] as Record<string, string> || {}),
        [locale]: value,
      },
    }));
  };

  const handleTitle1Change = (val: string) => {
    handleRecordChange("title", val);
    // Only regenerate slug when editing English or if slug is empty
    if (locale === "en" || !formData.slug) {
      const emphasisVal = formData.titleEmphasis?.[locale] || formData.titleEmphasis?.["en"] || "";
      const newSlug = updateSlug(val, emphasisVal);
      setFormData((prev) => ({ ...prev, slug: newSlug }));
    }
  };

  const handleTitle2Change = (val: string) => {
    handleRecordChange("titleEmphasis", val);
    if (locale === "en" || !formData.slug) {
      const titleVal = formData.title?.[locale] || formData.title?.["en"] || "";
      const newSlug = updateSlug(titleVal, val);
      setFormData((prev) => ({ ...prev, slug: newSlug }));
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <Tag className="w-4 h-4 text-indigo-500" /> Basic Overview & Metadata ({locale.toUpperCase()})
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Package Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white"
          >
            <option value="multiday">Multi Day Tour</option>
            <option value="oneday">One Day Tour</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Category ({locale.toUpperCase()})</label>
          <input
            type="text"
            required
            value={formData.category?.[locale] || ""}
            onChange={(e) => handleRecordChange("category", e.target.value)}
            placeholder="e.g. Wildlife, Adventure"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Origin / Departure ({locale.toUpperCase()})</label>
          <input
            type="text"
            required
            value={formData.origin?.[locale] || ""}
            onChange={(e) => handleRecordChange("origin", e.target.value)}
            placeholder="e.g. Colombo, Kandy"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Duration ({locale.toUpperCase()})</label>
          <input
            type="text"
            required
            value={formData.duration?.[locale] || ""}
            onChange={(e) => handleRecordChange("duration", e.target.value)}
            placeholder="e.g. 4 Days / 8 Hours"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Badge</label>
          <select
            value={formData.badge}
            onChange={(e) => setFormData({ ...formData, badge: e.target.value as PackageBadge })}
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white"
          >
            <option value="new_arrival">New Arrival</option>
            <option value="discounted">Discounted</option>
            <option value="popular">Popular</option>
            <option value="featured">Featured</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Title 1 (Main Title) - {locale.toUpperCase()}
          </label>
          <input
            type="text"
            required={locale === "en"}
            value={formData.title?.[locale] || ""}
            onChange={(e) => handleTitle1Change(e.target.value)}
            placeholder="e.g. Ancient Kingdom"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Title 2 (Highlight) - {locale.toUpperCase()}
          </label>
          <input
            type="text"
            required={locale === "en"}
            value={formData.titleEmphasis?.[locale] || ""}
            onChange={(e) => handleTitle2Change(e.target.value)}
            placeholder="e.g. Exclusive"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">URL Slug (Auto)</label>
          <input
            type="text"
            readOnly
            value={formData.slug}
            className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-500 rounded-lg p-2.5 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Provider</label>
          <input
            type="text"
            required
            value={formData.provider}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            placeholder="e.g. Ikisaki Tours"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
          />
        </div>
      </div>
    </div>
  );
}