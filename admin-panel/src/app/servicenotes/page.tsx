"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Briefcase,
  Car,
  Compass,
  Edit2,
  Eye,
  FileText,
  Filter,
  Globe,
  LayoutGrid,
  Loader2,
  Plane,
  RefreshCw,
  Search,
  Sparkles,
  Table2,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  ServiceNotePayload,
  serviceNotesService,
} from "@/services/service-notes.service";
import ServiceNoteFormWrapper from "./ServiceNoteFormWrapper";
import { AdminToast, type AdminToastState, type ToastVariant } from "@/components/AdminToast";

interface ServiceNoteItem extends ServiceNotePayload {
  id: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export default function ServiceNotesPage() {
  const [notesList, setNotesList] = useState<ServiceNoteItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [currentFormData, setCurrentFormData] = useState<ServiceNotePayload | null>(null);

  // Filters & Controls
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [vehicleModelFilter, setVehicleModelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Notes Modal Preview
  const [viewingNotesItem, setViewingNotesItem] = useState<ServiceNoteItem | null>(null);
  const [notesModalLocale, setNotesModalLocale] = useState<"en" | "ja">("en");

  const [toast, setToast] = useState<AdminToastState | null>(null);

  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await serviceNotesService.getAllServiceNotes();
      setNotesList(Array.isArray(data) ? data : []);
    } catch (error: any) {
      notify(error.message || "Failed to load service guidelines.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleFormSubmit = async (formData: ServiceNotePayload) => {
    try {
      if (editingId) {
        await serviceNotesService.updateServiceNote(editingId, formData);
        notify("Service guideline updated successfully!", "success");
      } else {
        await serviceNotesService.createServiceNote(formData);
        notify("New service guideline created successfully!", "success");
      }
      handleCancelEdit();
      fetchNotes();
    } catch (error: any) {
      notify(error.message || "Something went wrong while saving.", "error");
    }
  };

  const handleEdit = (item: ServiceNoteItem) => {
    setEditingId(item.id);
    setCurrentFormData({
      serviceType: item.serviceType || "custom",
      vehicleType: item.vehicleType || "",
      startingPrice: item.startingPrice || "",
      vehicleCapacity: item.vehicleCapacity || "",
      luggages: item.luggages || "",
      withDriverPrice: item.withDriverPrice || "",
      withGuidePrice: item.withGuidePrice || "",
      withDriverAndGuidePrice: item.withDriverAndGuidePrice || "",
      notes: item.notes || { en: [""], ja: [""] },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (item: ServiceNoteItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete the guideline for "${item.vehicleType}" (${item.serviceType})?`
    );
    if (!confirmed) return;

    try {
      setDeletingId(item.id);
      await serviceNotesService.deleteServiceNote(item.id);
      notify(`Deleted guideline for ${item.vehicleType}`, "success");
      if (editingId === item.id) handleCancelEdit();
      fetchNotes();
    } catch (error: any) {
      notify(error.message || "Failed to delete guideline.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCurrentFormData(null);
  };

  // Distinct vehicle models available across the list
  const availableVehicleModels = useMemo(() => {
    const map = new Map<string, string>();
    for (const n of notesList) {
      if (n.vehicleType && n.vehicleType.trim()) {
        const key = n.vehicleType.trim().toLowerCase();
        if (!map.has(key)) {
          map.set(key, n.vehicleType.trim());
        }
      }
    }
    return Array.from(map.values()).sort();
  }, [notesList]);

  // Accurate Fleet Statistics (Point 03)
  const stats = useMemo(() => {
    let custom = 0;
    let chauffeur = 0;
    let transfer = 0;
    const uniqueSet = new Set<string>();

    for (const n of notesList) {
      if (n.vehicleType) {
        uniqueSet.add(n.vehicleType.trim().toLowerCase());
      }
      if (n.serviceType === "custom") custom++;
      else if (n.serviceType === "chauffeur") chauffeur++;
      else if (n.serviceType === "transfer") transfer++;
    }

    return {
      distinctModelsCount: uniqueSet.size,
      totalRules: notesList.length,
      custom,
      chauffeur,
      transfer,
    };
  }, [notesList]);

  // Filtered Guidelines (Point 04)
  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return notesList.filter((n) => {
      if (categoryFilter !== "all" && n.serviceType !== categoryFilter) return false;
      if (
        vehicleModelFilter !== "all" &&
        (n.vehicleType || "").trim().toLowerCase() !== vehicleModelFilter.toLowerCase()
      ) {
        return false;
      }
      if (q) {
        const vehicle = (n.vehicleType || "").toLowerCase();
        const price = (n.startingPrice || "").toLowerCase();
        const notesEn = (n.notes?.en || []).join(" ").toLowerCase();
        const notesJa = (n.notes?.ja || []).join(" ").toLowerCase();
        if (
          !vehicle.includes(q) &&
          !price.includes(q) &&
          !notesEn.includes(q) &&
          !notesJa.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [notesList, categoryFilter, vehicleModelFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/60 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Hero Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <Briefcase className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Service Guidelines &amp; Vehicle Specs
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Configure vehicle specifications, passenger capacities, pricing tiers, and multilingual booking guidelines.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchNotes}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Summary KPI Strip — Accurate Distinct Vehicle Models (Point 03) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => {
            setCategoryFilter("all");
            setVehicleModelFilter("all");
          }}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            categoryFilter === "all" && vehicleModelFilter === "all"
              ? "bg-slate-900 text-white border-slate-900 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">Fleet Models</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-xl font-black mt-1">{stats.distinctModelsCount} <span className="text-xs font-normal opacity-70">Models</span></p>
          <p className="text-[10px] opacity-70 mt-0.5">{stats.totalRules} guideline rules active</p>
        </button>

        <button
          type="button"
          onClick={() => setCategoryFilter(categoryFilter === "chauffeur" ? "all" : "chauffeur")}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            categoryFilter === "chauffeur"
              ? "bg-purple-600 text-white border-purple-600 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-purple-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">Chauffeur</span>
            <Car className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <p className="text-xl font-black mt-1">{stats.chauffeur} <span className="text-xs font-normal opacity-70">Rules</span></p>
          <p className="text-[10px] opacity-70 mt-0.5">Private driver hire</p>
        </button>

        <button
          type="button"
          onClick={() => setCategoryFilter(categoryFilter === "custom" ? "all" : "custom")}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            categoryFilter === "custom"
              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-indigo-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">Custom Tour</span>
            <Compass className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <p className="text-xl font-black mt-1">{stats.custom} <span className="text-xs font-normal opacity-70">Rules</span></p>
          <p className="text-[10px] opacity-70 mt-0.5">Tailored itineraries</p>
        </button>

        <button
          type="button"
          onClick={() => setCategoryFilter(categoryFilter === "transfer" ? "all" : "transfer")}
          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
            categoryFilter === "transfer"
              ? "bg-teal-600 text-white border-teal-600 shadow-sm"
              : "bg-white text-slate-800 border-slate-200 hover:border-teal-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">Transfers</span>
            <Plane className="w-3.5 h-3.5 text-teal-500" />
          </div>
          <p className="text-xl font-black mt-1">{stats.transfer} <span className="text-xs font-normal opacity-70">Rules</span></p>
          <p className="text-[10px] opacity-70 mt-0.5">Airport &amp; Intercity</p>
        </button>
      </div>

      {/* Editor Form Section */}
      <ServiceNoteFormWrapper
        key={editingId ?? "new"}
        initialData={currentFormData}
        editingId={editingId}
        onSubmit={handleFormSubmit}
        onCancel={handleCancelEdit}
      />

      {/* Configured Guidelines Section with Filter Toolbar & Professional View (Point 04) */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
        {/* Header & Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                Configured Service Guidelines ({filteredNotes.length})
              </h2>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === "table"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Table2 className="w-3.5 h-3.5" /> Table
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Cards
              </button>
            </div>
          </div>

          {/* Filter Bar (Search + Service Type + Vehicle Model) */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            {/* Search */}
            <div className="relative w-full sm:w-64 lg:w-72 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vehicle model, price, or guideline..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-emerald-500 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns right-aligned */}
            <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
              {/* Service Type Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="text-xs font-bold rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
              >
                <option value="all">All Service Types</option>
                <option value="chauffeur">Chauffeur</option>
                <option value="custom">Custom Tour</option>
                <option value="transfer">Transfer</option>
              </select>

              {/* Vehicle Model Filter */}
              <select
                value={vehicleModelFilter}
                onChange={(e) => setVehicleModelFilter(e.target.value)}
                className="text-xs font-bold rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-sm hover:border-slate-300 transition-colors"
              >
                <option value="all">All Vehicle Models</option>
                {availableVehicleModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>

              {(categoryFilter !== "all" || vehicleModelFilter !== "all" || searchQuery) && (
                <button
                  type="button"
                  onClick={() => {
                    setCategoryFilter("all");
                    setVehicleModelFilter("all");
                    setSearchQuery("");
                  }}
                  className="text-xs font-bold text-rose-600 hover:underline px-2 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Body: Table View (Default, Ultra-Clean) or Cards View */}
        {loading ? (
          <div className="p-8 text-center space-y-2">
            <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
            <p className="text-xs text-slate-400">Loading service guidelines...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="p-12 text-center space-y-2 border-dashed border-slate-200">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No service guidelines match your filters</p>
            <p className="text-xs text-slate-500">
              Try clearing search or filter options.
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* Table View: Professional, Scannable Overview (Point 04) */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3 pl-5 pr-3">Vehicle Model</th>
                  <th className="py-3 px-3">Service Line</th>
                  <th className="py-3 px-3">Starting Rate</th>
                  <th className="py-3 px-3">Capacity &amp; Luggage</th>
                  <th className="py-3 px-3">Driver / Guide Tiers</th>
                  <th className="py-3 px-3 text-center">Booking Guidelines</th>
                  <th className="py-3 pl-3 pr-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/80">
                {filteredNotes.map((item, idx) => {
                  const isTransfer = item.serviceType === "transfer";
                  const isChauffeur = item.serviceType === "chauffeur";
                  const isCustom = item.serviceType === "custom";
                  const notesCountEn = item.notes?.en?.filter(Boolean).length || 0;
                  const notesCountJa = item.notes?.ja?.filter(Boolean).length || 0;

                  return (
                    <tr
                      key={item.id}
                      className="odd:bg-white even:bg-slate-50/50 hover:bg-emerald-50/40 transition-colors"
                    >
                      {/* 1. Vehicle Model */}
                      <td className="py-3 pl-5 pr-3 align-middle whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70 font-bold">
                            <Car className="w-3.5 h-3.5" />
                          </span>
                          <div>
                            <p className="font-extrabold text-slate-900">{item.vehicleType}</p>
                            <span className="text-[10px] text-slate-400 font-mono">ID: #{String(item.id).slice(0, 6)}</span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Service Line Badge */}
                      <td className="py-3 px-3 align-middle whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                            isTransfer
                              ? "bg-teal-50 text-teal-700 border-teal-200"
                              : isChauffeur
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : "bg-indigo-50 text-indigo-700 border-indigo-200"
                          }`}
                        >
                          {isTransfer && <Plane className="w-3 h-3" />}
                          {isChauffeur && <Car className="w-3 h-3" />}
                          {isCustom && <Compass className="w-3 h-3" />}
                          <span className="capitalize">{item.serviceType?.replace("_", " ")}</span>
                        </span>
                      </td>

                      {/* 3. Starting Rate */}
                      <td className="py-3 px-3 align-middle whitespace-nowrap">
                        <span className="inline-flex items-center rounded-lg bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-bold text-emerald-800 text-xs">
                          From {item.startingPrice}
                        </span>
                      </td>

                      {/* 4. Capacity & Luggage */}
                      <td className="py-3 px-3 align-middle whitespace-nowrap text-slate-700 font-medium">
                        <span>{item.vehicleCapacity || "—"}</span>
                        <span className="text-slate-300 mx-1.5">•</span>
                        <span className="text-slate-500">{item.luggages || "—"}</span>
                      </td>

                      {/* 5. Driver / Guide Tiers */}
                      <td className="py-3 px-3 align-middle whitespace-nowrap">
                        {!isTransfer ? (
                          <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                            <span className="text-slate-400">Driver:</span>
                            <span className="font-bold text-slate-800">{item.withDriverPrice || "—"}</span>
                            <span className="text-slate-300 mx-1">|</span>
                            <span className="text-slate-400">Guide:</span>
                            <span className="font-bold text-slate-800">{item.withGuidePrice || "—"}</span>
                            <span className="text-slate-300 mx-1">|</span>
                            <span className="text-slate-400">Both:</span>
                            <span className="font-extrabold text-emerald-700">{item.withDriverAndGuidePrice || "—"}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/70">
                            Base Transfer Fare
                          </span>
                        )}
                      </td>

                      {/* 6. Booking Guidelines (Click to Preview Modal) */}
                      <td className="py-3 px-3 align-middle text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setViewingNotesItem(item);
                            setNotesModalLocale("en");
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                        >
                          <FileText className="w-3 h-3 text-slate-400" />
                          <span>{notesCountEn + notesCountJa} Bullets</span>
                          <span className="rounded bg-slate-100 px-1 text-[9px] text-slate-500 font-mono">EN/JA</span>
                        </button>
                      </td>

                      {/* 7. Actions */}
                      <td className="py-3 pl-3 pr-5 align-middle text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === item.id}
                            onClick={() => handleDelete(item)}
                            title="Delete guideline"
                            className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-1 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {deletingId === item.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View */
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotes.map((item) => {
              const isTransfer = item.serviceType === "transfer";
              const isChauffeur = item.serviceType === "chauffeur";
              const isCustom = item.serviceType === "custom";

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-2xs hover:shadow-sm transition-all border-l-4 border-l-emerald-500"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-[10px] font-bold border ${
                          isTransfer
                            ? "bg-teal-50 text-teal-700 border-teal-200"
                            : isChauffeur
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : "bg-indigo-50 text-indigo-700 border-indigo-200"
                        }`}
                      >
                        {isTransfer && <Plane className="w-3 h-3" />}
                        {isChauffeur && <Car className="w-3 h-3" />}
                        {isCustom && <Compass className="w-3 h-3" />}
                        <span className="capitalize">{item.serviceType?.replace("_", " ")}</span>
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleEdit(item)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === item.id}
                          onClick={() => handleDelete(item)}
                          className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between gap-2 mb-2">
                      <h3 className="text-base font-extrabold text-slate-900">{item.vehicleType}</h3>
                      <span className="font-extrabold text-emerald-800 text-xs">From {item.startingPrice}</span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      {item.vehicleCapacity} • {item.luggages}
                    </p>

                    {!isTransfer && (
                      <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100 flex justify-between font-semibold">
                        <span>Driver: {item.withDriverPrice}</span>
                        <span>Guide: {item.withGuidePrice}</span>
                        <span className="text-emerald-700">Both: {item.withDriverAndGuidePrice}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setViewingNotesItem(item);
                        setNotesModalLocale("en");
                      }}
                      className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Notes ({item.notes?.en?.length || 0} EN / {item.notes?.ja?.length || 0} JA)
                    </button>
                    <span className="text-[10px] text-slate-400 font-mono">#{String(item.id).slice(0, 6)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clean Notes Preview Modal (No Messy Scrolling on Main Page) */}
      {viewingNotesItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-slate-950 text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold">
                  {viewingNotesItem.vehicleType} — {viewingNotesItem.serviceType?.toUpperCase()}
                </h3>
                <p className="text-[10px] text-slate-400">Booking Guideline Bullet Points</p>
              </div>
              <button
                type="button"
                onClick={() => setViewingNotesItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Language Switcher */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" /> Language:
                </span>
                <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setNotesModalLocale("en")}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      notesModalLocale === "en" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    English (EN)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotesModalLocale("ja")}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      notesModalLocale === "ja" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500"
                    }`}
                  >
                    日本語 (JA)
                  </button>
                </div>
              </div>

              {/* Bullet list */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {(viewingNotesItem.notes?.[notesModalLocale] || []).filter(Boolean).length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-4 text-center">
                    No guideline bullet points entered for this language.
                  </p>
                ) : (
                  (viewingNotesItem.notes?.[notesModalLocale] || [])
                    .filter(Boolean)
                    .map((bullet, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 p-2 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed">{bullet}</p>
                      </div>
                    ))
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingNotesItem(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Universal Toast */}
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
