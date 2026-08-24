"use client";

import { useState } from "react";
import { Plus, Trash2, Save, Tag, Sparkles, MapPin, DollarSign, Image as ImageIcon, Upload } from "lucide-react";

export interface PackageFormData {
  title: string;
  subtitle: string;
  slug: string;
  tourType: "multi-day" | "day-tour";
  category: "cultural" | "religious" | "nature" | "coastal" | "wildlife";
  origin: string;
  duration: string;
  price: string;
  discount: string;
  lead: string;
  description: string;
  highlights: string[];
  includes: string[];
  excludes: string[];
  badgeType: "popular" | "sale" | "new" | "none";
  badgeLabel: string;
  imageUrl: string;
}

const CATEGORY_MAP = {
  cultural: "Cultural",
  religious: "Religious",
  nature: "Nature",
  coastal: "Coastal",
  wildlife: "Wildlife",
};

const ORIGIN_OPTIONS = [
  "From Colombo",
  "From Kandy",
  "From Galle",
  "From Negombo",
  "From Nuwara Eliya",
  "From Sigiriya",
  "From Habarana",
  "From Hambantota",
];

export default function PackageForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PackageFormData>({
    title: "",
    subtitle: "",
    slug: "",
    tourType: "multi-day",
    category: "cultural",
    origin: "From Colombo",
    duration: "3 Days",
    price: "",
    discount: "0",
    lead: "",
    description: "",
    highlights: [""],
    includes: [""],
    excludes: [""],
    badgeType: "none",
    badgeLabel: "",
    imageUrl: "",
  });

  // 1. AI JSON File Upload Handler
  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Auto-generate slug if title exists in JSON
        if (json.title && !json.slug) {
          json.slug = json.title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, "")
            .replace(/[\s_-]+/g, "-")
            .replace(/^-+|-+$/g, "");
        }

        // Merge imported JSON with state defaults
        setFormData((prev) => ({ ...prev, ...json }));
        alert("Package form autofilled successfully!");
      } catch (err) {
        alert("Invalid JSON file format.");
      }
    };
    reader.readAsText(file);
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

  const handleArrayChange = (
    field: "highlights" | "includes" | "excludes",
    index: number,
    value: string
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  const addArrayItem = (field: "highlights" | "includes" | "excludes") => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeArrayItem = (
    field: "highlights" | "includes" | "excludes",
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // 2. Submit Handler calling NestJS Backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Transform form string data into types expected by NestJS CreateAddPackageDto
    const payload = {
      title: formData.title,
      subtitle: formData.subtitle,
      slug: formData.slug,
      summary: formData.lead,
      imageUrl: formData.imageUrl,
      tourType: formData.tourType === "multi-day" ? "Multi-Day Tour" : "Day Tour",
      category: CATEGORY_MAP[formData.category] || "Cultural",
      startingOrigin: formData.origin,
      price: Number(formData.price.replace(/[^0-9.]/g, "")), // Clean "$299" -> 299
      discount: Number(formData.discount),
      duration: formData.duration,
      badge: formData.badgeType !== "none" ? formData.badgeLabel || formData.badgeType : "No Badge",
      highlights: formData.highlights.filter((item) => item.trim() !== ""), // Strip empty strings
      description: formData.description,
    };

    try {
      const response = await fetch("http://localhost:4000/addpackages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create package");
      }

      const result = await response.json();
      alert(`Success! Package saved with ID: ${result.id}`);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-8 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Add New Tour Package</h2>
          <p className="text-xs text-slate-500 mt-1">Configure tour metadata, pricing, highlights, and inclusions.</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" /> {loading ? "Publishing..." : "Save Package"}
        </button>
      </div>

      {/* AI JSON File Upload Box */}
      <div className="p-4 bg-indigo-50/50 border border-dashed border-indigo-200 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Upload className="w-5 h-5 text-indigo-600" />
          <div>
            <p className="text-xs font-semibold text-indigo-900">Import AI Generated JSON</p>
            <p className="text-[11px] text-indigo-600">Upload a .json file to autofill all form fields below instantly.</p>
          </div>
        </div>
        <input
          type="file"
          accept=".json"
          onChange={handleJsonUpload}
          className="text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
        />
      </div>

      {/* 1. Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Tag className="w-4 h-4 text-indigo-500" /> Basic Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Package Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Ancient Kingdom Sigiriya"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Subtitle</label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="e.g. Royal Palace Exploration"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">URL Slug (Auto Generated)</label>
            <input
              type="text"
              readOnly
              value={formData.slug}
              className="w-full text-xs bg-slate-50 border border-slate-200 text-slate-500 rounded-lg p-2.5 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Short Lead Summary</label>
            <input
              type="text"
              value={formData.lead}
              onChange={(e) => setFormData({ ...formData, lead: e.target.value })}
              placeholder="One line tagline for package card"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Media & Image Link */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-indigo-500" /> Package Image Reference
        </h3>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Image Reference URL
          </label>
          <input
            type="url"
            required
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://your-media-db.com/images/sigiriya-hero.jpg"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {formData.imageUrl && (
          <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-md">
            <img
              src={formData.imageUrl}
              alt="Image Preview"
              className="w-16 h-16 object-cover rounded-lg border border-slate-200"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
            <div className="truncate">
              <p className="text-xs font-medium text-slate-800 truncate">{formData.imageUrl}</p>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                Connected to Media DB
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Categorization & Routing Dropdowns */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-indigo-500" /> Category & Location
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Tour Type</label>
            <select
              value={formData.tourType}
              onChange={(e) => setFormData({ ...formData, tourType: e.target.value as any })}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:ring-1 focus:ring-indigo-500"
            >
              <option value="multi-day">Multi-Day Tour</option>
              <option value="day-tour">Day Tour</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:ring-1 focus:ring-indigo-500"
            >
              <option value="cultural">Cultural</option>
              <option value="religious">Religious</option>
              <option value="nature">Nature</option>
              <option value="coastal">Coastal</option>
              <option value="wildlife">Wildlife</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Starting Origin</label>
            <select
              value={formData.origin}
              onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:ring-1 focus:ring-indigo-500"
            >
              {ORIGIN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Pricing & Badges */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-indigo-500" /> Pricing & Badges
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Price (USD)</label>
            <input
              type="text"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="299"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Discount (%)</label>
            <input
              type="text"
              value={formData.discount}
              onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
              placeholder="15"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Duration</label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g. 4 Days or 5 Hours"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Badge Type</label>
            <select
              value={formData.badgeType}
              onChange={(e) => setFormData({ ...formData, badgeType: e.target.value as any })}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:ring-1 focus:ring-indigo-500"
            >
              <option value="none">No Badge</option>
              <option value="popular">Popular</option>
              <option value="sale">Sale</option>
              <option value="new">New Arrival</option>
            </select>
          </div>
        </div>

        {formData.badgeType !== "none" && (
          <div className="w-1/2">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Badge Label Text</label>
            <input
              type="text"
              value={formData.badgeLabel}
              onChange={(e) => setFormData({ ...formData, badgeLabel: e.target.value })}
              placeholder="e.g. Save 20% or Most Popular"
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        )}
      </div>

      {/* 5. Dynamic Repeater Lists (Highlights) */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" /> Package Highlights
        </h3>

        {formData.highlights.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => handleArrayChange("highlights", idx, e.target.value)}
              placeholder={`Highlight #${idx + 1}`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {formData.highlights.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem("highlights", idx)}
                className="p-2.5 text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => addArrayItem("highlights")}
          className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 pt-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Highlight
        </button>
      </div>

      {/* Description Textarea */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-600">Full Description</label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed narrative describing the tour..."
          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 resize-y"
        />
      </div>
    </form>
  );
}