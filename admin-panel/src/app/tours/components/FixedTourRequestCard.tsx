"use client";

import { useState } from "react";
import { Trash2, Loader2, Mail, Calendar, Users, Globe, MapPin } from "lucide-react";
import { packageBookingService, PackageBooking } from "@/services/package-booking.service";

interface FixedTourCardProps {
  booking: PackageBooking;
  onStatusUpdated?: (updated: PackageBooking) => void;
  onDeleted?: (id: string) => void;
}

export default function FixedTourCard({
  booking,
  onStatusUpdated,
  onDeleted,
}: FixedTourCardProps) {
  const [status, setStatus] = useState<PackageBooking['status']>(booking.status);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const fullName = `${booking.firstname} ${booking.lastname}`;
  const totalTravelers = 
    booking.travelers.adults + 
    booking.travelers.couples + 
    booking.travelers.children + 
    booking.travelers.infants;

  // Handle Status Update
  const handleStatusChange = async (newStatus: PackageBooking['status']) => {
    try {
      setLoadingAction("status");
      const updated = await packageBookingService.updateStatus(booking.id, { status: newStatus });
      setStatus(updated.status);
      if (onStatusUpdated) onStatusUpdated(updated);
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setLoadingAction(null);
    }
  };

  // Handle Delete Booking
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      setLoadingAction("delete");
      await packageBookingService.deleteBooking(booking.id);
      if (onDeleted) onDeleted(booking.id);
    } catch (err: any) {
      alert(err.message || "Failed to delete booking");
      setLoadingAction(null);
    }
  };

  // Render Tour Badge (One-day vs Multi-day)
  const renderTourBadge = () => {
    if (booking.type === "oneday") {
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
    <div className="w-full bg-white border border-slate-200 rounded-xl shadow-xs hover:shadow-md transition-all p-6 mb-4 flex flex-col justify-between">
      
      {/* Top Bar: Tour Type Badge & Status Selector */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        {renderTourBadge()}

        <div className="flex items-center gap-2">
          {loadingAction === "status" && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          <select
            value={status}
            disabled={loadingAction !== null}
            onChange={(e) => handleStatusChange(e.target.value as PackageBooking['status'])}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border focus:outline-none transition-colors cursor-pointer ${
              status === "completed"
                ? "bg-emerald-500 text-white border-emerald-500"
                : status === "confirmed"
                ? "bg-indigo-600 text-white border-indigo-600"
                : status === "cancelled"
                ? "bg-rose-500 text-white border-rose-500"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            <option value="pending" className="bg-white text-slate-800">Pending</option>
            <option value="confirmed" className="bg-white text-slate-800">Confirmed</option>
            <option value="completed" className="bg-white text-slate-800">Completed</option>
            <option value="cancelled" className="bg-white text-slate-800">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Content: Client Details & Selected Package Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        
        {/* Column 1: Client Personal Details */}
        <div className="space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client Name</span>
            <h3 className="text-base font-bold text-slate-800">{fullName}</h3>
          </div>

          <div className="flex flex-col gap-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{booking.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{booking.country}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <strong>Journey:</strong> {booking.journeyDate}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              <strong>Total Travelers:</strong> {totalTravelers}
            </span>
          </div>

          {/* Travelers Breakdown Sub-box */}
          <div className="text-[11px] bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg text-slate-600 flex gap-3 flex-wrap">
            <span>Adults: <strong>{booking.travelers.adults}</strong></span>
            <span>Couples: <strong>{booking.travelers.couples}</strong></span>
            <span>Children: <strong>{booking.travelers.children}</strong></span>
            <span>Infants: <strong>{booking.travelers.infants}</strong></span>
          </div>
        </div>

        {/* Column 2: Selected Tour Package Title */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Selected Package
            </span>
            <p className="text-sm font-bold text-slate-900 bg-white border border-slate-200 px-3 py-2.5 rounded-lg shadow-2xs flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span className="truncate">{booking.packageName}</span>
            </p>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400">
            <span>Package ID: <span className="font-mono text-slate-600">{booking.packageId}</span></span>
          </div>
        </div>

      </div>

      {/* Footer: Email Action & Delete Button */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-[10px] text-slate-400">
          Booked on: {new Date(booking.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>

        <div className="flex items-center gap-2">
          <a
            href={`mailto:${booking.email}?subject=Regarding Your Booking: ${booking.packageName}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-slate-500" />
            Send Email
          </a>

          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={handleDelete}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            title="Delete Booking"
          >
            {loadingAction === "delete" ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
            Delete
          </button>
        </div>
      </div>

    </div>
  );
}