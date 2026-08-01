"use client";

import { useState } from "react";
import FixedTourCard, { FixedTourBookingProps } from "./components/FixedTourRequestCard";
const MOCK_FIXED_TOURS: FixedTourBookingProps[] = [
  {
    id: "ft_1",
    adTitle: "Sigiriya & Dambulla Day Excursion Special",
    tourType: "one_day",
    clientName: "Michael Chang",
    email: "michael.c@example.com",
    phone: "+1 415 555 2671",
    travelDates: "Aug 15, 2026",
    groupSize: 2,
    additionalNotes: "Vegetarian lunch options preferred.",
    status: "pending",
  },
  {
    id: "ft_2",
    adTitle: "Classic Hill Country & Wildlife Safari (5D/4N)",
    tourType: "multi_day",
    clientName: "Emma Watson",
    email: "emma.w@example.com",
    phone: "+44 20 7946 0912",
    travelDates: "Sep 10, 2026",
    groupSize: 5,
    additionalNotes: "Need twin rooms in hotels.",
    status: "contacted",
  },
  {
    id: "ft_3",
    adTitle: "Galle Fort & Southern Coast Day Trip",
    tourType: "one_day",
    clientName: "Lucas Silva",
    email: "lucas.s@example.com",
    phone: "+55 11 98765 4321",
    travelDates: "Oct 05, 2026",
    groupSize: 3,
    status: "completed",
  },
];

export default function Tours() {
  const [filter, setFilter] = useState<string>("all");

  const filteredTours = MOCK_FIXED_TOURS.filter((tour) => {
    if (filter === "oneday") return tour.tourType === "one_day";
    if (filter === "multiday") return tour.tourType === "multi_day";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              One-Day & Multi-Day Tour Ad Requests
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Direct bookings originating from specific published tour package advertisements.
            </p>
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label htmlFor="tour-filter" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Filter By:
            </label>
            <select
              id="tour-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-xs font-semibold bg-white text-slate-700 border border-slate-200 rounded-lg px-3 py-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="all">All Fixed Packages ({MOCK_FIXED_TOURS.length})</option>
              <option value="oneday">One-Day Tours</option>
              <option value="multiday">Multi-Day Tours</option>
            </select>
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          {filteredTours.length > 0 ? (
            filteredTours.map((tour) => (
              <FixedTourCard key={tour.id} {...tour} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-sm font-medium text-slate-500">No requests found for this filter.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}