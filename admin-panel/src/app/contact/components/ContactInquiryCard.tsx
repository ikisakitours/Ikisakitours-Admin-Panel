"use client";

import { useState } from "react";

export type InquiryType =
  | "tour_inquiry"
  | "services"
  | "general"
  | "partnership_media"
  | "others";

export interface ContactInquiryProps {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  inquiryType: InquiryType;
  subject: string;
  message: string;
  createdAt: string;
  status: "pending" | "contacted" | "completed";
}

export default function ContactInquiryCard({
  id,
  fullName,
  email,
  phone,
  inquiryType,
  subject,
  message,
  createdAt,
  status: initialStatus,
}: ContactInquiryProps) {
  const [status, setStatus] = useState(initialStatus);

  // Render distinctive badges for each updated Inquiry Type
  const renderInquiryBadge = () => {
    switch (inquiryType) {
      case "tour_inquiry":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Tour Inquiry & Availability
          </span>
        );
      case "services":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Services
          </span>
        );
      case "general":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            General Questions
          </span>
        );
      case "partnership_media":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/60 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            Partnership & Media
          </span>
        );
      case "others":
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Others
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-all p-6 mb-4">
      {/* Header: Inquiry Type Badge, Date, and Admin Status Dropdown */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          {renderInquiryBadge()}
          <span className="text-xs text-slate-400 font-medium">{createdAt}</span>
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none transition-colors cursor-pointer ${
            status === "completed"
              ? "bg-emerald-500 text-white border-emerald-500"
              : status === "contacted"
              ? "bg-slate-800 text-white border-slate-800"
              : "bg-slate-100 text-slate-600 border-slate-200"
          }`}
        >
          <option value="pending" className="bg-white text-slate-800">Pending Review</option>
          <option value="contacted" className="bg-white text-slate-800">Contacted / Responded</option>
          <option value="completed" className="bg-white text-slate-800">Resolved / Closed</option>
        </select>
      </div>

      {/* Body: Contact Details + Message Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
        {/* Column 1: Sender Contact Details */}
        <div className="space-y-3 md:col-span-1 border-r border-slate-100 pr-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</span>
            <h3 className="text-base font-bold text-slate-800">{fullName}</h3>
          </div>

          <div className="flex flex-col gap-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{email}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{phone}</span>
            </div>
          </div>
        </div>

        {/* Column 2 & 3: Subject & Message Body */}
        <div className="md:col-span-2 bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Subject: <span className="text-slate-800 font-semibold">{subject}</span>
            </span>
            <p className="text-xs text-slate-700 leading-relaxed mt-2 bg-white border border-slate-200/70 p-3 rounded-lg whitespace-pre-wrap">
              {message}
            </p>
          </div>
        </div>
      </div>

      {/* Footer: Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <a
          href={`mailto:${email}?subject=RE: ${subject}`}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Reply Email
        </a>

        <a
          href={`tel:${phone}`}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call Sender
        </a>
      </div>
    </div>
  );
}