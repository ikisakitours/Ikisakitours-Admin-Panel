"use client";

import { useState } from "react";
import { packageService } from "@/services/package.service";
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
  Building,
} from "lucide-react";

export interface ActivityDetail {
  title: string;
  description: string;
}

export interface ItineraryItem {
  day: number;
  title: string;
  description: string;
  images?: string[];
}

export interface DestinationItem {
  name: string;
  description?: string;
  images?: string[];
}

export interface PackageFormData {
  type: "oneday" | "multiday";
  slug: string;
  titleEmphasis: string;
  title: string;
  price: string;
  discount: string;
  provider: string;
  leadTitle: string;
  leadDescription: string;
  activityDetails: ActivityDetail[];
  highlights: string[];
  description: string;
  itinerary: ItineraryItem[];
  destinations: DestinationItem[];
  includes: string[];
  excludes: string[];
}

export default function PackageForm() {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState<PackageFormData>({
    type: "multiday",
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
    destinations: [{ name: "", description: "", images: [] }],
    includes: [""],
    excludes: [""],
  });

  // Handle local File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Auto-slug generator
  const handleTitleChange = (val: string) => {
    const slugified = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    setFormData((prev) => ({ ...prev, title: val, slug: slugified }));
  };

  // Simple Array Handlers
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

  const removeSimpleArrayItem = (
    field: "highlights" | "includes" | "excludes",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // Activity Handlers
  const handleActivityChange = (index: number, key: keyof ActivityDetail, value: string) => {
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

  // Itinerary Handlers
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

  // Destination Handlers
  const handleDestinationChange = (index: number, key: keyof DestinationItem, value: any) => {
    const updated = [...formData.destinations];
    updated[index] = { ...updated[index], [key]: value };
    setFormData((prev) => ({ ...prev, destinations: updated }));
  };

  const addDestination = () => {
    setFormData((prev) => ({
      ...prev,
      destinations: [...prev.destinations, { name: "", description: "", images: [] }],
    }));
  };

  const removeDestination = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((_, i) => i !== index),
    }));
  };

  // Direct Submission (Form Data + Raw Files sent to NestJS)
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

      {/* Basic Overview */}
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
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:ring-1 focus:ring-indigo-500"
            >
              <option value="multiday">Multi Day Tour</option>
              <option value="oneday">One Day Tour</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Title Emphasis</label>
            <input
              type="text"
              required
              value={formData.titleEmphasis}
              onChange={(e) => setFormData({ ...formData, titleEmphasis: e.target.value })}
              placeholder="e.g. Exclusive, Best Seller"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Package Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Ancient Kingdom Sigiriya & Kandy"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
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
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Lead Header */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-500" /> Lead Header Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Lead Title</label>
            <input
              type="text"
              required
              value={formData.leadTitle}
              onChange={(e) => setFormData({ ...formData, leadTitle: e.target.value })}
              placeholder="e.g. Discover Sri Lanka's Heritage"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Lead Description</label>
            <input
              type="text"
              required
              value={formData.leadDescription}
              onChange={(e) => setFormData({ ...formData, leadDescription: e.target.value })}
              placeholder="Short catchy tagline explaining the tour..."
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-indigo-500" /> Pricing
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Base Price ($)</label>
            <input
              type="text"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="e.g. 450"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Discount (%)</label>
            <input
              type="text"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              placeholder="0 to 100"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Single Step Image Selection */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-indigo-500" /> Gallery Images
        </h3>
        <div>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800 cursor-pointer"
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-2">
            <p className="text-xs font-semibold text-indigo-900">
              Attached Images ({selectedFiles.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-xs text-slate-700"
                >
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(idx)}
                    className="text-slate-400 hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Activity Details */}
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
                className="text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Activity Description"
                value={activity.description}
                onChange={(e) => handleActivityChange(idx, "description", e.target.value)}
                className="text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
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

      {/* Itinerary */}
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
                  className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-[11px] font-medium text-slate-500 mb-1">Day Title</label>
                <input
                  type="text"
                  placeholder="e.g. Arrival in Colombo & City Exploration"
                  value={item.title}
                  onChange={(e) => handleItineraryChange(idx, "title", e.target.value)}
                  className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
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
                className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
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

      {/* Destinations Covered */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Building className="w-4 h-4 text-indigo-500" /> Destinations Covered
        </h3>
        {formData.destinations.map((dest, idx) => (
          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Destination #{idx + 1}</span>
              {formData.destinations.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDestination(idx)}
                  className="text-slate-400 hover:text-red-500 text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Destination Name (e.g. Kandy)"
                value={dest.name}
                onChange={(e) => handleDestinationChange(idx, "name", e.target.value)}
                className="text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Description (Optional)"
                value={dest.description || ""}
                onChange={(e) => handleDestinationChange(idx, "description", e.target.value)}
                className="text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addDestination}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Destination
        </button>
      </div>

      {/* Highlights, Includes & Excludes */}
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
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {formData.highlights.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSimpleArrayItem("highlights", idx)}
                  className="text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addSimpleArrayItem("highlights")}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
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
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {formData.includes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSimpleArrayItem("includes", idx)}
                  className="text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addSimpleArrayItem("includes")}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
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
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {formData.excludes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSimpleArrayItem("excludes", idx)}
                  className="text-slate-400 hover:text-red-500 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addSimpleArrayItem("excludes")}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-600">Detailed Description</label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description for the package..."
          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
        />
      </div>
    </form>
  );
}