"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { PackagesTable } from "./components/PackagesTable";
import { PackagesSummaryBar } from "./components/PackagesSummaryBar";
import { packageService, type PackageListItem } from "@/services/package.service";
import { PackageFormData } from "@/app/addpackage/types/package.types";
import { BasicOverviewSection } from "@/app/addpackage/components/sections/BasicOverviewSection";
import { PricingSection } from "@/app/addpackage/components/sections/PricingSection";
import { ActivitiesSection } from "@/app/addpackage/components/sections/ActivitiesSection";
import { ItinerarySection } from "@/app/addpackage/components/sections/ItinerarySection";
import { HighlightsAndExtras } from "@/app/addpackage/components/sections/HighlightsAndExtras";
import { PackageDestinationPicker } from "../addpackage/components/sections/PackageDestinationPicker";
import { AdminDeleteModal } from "@/components/AdminDeleteModal";
import { AdminToast, type AdminToastState, type ToastVariant } from "@/components/AdminToast";
import { useFormDraft } from "@/hooks/useFormDraft";
import { DraftRecoveryBanner } from "@/components/DraftRecoveryBanner";
import {
  ArrowLeft,
  Save,
  Globe,
  Plus,
  RefreshCw,
  Search,
  Table2,
  LayoutGrid,
  X,
  AlertTriangle,
} from "lucide-react";

export default function ManagePackagesPage() {
  const [packages, setPackages] = useState<PackageListItem[]>([]);
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [listError, setListError] = useState<string | null>(null);

  // Edit Mode States
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [loadingPackage, setLoadingPackage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<PackageFormData | null>(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "live" | "hidden">("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Deletion Modal & State
  const [pkgToDelete, setPkgToDelete] = useState<PackageListItem | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [updatingSlug, setUpdatingSlug] = useState<string | null>(null);

  // Dynamic language management
  const [locale, setLocale] = useState<string>("en");
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(["en", "ja"]);

  // Toast
  const [toast, setToast] = useState<AdminToastState | null>(null);
  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const fetchPackages = useCallback(async () => {
    try {
      setLoadingList(true);
      setListError(null);
      const data = await packageService.getAllPackages();
      setPackages(data || []);
    } catch (err: any) {
      const msg = err.message || "Failed to load tour packages";
      setListError(msg);
      notify(msg, "error");
    } finally {
      setLoadingList(false);
    }
  }, [notify]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchPackages();
    });
  }, [fetchPackages]);

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
      if (Array.isArray(data.pricingConfig?.pricingNotes)) {
        data.pricingConfig.pricingNotes.forEach((n) => {
          checkObj(n.title);
          checkObj(n.description);
        });
      }
      if (Array.isArray(data.pricingNotes)) {
        data.pricingNotes.forEach((n) => {
          checkObj(n.title);
          checkObj(n.description);
        });
      }

      setAvailableLanguages(Array.from(discoveredLangs));
      setFormData(data);
    } catch (err: any) {
      notify("Failed to load package details: " + err.message, "error");
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
      clearDraft();
      notify("Package updated successfully!", "success");
      setEditingSlug(null);
      setFormData(null);
      fetchPackages();
    } catch (err: any) {
      notify("Error updating package: " + err.message, "error");
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

  // Delete Action
  const confirmDelete = async () => {
    if (!pkgToDelete?.slug) return;

    try {
      setDeletingSlug(pkgToDelete.slug);
      await packageService.deletePackage(pkgToDelete.slug);
      setPackages((prev) => prev.filter((p) => p.slug !== pkgToDelete.slug));
      notify(`Package "${pkgToDelete.slug}" deleted successfully.`, "info");
      setPkgToDelete(null);
    } catch (err: any) {
      notify(err.message || "Failed to delete package", "error");
    } finally {
      setDeletingSlug(null);
    }
  };

  // Visibility toggle handler (Point 05)
  const handleToggleVisibility = async (pkg: PackageListItem) => {
    try {
      setUpdatingSlug(pkg.slug);
      const newLiveStatus = pkg.isLive === false ? true : false;
      await packageService.toggleVisibility(pkg.slug, newLiveStatus);
      setPackages((prev) =>
        prev.map((p) => (p.slug === pkg.slug ? { ...p, isLive: newLiveStatus } : p))
      );
      notify(
        `Package "${pkg.slug}" is now ${newLiveStatus ? "Live on public website" : "Hidden (Draft / Offline)"}`,
        newLiveStatus ? "success" : "info"
      );
    } catch (err: any) {
      notify(err.message || "Failed to update package visibility", "error");
    } finally {
      setUpdatingSlug(null);
    }
  };

  // Filtered Packages
  const filteredPackages = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return packages.filter((pkg) => {
      // 1. Search Query
      if (q) {
        const enTitle = (typeof pkg.title === "string" ? pkg.title : pkg.title?.en || "").toLowerCase();
        const jaTitle = (typeof pkg.title === "object" ? pkg.title?.ja || "" : "").toLowerCase();
        const slug = (pkg.slug || "").toLowerCase();
        const matches = enTitle.includes(q) || jaTitle.includes(q) || slug.includes(q);
        if (!matches) return false;
      }

      // 2. Type Filter
      if (typeFilter !== "all" && pkg.type !== typeFilter) return false;

      // 3. Visibility Filter
      const isLive = pkg.isLive !== false;
      if (visibilityFilter === "live" && !isLive) return false;
      if (visibilityFilter === "hidden" && isLive) return false;

      return true;
    });
  }, [packages, searchQuery, typeFilter, visibilityFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    typeFilter !== "all" ||
    visibilityFilter !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    setVisibilityFilter("all");
  };

  // Helper type-safe setter for sub-components
  const safeSetFormData = setFormData as React.Dispatch<React.SetStateAction<PackageFormData>>;

  // Human-readable package title for the edit header (instead of raw slug)
  const displayEditingTitle = useMemo(() => {
    if (!editingSlug) return "";
    if (formData?.title) {
      if (typeof formData.title === "string") return formData.title;
      return (
        formData.title[locale] ||
        formData.title.en ||
        Object.values(formData.title)[0] ||
        editingSlug
      );
    }
    const found = packages.find((p) => p.slug === editingSlug);
    if (found?.title) {
      if (typeof found.title === "string") return found.title;
      return (
        found.title[locale] ||
        found.title.en ||
        Object.values(found.title)[0] ||
        editingSlug
      );
    }
    return editingSlug;
  }, [editingSlug, formData, locale, packages]);

  // Draft auto-save and crash recovery for package editor
  const draftKey = editingSlug ? `ikisaki_draft_package_edit_${editingSlug}` : "ikisaki_draft_package_edit";
  const {
    hasDraft,
    draftSavedAt,
    lastSaved,
    isSaving,
    restoreDraft,
    discardDraft,
    saveDraftNow,
    clearDraft,
    showLeaveConfirm,
    cancelLeave,
    confirmLeave,
  } = useFormDraft<PackageFormData>({
    storageKey: draftKey,
    formData: formData || ({} as PackageFormData),
    setFormData: (restored) => {
      const langs = new Set<string>(["en", "ja"]);
      const scan = (obj: any) => {
        if (obj && typeof obj === "object" && !Array.isArray(obj)) {
          Object.keys(obj).forEach((k) => {
            if (k.length <= 5) langs.add(k);
          });
        }
      };
      scan(restored.title);
      scan(restored.leadTitle);
      scan(restored.description);
      if (Array.isArray(restored.pricingConfig?.pricingNotes)) {
        restored.pricingConfig.pricingNotes.forEach((n) => {
          scan(n.title);
          scan(n.description);
        });
      }
      if (Array.isArray(restored.pricingNotes)) {
        restored.pricingNotes.forEach((n) => {
          scan(n.title);
          scan(n.description);
        });
      }
      setAvailableLanguages(Array.from(langs));
      setFormData(restored);
    },
    enabled: Boolean(editingSlug && formData),
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {editingSlug ? `Edit Package: ${displayEditingTitle}` : "Manage Tour Packages"}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {editingSlug
                ? "Modify package details, pricing tiers, itineraries, and inclusions."
                : "Manage bookable multi-day tours and single-day excursions across all markets."}
            </p>
          </div>

          {editingSlug ? (
            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              {/* Dynamic Language Toggle for Edit Mode */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs flex-wrap">
                <Globe className="w-4 h-4 text-slate-500 ml-2" />
                {availableLanguages.map((langKey) => (
                  <button
                    key={langKey}
                    type="button"
                    onClick={() => setLocale(langKey)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all uppercase cursor-pointer ${
                      locale === langKey
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {langKey}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={addCustomLanguage}
                  className="p-1.5 text-slate-500 hover:text-emerald-700 text-xs flex items-center gap-0.5 font-bold cursor-pointer"
                  title="Add new language code"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingSlug(null);
                  setFormData(null);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> <span>Back</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* View Mode Toggle */}
              <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode("table")}
                  title="Table View"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    viewMode === "table"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Table2 className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  title="Cards View"
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
                    viewMode === "cards"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Cards</span>
                </button>
              </div>

              {/* Refresh */}
              <button
                type="button"
                disabled={loadingList}
                onClick={fetchPackages}
                title="Reload packages"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingList ? "animate-spin text-emerald-600" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              {/* Add Package Link */}
              <Link
                href="/addpackage"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Package</span>
              </Link>
            </div>
          )}
        </div>

        {/* VIEW STATE 1: CATALOG OVERVIEW */}
        {!editingSlug && (
          <>
            {/* Executive KPI Stat Bar */}
            <PackagesSummaryBar packages={packages} />

            {/* Filter & Search Bar */}
            <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative w-full sm:w-64 lg:w-72 shrink-0">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tour packages by title or slug..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-9 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown Filters */}
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    aria-label="Filter by package type"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
                  >
                    <option value="all">All Tour Types ({packages.length})</option>
                    <option value="multiday">Multi-Day Tours</option>
                    <option value="oneday">One-Day Excursions</option>
                  </select>

                  {/* Visibility Filter */}
                  <select
                    aria-label="Filter by visibility"
                    value={visibilityFilter}
                    onChange={(e) => setVisibilityFilter(e.target.value as any)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
                  >
                    <option value="all">All Visibility</option>
                    <option value="live">Live on Site</option>
                    <option value="hidden">Hidden / Drafts</option>
                  </select>

                  {/* Reset Filter Button */}
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Error state */}
            {listError ? (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
                <p className="text-sm font-semibold text-red-700">{listError}</p>
                <button
                  type="button"
                  onClick={fetchPackages}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <PackagesTable
                packages={filteredPackages}
                loading={loadingList}
                deletingSlug={deletingSlug}
                updatingSlug={updatingSlug}
                onEdit={handleStartEdit}
                onDelete={(pkg) => setPkgToDelete(pkg)}
                onToggleVisibility={handleToggleVisibility}
                viewMode={viewMode}
                locale={locale}
              />
            )}
          </>
        )}

        {/* VIEW STATE 2: EDIT FORM VIEW */}
        {editingSlug && (
          <>
            {loadingPackage || !formData ? (
              <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                Loading package configuration for{" "}
                <span className="font-mono text-emerald-600 font-bold">{editingSlug}</span>...
              </div>
            ) : (
              <div className="space-y-4">
                <DraftRecoveryBanner
                  hasDraft={hasDraft}
                  draftSavedAt={draftSavedAt}
                  onRestore={restoreDraft}
                  onDiscard={discardDraft}
                  lastSaved={lastSaved}
                  isSaving={isSaving}
                  onSaveNow={saveDraftNow}
                  entityName={`"${editingSlug}" Tour Package`}
                  showLeaveConfirm={showLeaveConfirm}
                  onCancelLeave={cancelLeave}
                  onConfirmLeave={confirmLeave}
                />

                <form
                  onSubmit={handleUpdate}
                  className="w-full space-y-8 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200 shadow-xs"
                >
                {/* Pass locale down to all sections */}
                <BasicOverviewSection formData={formData} setFormData={safeSetFormData} locale={locale} />
                <PricingSection formData={formData} setFormData={safeSetFormData} locale={locale} />
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
                        className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-500"
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
                        className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none focus:border-emerald-500"
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
                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none resize-y focus:border-emerald-500"
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
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer disabled:opacity-50 shadow-md shadow-emerald-600/20"
                  >
                    <Save className="w-4 h-4" />{" "}
                    <span>{submitting ? "Saving Changes..." : "Update Package"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      )}

        {/* Unified Luxury AdminDeleteModal */}
        <AdminDeleteModal
          isOpen={Boolean(pkgToDelete)}
          title="Delete Tour Package?"
          description="This action will permanently delete this package and its associated pricing and itineraries from your system database."
          itemTitle={
            typeof pkgToDelete?.title === "string"
              ? pkgToDelete.title
              : pkgToDelete?.title?.en || pkgToDelete?.title?.ja || "Untitled Tour Package"
          }
          itemSubtitle={
            pkgToDelete?.slug
              ? `Slug: /${pkgToDelete.slug} • Type: ${
                  pkgToDelete.type === "multiday" ? "Multi-Day Tour" : "One-Day Excursion"
                }`
              : undefined
          }
          loading={Boolean(deletingSlug)}
          onClose={() => setPkgToDelete(null)}
          onConfirm={confirmDelete}
        />

        {/* Global AdminToast */}
        <AdminToast toast={toast} onDismiss={() => setToast(null)} />
      </div>
    </div>
  );
}
