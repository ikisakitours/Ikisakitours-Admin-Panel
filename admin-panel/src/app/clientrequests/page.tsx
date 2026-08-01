"use client";

import { useState } from "react";
import RequestCard, { ClientRequestProps } from "./components/requestcard";

const mockRequests: ClientRequestProps[] = [
  {
    id: "req_1",
    requestType: "full_package",
    clientName: "David Miller",
    email: "david.m@example.com",
    phone: "+1 (555) 019-2834",
    travelDates: "Aug 12 - Aug 18, 2026",
    groupSize: 4,
    additionalNotes: "We need an SUV with air conditioning. Prefer an English-speaking guide.",
    status: "pending",
  },
  {
    id: "req_2",
    requestType: "guide_only",
    clientName: "Sophia Martinez",
    email: "sophia.m@example.com",
    phone: "+44 7700 900077",
    travelDates: "Sep 01 - Sep 03, 2026",
    groupSize: 2,
    additionalNotes: "Interested mainly in ancient history and culture.",
    status: "contacted",
  },
  {
    id: "req_3",
    requestType: "vehicle_only",
    clientName: "Liam Wilson",
    email: "liam.w@example.com",
    phone: "+61 491 570 156",
    travelDates: "Oct 10 - Oct 14, 2026",
    groupSize: 6,
    status: "completed",
  },
];

export default function ClientRequests() {
  // 1. State for filter and dropdown toggle
  const [filter, setFilter] = useState("All Packages");
  const [isOpen, setIsOpen] = useState(false);

  // 2. Filter requests based on selected package type
  const filteredRequests = mockRequests.filter((req) => {
    if (filter === "Full Package") return req.requestType === "full_package";
    if (filter === "Tour Guide Only") return req.requestType === "guide_only";
    if (filter === "Vehicle Only") return req.requestType === "vehicle_only";
    return true; // "All Packages"
  });

  return (
    <div className="min-h-screen bg-slate-100/40 p-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header & Filter Controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800">Client Inquiries & Requests</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage custom tour requests submitted by visitors on the main application.
            </p>
          </div>

          {/* Package Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
            >
              <span>
                Package: <strong className="font-semibold text-blue-600">{filter}</strong>
              </span>
              <svg
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute right-0 z-10 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5">
                <button
                  onClick={() => { setFilter("All Packages"); setIsOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                  All Packages
                </button>
                <button
                  onClick={() => { setFilter("Full Package"); setIsOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                  Full Package
                </button>
                <button
                  onClick={() => { setFilter("Tour Guide Only"); setIsOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors border-b border-slate-100"
                >
                  Tour Guide Only
                </button>
                <button
                  onClick={() => { setFilter("Vehicle Only"); setIsOpen(false); }}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Vehicle Only
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Display Filtered Cards */}
        <div>
          {filteredRequests.length > 0 ? (
            filteredRequests.map((req) => (
              <RequestCard key={req.id} {...req} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-400 text-sm">
              No requests found for "{filter}".
            </div>
          )}
        </div>

      </div>
    </div>
  );
}