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
import { ArrowLeft, Save } from "lucide-react";
import { PackageDestinationPicker } from "../addpackage/components/sections/PackageDestinationPicker";

export default function ManagePackagesPage() {
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loadingPackage, setLoadingPackage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<PackageFormData | null>(null);

  // Triggered when user clicks "Edit" in the table
  const handleStartEdit = async (slug: string) => {
    setEditingSlug(slug);
    setLoadingPackage(true);
    try {
      const data = await packageService.getPackageBySlug(slug);
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

  // Helper type-safe setter for sub-components since formData is checked for null before rendering form
  const safeSetFormData = setFormData as React.Dispatch<React.SetStateAction<PackageFormData>>;

  return (
    <div className="p-6 sm:p-10 max-w-6xl mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-5">
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
          <button
            onClick={() => {
              setEditingSlug(null);
              setFormData(null);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Table
          </button>
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
              
              {/* Reusing your exact modular form sections with safe state casting */}
              <BasicOverviewSection formData={formData} setFormData={safeSetFormData} />
              <PricingSection formData={formData} setFormData={safeSetFormData} />
              <PackageDestinationPicker
                selectedDestinations={formData.destinations}
                onChange={(destinations) => setFormData({ ...formData, destinations })}
              />
              <ActivitiesSection formData={formData} setFormData={safeSetFormData} />
              <ItinerarySection formData={formData} setFormData={safeSetFormData} />
              <HighlightsAndExtras formData={formData} setFormData={safeSetFormData} />

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