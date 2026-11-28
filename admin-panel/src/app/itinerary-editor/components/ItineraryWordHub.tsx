"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  FolderOpen,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { ItineraryDocument } from "../types/itinerary.types";
import { AdminDeleteModal } from "@/components/AdminDeleteModal";

interface ItineraryWordHubProps {
  drafts: ItineraryDocument[];
  onOpenDocument: (doc: ItineraryDocument) => void;
  onNewBlank: () => void;
  onNewFromPackage?: (packageSlug: string) => void;
  onDeleteDraft: (id: string) => void;
}

export function ItineraryWordHub({
  drafts,
  onOpenDocument,
  onNewBlank,
  onDeleteDraft,
}: ItineraryWordHubProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"recent" | "all">("recent");
  const [docToDelete, setDocToDelete] = useState<{ id: string; title: string } | null>(null);

  const filteredDrafts = drafts.filter((d) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      d.title.toLowerCase().includes(q) ||
      d.referenceNo.toLowerCase().includes(q) ||
      d.tourName.toLowerCase().includes(q) ||
      d.guests.some((g) => g.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="max-w-[1400px] mx-auto py-4 sm:py-6 px-4 space-y-8 animate-in fade-in duration-200">
      {/* ── TOP SECTION: NEW TEMPLATES (Word Style) ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            New Itinerary Document
          </h2>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline">
            Create blank document or load directly from registered tour bookings
          </span>
        </div>

        {/* Templates Grid Cards (Blank & From Booking only per user request) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Card 1: Blank Document */}
          <div
            onClick={onNewBlank}
            className="group relative flex flex-col items-center justify-center p-4 h-48 rounded-2xl border-2 border-dashed border-slate-300 bg-white hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer shadow-xs hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-600 transition-colors mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-slate-900 group-hover:text-emerald-700 text-center">
              Blank Document
            </span>
            <span className="text-[10px] text-slate-400 text-center mt-1">
              Start fresh with custom days
            </span>
          </div>

          {/* Card 2: Select from Bookings */}
          <Link
            href="/tours"
            className="group relative flex flex-col items-center justify-center p-4 h-48 rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/60 to-white hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer text-center"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-xs font-black text-indigo-950 group-hover:text-indigo-700">
              From Tour Booking
            </span>
            <span className="text-[10px] text-slate-500 mt-1">
              Pick registered booking at /tours
            </span>
            <span className="mt-2 inline-flex items-center gap-1 text-[9px] font-bold text-indigo-600 group-hover:underline">
              Go to Tours <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* ── BOTTOM SECTION: RECENT / SAVED DOCUMENTS (Word Style) ── */}
      <section className="space-y-4">
        {/* Filter Bar & Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/70 w-fit text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("recent")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === "recent"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Recent Itineraries ({drafts.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Documents
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by client or reference..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 shadow-xs"
            />
          </div>
        </div>

        {/* Documents Table / List */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          {filteredDrafts.length === 0 ? (
            <div className="py-14 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No saved itinerary documents found</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate an itinerary from a tour booking at <Link href="/tours" className="text-emerald-600 underline font-bold">Tour Bookings</Link> or click &ldquo;Blank Document&rdquo; above.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3 pl-4 pr-3">Document Title &amp; Guest</th>
                  <th className="py-3 px-3 w-[150px]">Reference</th>
                  <th className="py-3 px-3 min-w-[180px] hidden md:table-cell">Tour Dates</th>
                  <th className="py-3 px-3 w-[160px]">Date Modified</th>
                  <th className="py-3 pl-3 pr-4 text-right w-[150px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDrafts.map((d) => {
                  const dateStr = new Date(d.updatedAt || d.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr
                      key={d.id}
                      onClick={() => onOpenDocument(d)}
                      className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Document Title & Guest */}
                      <td className="py-3 pl-4 pr-3 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-colors">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <span className="font-extrabold text-slate-900 group-hover:text-emerald-700 block truncate">
                              {d.title || d.tourName}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {d.tourName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Reference Badge */}
                      <td className="py-3 px-3 align-middle whitespace-nowrap">
                        <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700">
                          {d.referenceNo}
                        </span>
                      </td>

                      {/* Tour Dates */}
                      <td className="py-3 px-3 align-middle whitespace-nowrap text-slate-600 font-mono text-[11px] hidden md:table-cell">
                        {d.tourDates || "—"}
                      </td>

                      {/* Date Modified */}
                      <td className="py-3 px-3 align-middle whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {dateStr}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 pl-3 pr-4 align-middle text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onOpenDocument(d)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] border border-emerald-200 transition-colors cursor-pointer"
                          >
                            Open &amp; Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDocToDelete({ id: d.id, title: d.title })}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete draft"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Unified Luxury AdminDeleteModal */}
      <AdminDeleteModal
        isOpen={Boolean(docToDelete)}
        title="Delete Itinerary Document"
        description="Are you sure you want to delete this itinerary document? This action cannot be undone."
        itemTitle={docToDelete?.title}
        confirmLabel="Delete Document"
        onClose={() => setDocToDelete(null)}
        onConfirm={() => {
          if (docToDelete) {
            onDeleteDraft(docToDelete.id);
            setDocToDelete(null);
          }
        }}
      />
    </div>
  );
}
