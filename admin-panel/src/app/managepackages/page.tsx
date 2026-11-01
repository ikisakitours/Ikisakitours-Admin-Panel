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
import { ArrowLeft, Save, Globe } from "lucide-react"; // <-- Added Globe
import { PackageDestinationPicker } from "../addpackage/components/sections/PackageDestinationPicker";

export default function ManagePackagesPage() {
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loadingPackage, setLoadingPackage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<PackageFormData | null>(null);

  // NEW: Locale state for editing
  const [locale, setLocale] = useState<"en" | "ja">("en");

  // Triggered when user clicks "Edit" in the table
  const handleStartEdit = async (slug: string) => {
    setEditingSlug(slug);
    setLoadingPackage(true);
    try {
      const data = await packageService.getPackageBySlug(slug);
      
      // Ensure Ja fields exist so React doesn't complain about uncontrolled inputs
      setFormData({
        ...data,
        titleJa: data.titleJa || "",
        titleEmphasisJa: data.titleEmphasisJa || "",
        leadTitleJa: data.leadTitleJa || "",
        leadDescriptionJa: data.leadDescriptionJa || "",
        descriptionJa: data.descriptionJa || "",
        highlightsJa: data.highlightsJa || [""],
        includesJa: data.includesJa || [""],
        excludesJa: data.excludesJa || [""],
        activityDetails: data.activityDetails.map((a: any) => ({
          ...a,
          titleJa: a.titleJa || "",
          descriptionJa: a.descriptionJa || ""
        })),
        itinerary: data.itinerary.map((i: any) => ({
          ...i,
          titleJa: i.titleJa || "",
          locationsJa: i.locationsJa || [""],
          routeJa: i.routeJa || [""],
          detailsJa: i.detailsJa || [""],
          scenicStopsJa: i.scenicStopsJa || [""],
          activitiesJa: i.activitiesJa || [""],
          mealsJa: i.mealsJa || [""],
          accommodationJa: i.accommodationJa || [""],
        }))
      });
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
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Language Toggle for Edit Mode */}
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
        <PackagesTable onEdit={handleStartEdit} />
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
              />
              <ActivitiesSection formData={formData} setFormData={safeSetFormData} locale={locale} />
              <ItinerarySection formData={formData} setFormData={safeSetFormData} locale={locale} />
              <HighlightsAndExtras formData={formData} setFormData={safeSetFormData} locale={locale} />

              {/* Lead Header Info (Added to edit page as well) */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  Lead Header Information ({locale === "en" ? "English" : "Japanese"})
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
                        setFormData((prev: any) => ({ ...prev, [locale === "en" ? "leadTitle" : "leadTitleJa"]: val }));
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
                        setFormData((prev: any) => ({ ...prev, [locale === "en" ? "leadDescription" : "leadDescriptionJa"]: val }));
                      }}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="space-y-2 pt-4 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-600">Detailed Description ({locale === "en" ? "English" : "Japanese"})</label>
                <textarea
                  rows={4}
                  required={locale === "en"}
                  value={locale === "en" ? formData.description : (formData.descriptionJa || "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData((prev: any) => ({ ...prev, [locale === "en" ? "description" : "descriptionJa"]: val }));
                  }}
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