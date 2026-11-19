"use client";

import { useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  Compass,
  Inbox,
  MailCheck,
  Sparkles,
} from "lucide-react";
import type { ContactInquiry } from "../types/contact.types";
import { isNewContact } from "../utils/contactFormatters";

interface ContactSummaryBarProps {
  inquiries: ContactInquiry[];
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  selectedType: string;
  onSelectType: (type: string) => void;
}

export function ContactSummaryBar({
  inquiries,
  selectedStatus,
  onSelectStatus,
  selectedType,
  onSelectType,
}: ContactSummaryBarProps) {
  const stats = useMemo(() => {
    let pending = 0;
    let contacted = 0;
    let completed = 0;
    let tourSpecific = 0;
    let new24h = 0;

    for (const inq of inquiries) {
      const st = (inq.status || "pending").toLowerCase();
      if (st === "pending") pending++;
      else if (st === "contacted") contacted++;
      else if (st === "completed" || st === "resolved") completed++;

      if (inq.tourInterest || (inq.inquiryType && inq.inquiryType.toLowerCase().includes("tour"))) {
        tourSpecific++;
      }

      if (isNewContact(inq.createdAt, 24)) new24h++;
    }

    return {
      total: inquiries.length,
      pending,
      contacted,
      completed,
      tourSpecific,
      new24h,
    };
  }, [inquiries]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* 1. Total Inquiries */}
      <button
        type="button"
        onClick={() => {
          onSelectStatus("all");
          onSelectType("all");
        }}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedStatus === "all" && selectedType === "all"
            ? "bg-slate-900 text-white border-slate-900 shadow-sm"
            : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
            Total Inquiries
          </span>
          <Inbox className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <p className="text-xl font-black mt-1">{stats.total}</p>
        <p className="text-[10px] opacity-70 mt-0.5">Contact submissions</p>
      </button>

      {/* 2. Pending Review */}
      <button
        type="button"
        onClick={() => onSelectStatus(selectedStatus === "pending" ? "all" : "pending")}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedStatus === "pending"
            ? "bg-amber-500 text-white border-amber-500 shadow-sm"
            : "bg-white text-slate-800 border-slate-200 hover:border-amber-300 hover:bg-amber-50/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
            Pending Review
          </span>
          <Clock className="w-3.5 h-3.5 text-amber-500" />
        </div>
        <p className="text-xl font-black mt-1">{stats.pending}</p>
        <p className="text-[10px] opacity-70 mt-0.5">Needs initial reply</p>
      </button>

      {/* 3. Contacted / In Progress */}
      <button
        type="button"
        onClick={() => onSelectStatus(selectedStatus === "contacted" ? "all" : "contacted")}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedStatus === "contacted"
            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
            : "bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
            Contacted
          </span>
          <MailCheck className="w-3.5 h-3.5 text-blue-500" />
        </div>
        <p className="text-xl font-black mt-1">{stats.contacted}</p>
        <p className="text-[10px] opacity-70 mt-0.5">Responded by staff</p>
      </button>

      {/* 4. Resolved / Closed */}
      <button
        type="button"
        onClick={() => onSelectStatus(selectedStatus === "completed" ? "all" : "completed")}
        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
          selectedStatus === "completed"
            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
            : "bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40"
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider opacity-70">
            Resolved
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <p className="text-xl font-black mt-1">{stats.completed}</p>
        <p className="text-[10px] opacity-70 mt-0.5">Cases closed</p>
      </button>

      {/* 5. Tour Specific Inquiries */}
      <div className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50/50 text-slate-800 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700">
            Tour Inquiries
          </span>
          <Compass className="w-3.5 h-3.5 text-purple-500" />
        </div>
        <p className="text-xl font-black text-purple-950 mt-1">{stats.tourSpecific}</p>
        <p className="text-[10px] text-purple-700/80 mt-0.5">Tour package interest</p>
      </div>

      {/* 6. New in 24h */}
      <div className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/50 text-slate-800 text-left">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
            New (24h)
          </span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        </div>
        <p className="text-xl font-black text-emerald-950 mt-1">{stats.new24h}</p>
        <p className="text-[10px] text-emerald-700/80 mt-0.5">Arrived recently</p>
      </div>
    </div>
  );
}
