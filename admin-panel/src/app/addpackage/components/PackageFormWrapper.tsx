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
import { Save, Layers, Globe } from "lucide-react";

export default function PackageFormWrapper() {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  // NEW: Language toggle state
  const [locale, setLocale] = useState<"en" | "ja">("en");

  const [formData, setFormData] = useState<PackageFormData>({
    type: "multiday",
    category: "",
    origin: "",
    duration: "",
    badge: "new_arrival",
    slug: "",
    
    // Legacy/English defaults
    titleEmphasis: "",
    title: "",
    price: "",
    discount: "0",
    provider: "",
    leadTitle: "",
    leadDescription: "",
    description: "",
    highlights: [""],
    includes: [""],
    excludes: [""],
    
    // NEW: Japanese defaults (empty strings for React controlled inputs)
    titleEmphasisJa: "",
    titleJa: "",
    leadTitleJa: "",
    leadDescriptionJa: "",
    descriptionJa: "",
    highlightsJa: [""],
    includesJa: [""],
    excludesJa: [""],

    activityDetails: [{ title: "", description: "" }],
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
        meals: [""],
        accommodation: [""],
      },
    ],
    destinations: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      alert("Please select at least one gallery image to upload.");
      return;
    }

    setLoading(true);
    try {
      // The service file handles the mapping to _en and _ja
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900">New Tour Package Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">Fill in all details below to publish your tour package.</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Language Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <Globe className="w-4 h-4 text-slate-500 ml-2" />
            <button
              type="button"
              onClick={() => setLocale("en")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${locale === "en" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLocale("ja")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${locale === "ja" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              Japanese
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" /> {loading ? "Uploading & Saving..." : "Save Package"}
          </button>
        </div>
      </div>

      {/* Pass `locale` to the text-heavy sections */}
      <BasicOverviewSection formData={formData} setFormData={setFormData} locale={locale} />

      {/* Lead Header Info (Moved into a wrapper to handle locale) */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-500" /> Lead Header Information ({locale === "en" ? "English" : "Japanese"})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Lead Title</label>
            <input
              type="text"
              required={locale === "en"}
              value={locale === "en" ? formData.leadTitle : (formData.leadTitleJa || "")}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({ ...prev, [locale === "en" ? "leadTitle" : "leadTitleJa"]: val }));
              }}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Lead Description</label>
            <input
              type="text"
              required={locale === "en"}
              value={locale === "en" ? formData.leadDescription : (formData.leadDescriptionJa || "")}
              onChange={(e) => {
                const val = e.target.value;
                setFormData((prev) => ({ ...prev, [locale === "en" ? "leadDescription" : "leadDescriptionJa"]: val }));
              }}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
            />
          </div>
        </div>
      </div>

      {/* These stay exactly as they are (No translation needed inside) */}
      <PricingSection formData={formData} setFormData={setFormData} />
      <GallerySection selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
      <PackageDestinationPicker
        selectedDestinations={formData.destinations}
        onChange={(destinations) => setFormData({ ...formData, destinations })}
      />

      {/* Pass `locale` to these sections */}
      <ActivitiesSection formData={formData} setFormData={setFormData} locale={locale} />
      <ItinerarySection formData={formData} setFormData={setFormData} locale={locale} />
      <HighlightsAndExtras formData={formData} setFormData={setFormData} locale={locale} />

      {/* Detailed Description */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <label className="block text-xs font-semibold text-slate-600">Detailed Description ({locale === "en" ? "English" : "Japanese"})</label>
        <textarea
          rows={4}
          required={locale === "en"}
          value={locale === "en" ? formData.description : (formData.descriptionJa || "")}
          onChange={(e) => {
            const val = e.target.value;
            setFormData((prev) => ({ ...prev, [locale === "en" ? "description" : "descriptionJa"]: val }));
          }}
          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none resize-y"
        />
      </div>
    </form>
  );
}