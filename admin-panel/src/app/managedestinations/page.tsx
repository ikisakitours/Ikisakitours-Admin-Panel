"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Table2,
  LayoutGrid,
  X,
  AlertTriangle,
} from "lucide-react";
import { destinationService, type DestinationPayload } from "@/services/destination.service";
import DestinationForm from "@/app/destinations/components/sections/DestinationForm";
import { DestinationTable } from "./components/DestinationTable";
import { DestinationCardList } from "./components/DestinationCardList";
import { DestinationSummaryBar } from "./components/DestinationSummaryBar";
import { AdminDeleteModal } from "@/components/AdminDeleteModal";
import { AdminToast, type AdminToastState, type ToastVariant } from "@/components/AdminToast";

export default function ManageDestinationsPage() {
  const [destinations, setDestinations] = useState<DestinationPayload[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [provinceFilter, setProvinceFilter] = useState<string>("all");
  const [coverageFilter, setCoverageFilter] = useState<"all" | "bilingual" | "monolingual">("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "live" | "hidden">("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Deletion Modal & State
  const [destToDelete, setDestToDelete] = useState<DestinationPayload | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Toast
  const [toast, setToast] = useState<AdminToastState | null>(null);
  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const fetchDestinations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await destinationService.getAdminDestinations();
      setDestinations(data || []);
    } catch (err: any) {
      const msg = err.message || "Failed to load destinations";
      setError(msg);
      notify(msg, "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const handleDestinationCreated = () => {
    setShowCreateForm(false);
    notify("Destination created successfully!", "success");
    fetchDestinations();
  };

  // Distinct Provinces for Filter Dropdown
  const distinctProvinces = useMemo(() => {
    const set = new Set<string>();
    for (const d of destinations) {
      const prov =
        d.province?.en?.trim() ||
        (typeof d.province === "string" ? d.province : "") ||
        Object.values(d.province || {})[0];
      if (prov) set.add(prov);
    }
    return Array.from(set).sort();
  }, [destinations]);

  // Filtered Destinations
  const filteredDestinations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return destinations.filter((dest) => {
      // 1. Search Query
      if (q) {
        const enTitle = (dest.title?.en || "").toLowerCase();
        const jaTitle = (dest.title?.ja || "").toLowerCase();
        const prov = (dest.province?.en || "").toLowerCase();
        const slug = (dest.slug || "").toLowerCase();
        const matches =
          enTitle.includes(q) ||
          jaTitle.includes(q) ||
          prov.includes(q) ||
          slug.includes(q);
        if (!matches) return false;
      }

      // 2. Province Filter
      if (provinceFilter !== "all") {
        const prov =
          dest.province?.en?.trim() ||
          (typeof dest.province === "string" ? dest.province : "") ||
          Object.values(dest.province || {})[0];
        if (prov !== provinceFilter) return false;
      }

      // 3. Coverage Filter
      const hasEn = Boolean(dest.title?.en?.trim());
      const hasJa = Boolean(dest.title?.ja?.trim());
      if (coverageFilter === "bilingual" && !(hasEn && hasJa)) return false;
      if (coverageFilter === "monolingual" && hasEn && hasJa) return false;

      // 4. Visibility Filter
      const isLive = dest.isLive !== false;
      if (visibilityFilter === "live" && !isLive) return false;
      if (visibilityFilter === "hidden" && isLive) return false;

      return true;
    });
  }, [destinations, searchQuery, provinceFilter, coverageFilter, visibilityFilter]);

  // Toggle Visibility Action
  const handleToggleVisibility = async (dest: DestinationPayload) => {
    if (!dest.id) return;
    const currentIsLive = dest.isLive !== false;
    const newIsLive = !currentIsLive;

    try {
      setUpdatingId(dest.id);
      await destinationService.toggleVisibility(dest.id, newIsLive);
      setDestinations((prev) =>
        prev.map((d) => (d.id === dest.id ? { ...d, isLive: newIsLive } : d))
      );
      notify(
        newIsLive
          ? "Destination is now LIVE on public website."
          : "Destination is now HIDDEN (draft mode).",
        newIsLive ? "success" : "info"
      );
    } catch (err: any) {
      notify(err.message || "Failed to update destination visibility", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Action
  const confirmDelete = async () => {
    if (!destToDelete?.id) return;

    try {
      setDeletingId(destToDelete.id);
      await destinationService.deleteDestination(destToDelete.id);
      setDestinations((prev) => prev.filter((d) => d.id !== destToDelete.id));
      notify("Destination removed from database.", "info");
      setDestToDelete(null);
    } catch (err: any) {
      notify(err.message || "Failed to delete destination", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    provinceFilter !== "all" ||
    coverageFilter !== "all" ||
    visibilityFilter !== "all";

  const resetFilters = () => {
    setSearchQuery("");
    setProvinceFilter("all");
    setCoverageFilter("all");
    setVisibilityFilter("all");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Manage Travel Destinations
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Curate, coordinate, and localize key Sri Lankan travel landmarks and sights.
            </p>
          </div>

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
              disabled={loading}
              onClick={fetchDestinations}
              title="Reload destinations"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Create New / Toggle Form */}
            <button
              type="button"
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showCreateForm ? "Close Form" : "Add Destination"}</span>
            </button>
          </div>
        </div>

        {/* Inline Create Form if toggled */}
        {showCreateForm && (
          <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-md animate-in fade-in duration-200">
            <DestinationForm onDestinationCreated={handleDestinationCreated} />
          </div>
        )}

        {/* Executive KPI Stat Bar */}
        <DestinationSummaryBar destinations={destinations} />

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
                placeholder="Search destinations by title, province, or slug..."
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
              {/* Province Filter */}
              <select
                aria-label="Filter by province"
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Provinces ({destinations.length})</option>
                {distinctProvinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>

              {/* Language Coverage Filter */}
              <select
                aria-label="Filter by language coverage"
                value={coverageFilter}
                onChange={(e) => setCoverageFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-2xs"
              >
                <option value="all">All Languages</option>
                <option value="bilingual">Bilingual (EN + JA)</option>
                <option value="monolingual">Monolingual Only</option>
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

        {/* Content Area */}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-sm font-semibold text-red-700">{error}</p>
            <button
              type="button"
              onClick={fetchDestinations}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        ) : viewMode === "table" ? (
          <DestinationTable
            destinations={filteredDestinations}
            loading={loading}
            deletingId={deletingId}
            updatingId={updatingId}
            onDelete={(dest) => setDestToDelete(dest)}
            onToggleVisibility={handleToggleVisibility}
          />
        ) : (
          <DestinationCardList
            destinations={filteredDestinations}
            deletingId={deletingId}
            updatingId={updatingId}
            onDelete={(dest) => setDestToDelete(dest)}
            onToggleVisibility={handleToggleVisibility}
          />
        )}

        {/* Unified Luxury AdminDeleteModal */}
        <AdminDeleteModal
          isOpen={Boolean(destToDelete)}
          title="Delete Destination?"
          description="This action will permanently remove this destination from the global guide and travel maps."
          itemTitle={
            typeof destToDelete?.title === "string"
              ? destToDelete.title
              : destToDelete?.title?.en || destToDelete?.title?.ja || "Untitled Destination"
          }
          itemSubtitle={
            destToDelete?.slug
              ? `Slug: /${destToDelete.slug} • Province: ${
                  typeof destToDelete.province === "string"
                    ? destToDelete.province
                    : destToDelete.province?.en || "Sri Lanka"
                }`
              : undefined
          }
          loading={Boolean(deletingId)}
          onClose={() => setDestToDelete(null)}
          onConfirm={confirmDelete}
        />

        {/* Global AdminToast */}
        <AdminToast toast={toast} onDismiss={() => setToast(null)} />
      </div>
    </div>
  );
}
