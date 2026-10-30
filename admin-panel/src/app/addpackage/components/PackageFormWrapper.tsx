"use client";

import { useState } from "react";
import { packageService } from "@/services/package.service";
import { PackageFormData } from "../types/package.types";
import { BasicOverviewSection } from "./sections/BasicOverviewSection";
import { PricingSection } from "./sections/PricingSection";
import { GallerySection } from "./sections/GallerySection";
import { PackageDestinationPicker } from "./sections/PackageDestinationPicker";
import { ActivitiesSection } from "./sections/ActivitiesSection";
import { ItinerarySection } from "./sections/ItinerarySection";
import { HighlightsAndExtras } from "./sections/HighlightsAndExtras";
import { Save, Layers } from "lucide-react";

export default function PackageFormWrapper() {
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
    itinerary: [
      {
        day: 1,
        title: "",
        travelTime: "",
        locations: [""],
        route: [""],
        details: [""],
        scenicStops: [""],
        activities: [""],
        meals: "",
        accommodation: "",
      },
    ],
    destinations: [],
    includes: [""],
    excludes: [""],
  });

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
          <h2 className="text-base font-bold text-slate-900">New Tour Package Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">Fill in all details below to publish your tour package.</p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" /> {loading ? "Uploading & Saving..." : "Save Package"}
        </button>
      </div>

      {/* Modular Sections */}
      <BasicOverviewSection formData={formData} setFormData={setFormData} />

      {/* Lead Header Info */}
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
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
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
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
            />
          </div>
        </div>
      </div>

      <PricingSection formData={formData} setFormData={setFormData} />

      <GallerySection selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />

      <PackageDestinationPicker
        selectedDestinations={formData.destinations}
        onChange={(destinations) => setFormData({ ...formData, destinations })}
      />

      <ActivitiesSection formData={formData} setFormData={setFormData} />

      <ItinerarySection formData={formData} setFormData={setFormData} />

      <HighlightsAndExtras formData={formData} setFormData={setFormData} />

      {/* Detailed Description */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-600">Detailed Description</label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description for the package..."
          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none resize-y"
        />
      </div>
    </form>
  );
}