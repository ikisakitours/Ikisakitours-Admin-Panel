"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  FilePlus,
  FileText,
  Trash2,
  X,
} from "lucide-react";
import type { ItineraryDocument } from "../types/itinerary.types";
import { AdminDeleteModal } from "@/components/AdminDeleteModal";

interface ItineraryDraftsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  drafts: ItineraryDocument[];
  activeId: string;
  onSelectDraft: (draft: ItineraryDocument) => void;
  onDeleteDraft: (id: string) => void;
  onNewDocument: () => void;
}

export function ItineraryDraftsDrawer({
  isOpen,
  onClose,
  drafts,
  activeId,
  onSelectDraft,
  onDeleteDraft,
  onNewDocument,
}: ItineraryDraftsDrawerProps) {
  const [draftToDelete, setDraftToDelete] = useState<{ id: string; title: string } | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs animate-in fade-in duration-150"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Saved Itinerary Documents ({drafts.length})
              </h2>
              <p className="text-[11px] text-slate-500">
                Locally saved drafts and generated booking itineraries
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Button */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/70">
          <button
            type="button"
            onClick={() => {
              onNewDocument();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            Create Blank / Template Itinerary
          </button>
        </div>

        {/* Draft List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {drafts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No saved drafts yet</p>
              <p className="text-[11px] text-slate-500">
                Generate an itinerary from Tour Bookings or save your current edits.
              </p>
            </div>
          ) : (
            drafts.map((draft) => {
              const isActive = draft.id === activeId;
              const formattedDate = new Date(draft.updatedAt || draft.createdAt).toLocaleDateString(
                undefined,
                { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
              );

              return (
                <div
                  key={draft.id}
                  onClick={() => {
                    onSelectDraft(draft);
                    onClose();
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? "border-emerald-500 bg-emerald-50/50 shadow-xs"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {draft.referenceNo}
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {draft.title || draft.tourName}
                      </p>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {draft.tourDates || "Dates not set"}
                        </span>
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {formattedDate}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDraftToDelete({ id: draft.id, title: draft.title });
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete draft"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Unified Luxury AdminDeleteModal */}
      <AdminDeleteModal
        isOpen={Boolean(draftToDelete)}
        title="Delete Itinerary Draft"
        description="Are you sure you want to delete this itinerary draft document? This action cannot be undone."
        itemTitle={draftToDelete?.title}
        confirmLabel="Delete Draft"
        onClose={() => setDraftToDelete(null)}
        onConfirm={() => {
          if (draftToDelete) {
            onDeleteDraft(draftToDelete.id);
            setDraftToDelete(null);
          }
        }}
      />
    </div>
  );
}
