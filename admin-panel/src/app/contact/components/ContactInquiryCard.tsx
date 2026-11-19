"use client";

import { useState } from "react";
import {
  Compass,
  Eye,
  Mail,
  MessageSquare,
  Phone,
  Trash2,
} from "lucide-react";
import type { ContactInquiry } from "../types/contact.types";
import {
  CONTACT_STATUS_CONFIG,
  formatContactRelativeTime,
  getDisplayContactReference,
} from "../utils/contactFormatters";

export type ContactInquiryProps = ContactInquiry & {
  onViewDetails?: (inquiry: ContactInquiry) => void;
  onStatusChange?: (inquiryId: string, newStatus: string) => Promise<void>;
  onDelete?: (inquiry: ContactInquiry) => Promise<void>;
};

export default function ContactInquiryCard(props: ContactInquiryProps) {
  const {
    id,
    fullName,
    email,
    phone,
    inquiryType,
    subject,
    message,
    tourInterest,
    createdAt,
    status: currentStatus,
    onViewDetails,
    onStatusChange,
    onDelete,
  } = props;

  const [loading, setLoading] = useState(false);
  const refCode = getDisplayContactReference(props);
  const statusKey = (currentStatus || "pending").toLowerCase();
  const statusCfg = CONTACT_STATUS_CONFIG[statusKey] || CONTACT_STATUS_CONFIG.pending;

  const handleStatusUpdate = async (newStatus: string) => {
    if (!onStatusChange) return;
    try {
      setLoading(true);
      await onStatusChange(id, newStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="space-y-3.5">
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
              {refCode}
            </span>
            <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border bg-indigo-50 text-indigo-700 border-indigo-200">
              <MessageSquare className="w-3 h-3" />
              <span>{inquiryType || "General Inquiry"}</span>
            </span>
          </div>

          <span className="text-[10px] font-semibold text-slate-400">
            {formatContactRelativeTime(createdAt)}
          </span>
        </div>

        {/* Sender Info */}
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 truncate">
            {subject || "Inquiry Message"}
          </h3>
          <p className="text-xs font-bold text-slate-700 mt-1">{fullName}</p>
          <div className="flex flex-col gap-0.5 text-[11px] text-slate-500 mt-1">
            <span className="flex items-center gap-1.5 truncate">
              <Mail className="w-3 h-3 text-slate-400 shrink-0" /> {email}
            </span>
            {phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {phone}
              </span>
            )}
          </div>
        </div>

        {/* Message Snippet */}
        <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-3 text-xs text-slate-700 italic line-clamp-3">
          &quot;{message}&quot;
        </div>

        {tourInterest && (
          <div className="flex items-center gap-1 text-[11px] text-purple-700 font-semibold truncate">
            <Compass className="w-3 h-3 text-purple-500 shrink-0" />
            <span className="truncate">Interest: {tourInterest}</span>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <select
          value={statusKey}
          disabled={loading}
          onChange={(e) => handleStatusUpdate(e.target.value)}
          className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold outline-none cursor-pointer transition-colors ${statusCfg.pillClass}`}
        >
          <option value="pending" className="bg-white text-slate-800">Pending Review</option>
          <option value="contacted" className="bg-white text-slate-800">Contacted</option>
          <option value="completed" className="bg-white text-slate-800">Resolved</option>
        </select>

        <div className="flex items-center gap-1.5">
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(props)}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>View</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(props)}
              title="Delete inquiry"
              className="p-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
