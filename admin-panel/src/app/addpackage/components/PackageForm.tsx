"use client";

import { useState } from "react";
import { packageService } from "@/services/package.service";
import { PackageFormData, ActivityDetail, ItineraryItem, DestinationSnapshot } from "../types/package.types";
import { PackageDestinationPicker } from "./PackageDestinationPicker";
import {
  Plus,
  Trash2,
  Save,
  Tag,
  Sparkles,
  DollarSign,
  Image as ImageIcon,
  Calendar,
  Layers,
  X,
} from "lucide-react";

export default function PackageForm() {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState<PackageFormData>({
    type: "multiday",
    category: "",
    origin: "",
    duration: "",
    badge: "new_arrival",
    slug: "",
    titleEmphasis: "",
    title: "",
    price: "",
    discount: "0",
    provider: "",
    leadTitle: "",
    leadDescription: "",
    activityDetails: [{ title: "", description: "" }],
    highlights: [""],
    description: "",
    itinerary: [{ day: 1, title: "", description: "", images: [] }],
    destinations: [],
    includes: [""],
    excludes: [""],
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTitleChange = (val: string) => {
    const slugified = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((prev) => ({ ...prev, title: val, slug: slugified }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert("Please select at least one gallery image to upload.");
      return;
    }

    setLoading(true);
    try {
      const result = await packageService.createPackage(formData, selectedFiles);
      alert(`Success! Package created with ID: ${result.id}`);
      setSelectedFiles([]);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-8 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Create New Tour Package</h2>
          <p className="text-xs text-slate-500 mt-1">Configure all package attributes and attach gallery images.</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" /> {loading ? "Uploading & Saving..." : "Save Package"}
        </button>
      </div>

      {/* Basic Overview & New Metadata Fields */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Tag className="w-4 h-4 text-indigo-500" /> Basic Overview
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
              placeholder="e.g. 3 Days / 8 Hours"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Title Emphasis</label>
            <input
              type="text"
              required
              value={formData.titleEmphasis}
              onChange={(e) => setFormData({ ...formData, titleEmphasis: e.target.value })}
              placeholder="e.g. Exclusive"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Package Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Ancient Kingdom"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">URL Slug</label>
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

      {/* Gallery Images */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-indigo-500" /> Gallery Images
        </h3>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white cursor-pointer"
        />
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs">
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button type="button" onClick={() => removeSelectedFile(idx)} className="text-slate-400 hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reusable Destination Picker Component */}
      <PackageDestinationPicker
        selectedDestinations={formData.destinations}
        onChange={(destinations) => setFormData({ ...formData, destinations })}
      />
    </form>
  );
}