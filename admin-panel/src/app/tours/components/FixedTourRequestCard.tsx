"use client";

import { useState } from "react";

// Types matching fixed tour ad submissions
export interface FixedTourBookingProps {
  id: string;
  adTitle: string; // The specific tour ad/package title the client selected
  tourType: "one_day" | "multi_day";
  clientName: string;
  email: string;
  phone: string;
  travelDates: string;
  groupSize: number;
  additionalNotes?: string;
  status: "pending" | "contacted" | "completed";
}

export default function FixedTourCard({
  id,
  adTitle,
  tourType,
  clientName,
  email,
  phone,
  travelDates,
  groupSize,
  additionalNotes,
  status: initialStatus,
}: FixedTourBookingProps) {
  const [status, setStatus] = useState(initialStatus);

  // Badge indicator for 1-Day vs Multi-Day Tours
  const renderTourBadge = () => {
    if (tourType === "one_day") {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          One-Day Tour
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
        Multi-Day Tour
      </span>
    );
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-all p-6 mb-4">
      
      {/* Top Bar: Tour Type Badge & Status Selector */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        {renderTourBadge()}

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
          <option value="contacted" className="bg-white text-slate-800">Contacted / In Progress</option>
          <option value="completed" className="bg-white text-slate-800">Deal Closed / Booked</option>
        </select>
      </div>

      {/* Main Content: Client Details & Selected Ad Title */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        
        {/* Column 1: Client Personal Details */}
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client Name</span>
            <h3 className="text-base font-bold text-slate-800">{clientName}</h3>
          </div>

          <div className="flex flex-col gap-1 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{phone}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1 text-xs text-slate-500">
            <span><strong>Dates:</strong> {travelDates}</span>
            <span><strong>Group:</strong> {groupSize} Person(s)</span>
          </div>
        </div>

        {/* Column 2: Selected Tour Package / Ad Title */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Booked Package Ad
            </span>
            <p className="text-sm font-bold text-slate-900 bg-white border border-slate-200 px-3 py-2.5 rounded-lg shadow-2xs">
              🏷️ {adTitle}
            </p>
          </div>

          {additionalNotes && (
            <div className="mt-3 pt-2 border-t border-slate-200/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Client Notes:</span>
              <p className="text-xs text-slate-600 italic mt-0.5 line-clamp-2">{additionalNotes}</p>
            </div>
          )}
        </div>

      </div>

      {/* Footer: One-Click Contact Actions */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
        <a
          href={`mailto:${email}?subject=Regarding Your Booking: ${adTitle}`}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Send Email
        </a>

        <a
          href={`tel:${phone}`}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Call Client
        </a>
      </div>

    </div>
  );
}