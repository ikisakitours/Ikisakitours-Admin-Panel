"use client";

import React, { useState } from "react";
import {
  Check,
  Compass,
  Copy,
  Eye,
  Loader2,
  Mail,
  MessageSquare,
  Trash2,
} from "lucide-react";
import type { ContactInquiry } from "../types/contact.types";
import {
  CONTACT_STATUS_CONFIG,
  formatContactRelativeTime,
  getDisplayContactReference,
  isNewContact,
} from "../utils/contactFormatters";

interface ContactTableProps {
  inquiries: ContactInquiry[];
  loading: boolean;
  updatingId: string | null;
  deletingId: string | null;
  onViewDetails: (inquiry: ContactInquiry) => void;
  onStatusChange: (inquiryId: string, newStatus: string) => Promise<void>;
  onDelete: (inquiry: ContactInquiry) => Promise<void>;
  onCopyReference: (reference: string) => void;
}

export function ContactTable({
  inquiries,
  loading,
  updatingId,
  deletingId,
  onViewDetails,
  onStatusChange,
  onDelete,
  onCopyReference,
}: ContactTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (inquiry: ContactInquiry) => {
    const ref = getDisplayContactReference(inquiry);
    try {
      await navigator.clipboard.writeText(ref);
      setCopiedId(inquiry.id);
      onCopyReference(ref);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      onCopyReference(ref);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="divide-y divide-slate-200/70">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-44 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="space-y-2 flex-1 hidden md:block">
                <div className="h-4 w-52 rounded bg-slate-200 animate-pulse" />
                <div className="h-3 w-36 rounded bg-slate-100 animate-pulse" />
              </div>
              <div className="h-7 w-24 rounded-lg bg-slate-200 animate-pulse" />
              <div className="h-8 w-24 rounded-lg bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-dashed border-slate-300 py-14 px-6 text-center space-y-2">
        <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-sm font-bold text-slate-700">No contact inquiries found</p>
        <p className="text-xs text-slate-500">
          Try clearing your search query or switching status filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Top Meta Bar */}
      <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Contact Inquiries ({inquiries.length})
          </span>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-3 text-[10px] font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Pending Review
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Contacted
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Resolved
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3 pl-4 pr-3 w-50">Ref &amp; Date</th>
              <th className="py-3 px-3 w-62.5">Inquiry Type</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3 w-42.5">Status</th>
              <th className="py-3 pl-3 pr-4 text-right w-35">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80 text-xs">
            {inquiries.map((inquiry, rowIndex) => {
              const refCode = getDisplayContactReference(inquiry);
              const isNew = isNewContact(inquiry.createdAt, 24);
              const statusKey = (inquiry.status || "pending").toLowerCase();
              const statusCfg = CONTACT_STATUS_CONFIG[statusKey] || CONTACT_STATUS_CONFIG.pending;
              const isBusy = updatingId === inquiry.id || deletingId === inquiry.id;

              return (
                <tr
                  key={inquiry.id}
                  className={`border-l-[3px] ${statusCfg.borderClass} transition-colors odd:bg-white even:bg-slate-50/65 hover:bg-emerald-50/45`}
                >
                  {/* 1. Row # + Reference + Date */}
                  <td className="py-3.5 pl-3.5 pr-3 align-middle whitespace-nowrap w-50">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 w-5">
                        {String(rowIndex + 1).padStart(2, "0")}
                      </span>
                      <span className="inline-flex items-center rounded-lg border border-emerald-200/90 bg-emerald-50/80 px-2 py-0.5 font-mono text-[11px] font-extrabold text-emerald-900">
                        {refCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(inquiry)}
                        title="Copy reference"
                        className={`p-1 rounded-md border transition-colors cursor-pointer ${
                          copiedId === inquiry.id
                            ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-400 hover:text-emerald-700 hover:border-emerald-300"
                        }`}
                      >
                        {copiedId === inquiry.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      {isNew && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-200 animate-pulse" />
                          New
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 pl-6 text-[10px] text-slate-400">
                      {formatContactRelativeTime(inquiry.createdAt)}
                    </div>
                  </td>

                  {/* 2. Inquiry Classification (Snapped tight to the left) */}
                  <td className="py-3.5 px-3 align-middle w-62.5">
                    <span className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold border bg-indigo-50/70 text-indigo-700 border-indigo-200">
                      <MessageSquare className="w-3 h-3 text-indigo-500" />
                      <span className="truncate">{inquiry.inquiryType || "General Inquiry"}</span>
                    </span>
                    {inquiry.tourInterest && (
                      <p className="text-[10px] text-purple-700 font-bold truncate mt-1 flex items-center gap-1">
                        <Compass className="w-3 h-3 text-purple-500 shrink-0" />
                        <span className="truncate" title={inquiry.tourInterest}>
                          {inquiry.tourInterest}
                        </span>
                      </p>
                    )}
                  </td>

                  {/* 3. Customer */}
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                    <p className="font-extrabold text-slate-900 text-xs truncate">
                      {inquiry.fullName || "Guest"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5" title={inquiry.email}>
                      {inquiry.email || "—"}
                    </p>
                  </td>

                  {/* 4. Status Selector */}
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap w-42.5">
                    <div className="flex items-center gap-1">
                      <select
                        aria-label={`Status for ${refCode}`}
                        value={statusKey}
                        disabled={isBusy}
                        onChange={(e) => onStatusChange(inquiry.id, e.target.value)}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold outline-none cursor-pointer transition-colors ${statusCfg.pillClass}`}
                      >
                        <option value="pending" className="bg-white text-slate-800">Pending Review</option>
                        <option value="contacted" className="bg-white text-slate-800">Contacted</option>
                        <option value="completed" className="bg-white text-slate-800">Resolved</option>
                      </select>
                      {updatingId === inquiry.id && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      )}
                    </div>
                  </td>

                  {/* 5. Actions */}
                  <td className="py-3.5 pl-3 pr-4 align-middle text-right whitespace-nowrap w-35">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetails(inquiry)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <a
                        href={`mailto:${inquiry.email}?subject=${encodeURIComponent(
                          `Ikisaki Tours: Re: ${inquiry.subject || "Your Inquiry"} (${refCode})`
                        )}`}
                        title="Reply via Email"
                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onDelete(inquiry)}
                        title="Delete inquiry"
                        className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {deletingId === inquiry.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
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
    </div>
  );
}
