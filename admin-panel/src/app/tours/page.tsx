"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import FixedTourCard from "./components/FixedTourRequestCard";
import { packageBookingService, PackageBooking } from "@/services/package-booking.service";

export default function Tours() {
  const [filter, setFilter] = useState<string>("all");
  const [bookings, setBookings] = useState<PackageBooking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real package bookings from backend on load
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await packageBookingService.getAllBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || "Failed to load package bookings.");
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on type ('oneday' or 'multiday')
  const filteredTours = bookings.filter((tour) => {
    if (filter === "oneday") return tour.type === "oneday";
    if (filter === "multiday") return tour.type === "multiday";
    return true;
  });

  // Handle removing a booking from state after deletion
  const handleDeleted = (id: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
  };

  // Handle updating a booking status in state
  const handleStatusUpdated = (updatedBooking: PackageBooking) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === updatedBooking.id ? updatedBooking : b))
    );
  };

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
              <option value="all">All Fixed Packages ({bookings.length})</option>
              <option value="oneday">One-Day Tours</option>
              <option value="multiday">Multi-Day Tours</option>
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-slate-200">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
            <p className="text-xs font-medium text-slate-500">Loading tour bookings...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 mb-6">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold block">Error loading data</span>
              {error}
            </div>
            <button
              onClick={fetchBookings}
              className="ml-auto px-3 py-1 bg-white border border-rose-200 rounded-lg text-xs font-bold hover:bg-rose-100 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Requests List */}
        {!loading && !error && (
          <div className="space-y-4">
            {filteredTours.length > 0 ? (
              filteredTours.map((tour) => (
                <FixedTourCard
                  key={tour.id}
                  booking={tour}
                  onStatusUpdated={handleStatusUpdated}
                  onDeleted={handleDeleted}
                />
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-sm font-medium text-slate-500">No requests found for this filter.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}