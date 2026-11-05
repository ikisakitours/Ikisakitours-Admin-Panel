"use client";

import { useState } from "react";
import { packageService } from "@/services/package.service";
import { PackageFormData } from "../types/package.types";
import { JsonUploaderSection } from "./sections/JsonUploaderSection";
import { BasicOverviewSection } from "./sections/BasicOverviewSection";
import { PricingSection } from "./sections/PricingSection";
import { GallerySection } from "./sections/GallerySection";
import { PackageDestinationPicker } from "./sections/PackageDestinationPicker";
import { ActivitiesSection } from "./sections/ActivitiesSection";
import { ItinerarySection } from "./sections/ItinerarySection";
import { HighlightsAndExtras } from "./sections/HighlightsAndExtras";
import { Save, Layers, Plus } from "lucide-react";

const INITIAL_FORM_STATE: PackageFormData = {
  type: "multiday",
  category: { en: "", ja: "" },
  origin: { en: "", ja: "" },
  duration: { en: "", ja: "" },
  badge: "new_arrival",
  slug: "",
  price: "",
  discount: "0",
  provider: "",
  destinations: [],

  // Multilingual JSONB Text Fields (Records)
  title: { en: "", ja: "" },
  titleEmphasis: { en: "", ja: "" },
  leadTitle: { en: "", ja: "" },
  leadDescription: { en: "", ja: "" },
  description: { en: "", ja: "" },

  // Multilingual JSONB Array Fields (Records of string arrays)
  highlights: { en: [""], ja: [""] },
  includes: { en: [""], ja: [""] },
  excludes: { en: [""], ja: [""] },

  // Nested JSONB Structures
  activityDetails: [
    {
      title: { en: "", ja: "" },
      description: { en: "", ja: "" },
    },
  ],

  itinerary: [
    {
      day: 1,
      travelTime: { en: "", ja: "" },
      title: { en: "", ja: "" },
      locations: { en: [""], ja: [""] },
      route: { en: [""], ja: [""] },
      details: { en: [""], ja: [""] },
      scenicStops: { en: [""], ja: [""] },
      activities: { en: [""], ja: [""] },
      meals: { en: "", ja: "" },
      accommodation: { en: "", ja: "" },
    },
  ],
};

export default function PackageFormWrapper() {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Dynamic language management
  const [locale, setLocale] = useState<string>("en");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(["en", "ja"]);

  const [formData, setFormData] = useState<PackageFormData>(INITIAL_FORM_STATE);

  const handleRecordChange = (field: "leadTitle" | "leadDescription" | "description", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...(prev[field] || {}),
        [locale]: value,
      },
    }));
  };

  const addCustomLanguage = () => {
    const lang = prompt("Enter new language code (e.g. fr, de, es, zh):")?.toLowerCase().trim();
    if (lang && !availableLanguages.includes(lang)) {
      setAvailableLanguages((prev) => [...prev, lang]);
      setLocale(lang);
    }
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

      // Reset form data and uploaded files back to initial empty state
      setSelectedFiles([]);
      setFormData(INITIAL_FORM_STATE);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* 1. Dynamic JSON Uploader & Language Navigation Hub */}
      <JsonUploaderSection
        formData={formData}
        setFormData={setFormData}
        activeLang={locale}
        setActiveLang={setLocale}
        availableLanguages={availableLanguages}
        setAvailableLanguages={setAvailableLanguages}
      />

      <form
        onSubmit={handleSubmit}
        className="w-full space-y-8 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs"
      >
        {/* Top Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">New Tour Package Configuration</h2>
            <p className="text-xs text-slate-500 mt-0.5">Fill in all details below to publish your tour package.</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Dynamic Language Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap">
              {availableLanguages.map((langKey) => (
                <button
                  key={langKey}
                  type="button"
                  onClick={() => setLocale(langKey)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all uppercase ${
                    locale === langKey ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {langKey}
                </button>
              ))}
              <button
                type="button"
                onClick={addCustomLanguage}
                className="p-1.5 text-slate-500 hover:text-indigo-600 text-xs flex items-center gap-0.5 font-semibold cursor-pointer"
                title="Add new language code"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer shrink-0"
            >
              <Save className="w-4 h-4" /> {loading ? "Uploading & Saving..." : "Save Package"}
            </button>
          </div>
        </div>

        {/* Basic Overview & Metadata */}
        <BasicOverviewSection formData={formData} setFormData={setFormData} locale={locale} />

        {/* Lead Header Info */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-500" /> Lead Header Information(For User Attraction) ({locale.toUpperCase()})
          </h3>
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Lead Title ({locale.toUpperCase()})
              </label>
              <input
                type="text"
                required={locale === "en"}
                value={formData.leadTitle?.[locale] || ""}
                onChange={(e) => handleRecordChange("leadTitle", e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Lead Description ({locale.toUpperCase()})
              </label>
              <textarea
                required={locale === "en"}
                value={formData.leadDescription?.[locale] || ""}
                onChange={(e) => handleRecordChange("leadDescription", e.target.value)}
                rows={2}
                className="w-full text-xs border border-slate-200 bg-white rounded-lg p-2.5 outline-none resize-y min-h-10 focus:border-slate-300 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Gallery Sections */}
        <PricingSection formData={formData} setFormData={setFormData} />
        <GallerySection selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />

        {/* Destination Sequence Picker */}
        <PackageDestinationPicker
          selectedDestinations={formData.destinations}
          onChange={(destinations) => setFormData({ ...formData, destinations })}
          locale={locale}
        />

        {/* Multilingual Sub-sections */}
        <ActivitiesSection formData={formData} setFormData={setFormData} locale={locale} />
        <ItinerarySection formData={formData} setFormData={setFormData} locale={locale} />
        <HighlightsAndExtras formData={formData} setFormData={setFormData} locale={locale} />

        {/* Detailed Description */}
        <div className="space-y-2 pt-4 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-600">
            Detailed Description ({locale.toUpperCase()})
          </label>
          <textarea
            rows={4}
            required={locale === "en"}
            value={formData.description?.[locale] || ""}
            onChange={(e) => handleRecordChange("description", e.target.value)}
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none resize-y"
          />
        </div>
      </form>
    </div>
  );
}
