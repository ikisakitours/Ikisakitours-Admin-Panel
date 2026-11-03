"use client";

import { useState } from "react";
import { PackagesTable } from "./components/PackagesTable";
import { packageService } from "@/services/package.service";
import { PackageFormData } from "@/app/addpackage/types/package.types";
import { BasicOverviewSection } from "@/app/addpackage/components/sections/BasicOverviewSection";
import { PricingSection } from "@/app/addpackage/components/sections/PricingSection";
import { ActivitiesSection } from "@/app/addpackage/components/sections/ActivitiesSection";
import { ItinerarySection } from "@/app/addpackage/components/sections/ItinerarySection";
import { HighlightsAndExtras } from "@/app/addpackage/components/sections/HighlightsAndExtras";
import { ArrowLeft, Save, Globe, Plus } from "lucide-react";
import { PackageDestinationPicker } from "../addpackage/components/sections/PackageDestinationPicker";

export default function ManagePackagesPage() {
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loadingPackage, setLoadingPackage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<PackageFormData | null>(null);

  // Dynamic language management
  const [locale, setLocale] = useState<string>("en");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(["en", "ja"]);

  // Triggered when user clicks "Edit" in the table
  const handleStartEdit = async (slug: string) => {
    setEditingSlug(slug);
    setLoadingPackage(true);
    try {
      const data = await packageService.getPackageBySlug(slug);

      // Extract any additional languages dynamically present in the fetched record dictionaries
      const discoveredLangs = new Set<string>(["en", "ja"]);
      const checkObj = (obj: any) => {
        if (obj && typeof obj === "object" && !Array.isArray(obj)) {
          Object.keys(obj).forEach((k) => {
            if (k.length <= 5) discoveredLangs.add(k);
          });
        }
      };

      checkObj(data.title);
      checkObj(data.leadTitle);
      checkObj(data.description);

      setAvailableLanguages(Array.from(discoveredLangs));
      setFormData(data);
    } catch (err: any) {
      alert("Failed to load package details: " + err.message);
      setEditingSlug(null);
    } finally {
      setLoadingPackage(false);
    }
  };

  // Submit text-only updates via PATCH
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !editingSlug) return;

    setSubmitting(true);
    try {
      await packageService.updatePackageTextOnly(editingSlug, formData);
      alert("Package updated successfully!");
      setEditingSlug(null);
      setFormData(null);
    } catch (err: any) {
      alert("Error updating package: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordChange = (
    field: "leadTitle" | "leadDescription" | "description",
    value: string
  ) => {
    if (!formData) return;
    setFormData({
      ...formData,
      [field]: {
        ...(formData[field] || {}),
        [locale]: value,
      },
    });
  };

  const addCustomLanguage = () => {
    const lang = prompt("Enter new language code (e.g. fr, de, es, zh):")?.toLowerCase().trim();
    if (lang && !availableLanguages.includes(lang)) {
      setAvailableLanguages((prev) => [...prev, lang]);
      setLocale(lang);
    }
  };

  // Helper type-safe setter for sub-components
  const safeSetFormData = setFormData as React.Dispatch<React.SetStateAction<PackageFormData>>;

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-6">

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {editingSlug ? `Edit Package: ${editingSlug}` : "Manage Tour Packages"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {editingSlug
              ? "Modify package details, pricing, itineraries, and snapshots below."
              : "View, edit, or remove active packages from your system database."}
          </p>
        </div>

        {editingSlug && (
          <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
            {/* Dynamic Language Toggle for Edit Mode */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap">
              <Globe className="w-4 h-4 text-slate-500 ml-2" />
              {availableLanguages.map((langKey) => (
                <button
                  key={langKey}
                  type="button"
                  onClick={() => setLocale(langKey)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all uppercase ${locale === langKey
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
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
              onClick={() => {
                setEditingSlug(null);
                setFormData(null);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          </div>
        )}
      </div>

      {/* VIEW STATE 1: TABLE VIEW */}
      {!editingSlug && (
        <PackagesTable onEdit={handleStartEdit} locale={locale} />
      )}

      {/* VIEW STATE 2: EDIT FORM VIEW */}
      {editingSlug && (
        <>
          {loadingPackage || !formData ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
              Loading package configuration for <span className="font-mono text-indigo-600 font-bold">{editingSlug}</span>...
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="w-full space-y-8 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs">

              {/* Pass locale down to all sections */}
              <BasicOverviewSection formData={formData} setFormData={safeSetFormData} locale={locale} />
              <PricingSection formData={formData} setFormData={safeSetFormData} />
              <PackageDestinationPicker
                selectedDestinations={formData.destinations}
                onChange={(destinations) => setFormData({ ...formData, destinations })}
                locale={locale}
              />
              <ActivitiesSection formData={formData} setFormData={safeSetFormData} locale={locale} />
              <ItinerarySection formData={formData} setFormData={safeSetFormData} locale={locale} />
              <HighlightsAndExtras formData={formData} setFormData={safeSetFormData} locale={locale} />

              {/* Lead Header Info */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  Lead Header Information ({locale.toUpperCase()})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <input
                      type="text"
                      required={locale === "en"}
                      value={formData.leadDescription?.[locale] || ""}
                      onChange={(e) => handleRecordChange("leadDescription", e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>
              </div>

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

              {/* FOOTER ACTIONS */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSlug(null);
                    setFormData(null);
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-600/20"
                >
                  <Save className="w-4 h-4" /> {submitting ? "Saving Changes..." : "Update Package"}
                </button>
              </div>
            </form>
          )}
        </>
      )}

    </div>
  );
}