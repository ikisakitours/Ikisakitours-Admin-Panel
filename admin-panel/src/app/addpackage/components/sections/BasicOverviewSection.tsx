"use client";

import { Tag } from "lucide-react";
import { PackageFormData, PackageBadge } from "../../types/package.types";

interface Props {
  formData: PackageFormData;
  setFormData: React.Dispatch<React.SetStateAction<PackageFormData>>;
}

export function BasicOverviewSection({ formData, setFormData }: Props) {
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

  const handleTitle1Change = (val: string) => {
    const newSlug = updateSlug(val, formData.titleEmphasis);
    setFormData((prev) => ({ ...prev, title: val, slug: newSlug }));
  };

  const handleTitle2Change = (val: string) => {
    const newSlug = updateSlug(formData.title, val);
    setFormData((prev) => ({ ...prev, titleEmphasis: val, slug: newSlug }));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <Tag className="w-4 h-4 text-indigo-500" /> Basic Overview & Metadata
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
          <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
          <input
            type="text"
            required
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g. Wildlife, Adventure"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Origin / Departure</label>
          <input
            type="text"
            required
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
            placeholder="e.g. Colombo, Kandy"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Duration</label>
          <input
            type="text"
            required
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
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
          <label className="block text-xs font-semibold text-slate-600 mb-1">Title 1 (Main Title)</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => handleTitle1Change(e.target.value)}
            placeholder="e.g. Ancient Kingdom"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Title 2 (Highlight)</label>
          <input
            type="text"
            required
            value={formData.titleEmphasis}
            onChange={(e) => handleTitle2Change(e.target.value)}
            placeholder="e.g. Exclusive"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">URL Slug (Auto: Title 1 + Title 2)</label>
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