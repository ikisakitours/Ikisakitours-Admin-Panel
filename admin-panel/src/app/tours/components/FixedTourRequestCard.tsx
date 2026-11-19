"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Check,
  Copy,
  Eye,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Trash2,
  Users,
} from "lucide-react";
import {
  packageBookingService,
  type BookingStatus,
  type PackageBooking,
} from "@/services/package-booking.service";
import {
  BOOKING_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  formatMoney,
  formatRelativeTime,
  formatTravelerSubtext,
  getDisplayReference,
  getTotalPax,
  toNumber,
} from "../utils/bookingFormatters";

interface FixedTourCardProps {
  booking: PackageBooking;
  onStatusUpdated?: (updated: PackageBooking) => void;
  onDeleted?: (id: string) => void;
  onDelete?: (booking: PackageBooking) => void;
  onViewDetails?: (booking: PackageBooking) => void;
  onNotify?: (message: string, variant: "success" | "error" | "info") => void;
}

export default function FixedTourCard({
  booking,
  onStatusUpdated,
  onDeleted,
  onDelete,
  onViewDetails,
  onNotify,
}: FixedTourCardProps) {
  const [loadingAction, setLoadingAction] = useState<"status" | "delete" | null>(null);
  const [copied, setCopied] = useState(false);

  const fullName = `${booking.firstname} ${booking.lastname}`;
  const refCode = getDisplayReference(booking);
  const totalPax = getTotalPax(booking);
  const currency = booking.currency || booking.pricingSummary?.baseCurrency || "USD";
  const clientTotal = toNumber(booking.totalAmount, 0);
  const serverVerified =
    booking.verifiedAmount !== null && booking.verifiedAmount !== undefined
      ? toNumber(booking.verifiedAmount, 0)
      : null;
  const isOneDay = (booking.type || booking.packageType) === "oneday";
  const isTampered = Boolean(booking.isPriceTampered);
  const payStatus = booking.paymentStatus || "unpaid";

  const statusCfg = BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.pending;
  const payCfg = PAYMENT_STATUS_CONFIG[payStatus] || PAYMENT_STATUS_CONFIG.unpaid;

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(refCode);
      setCopied(true);
      onNotify?.(`Copied reference ${refCode}`, "info");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleStatusChange = async (newStatus: BookingStatus) => {
    try {
      setLoadingAction("status");
      const updated = await packageBookingService.updateBookingStatus(booking.id, {
        status: newStatus,
      });
      onStatusUpdated?.(updated);
      onNotify?.(`Status updated to ${newStatus.toUpperCase()}`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      onNotify ? onNotify(msg, "error") : alert(msg);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async () => {
    if (onDelete) {
      onDelete(booking);
      return;
    }
    if (!confirm(`Delete booking ${refCode} for ${fullName}? This cannot be undone.`)) return;

    try {
      setLoadingAction("delete");
      await packageBookingService.deleteBooking(booking.id);
      onDeleted?.(booking.id);
      onNotify?.(`Booking ${refCode} deleted.`, "info");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete booking";
      onNotify ? onNotify(msg, "error") : alert(msg);
      setLoadingAction(null);
    }
  };

  return (
    <div
      className={`w-full rounded-2xl border shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between ${
        isTampered
          ? "bg-amber-50/30 border-rose-300"
          : "bg-white border-slate-200"
      }`}
    >
      {/* Top Bar: Reference, Tour Type Badge, Payment & Status Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3.5 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-lg bg-slate-900 px-2.5 py-1 font-mono text-[11px] font-extrabold text-white">
            {refCode}
          </span>
          <button
            type="button"
            onClick={handleCopyRef}
            title="Copy reference"
            className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-800 cursor-pointer"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </button>

          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border inline-flex items-center gap-1.5 ${
              isOneDay
                ? "bg-amber-50 text-amber-700 border-amber-200/70"
                : "bg-indigo-50 text-indigo-700 border-indigo-200/70"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isOneDay ? "bg-amber-500" : "bg-indigo-500"}`}
            />
            {isOneDay ? "One-Day Tour" : "Multi-Day Tour"}
          </span>

          <span
            className={`px-2 py-0.5 rounded-md border text-[10px] font-bold ${payCfg.pillClass}`}
          >
            {payCfg.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {loadingAction === "status" && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
          <select
            value={booking.status}
            disabled={loadingAction !== null}
            onChange={(e) => handleStatusChange(e.target.value as BookingStatus)}
            className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border focus:outline-none transition-colors cursor-pointer ${statusCfg.pillClass}`}
          >
            <option value="pending" className="bg-white text-slate-800">
              Pending
            </option>
            <option value="confirmed" className="bg-white text-slate-800">
              Confirmed
            </option>
            <option value="completed" className="bg-white text-slate-800">
              Completed
            </option>
            <option value="cancelled" className="bg-white text-slate-800">
              Cancelled
            </option>
          </select>
        </div>
      </div>

      {/* Price Discrepancy Alert */}
      {isTampered && (
        <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>
            Price Discrepancy (Client: {formatMoney(clientTotal, currency)} vs Server Verified:{" "}
            {serverVerified !== null ? formatMoney(serverVerified, currency) : "N/A"})
          </span>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
        <div className="space-y-2.5">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Customer
            </span>
            <h3 className="text-sm font-extrabold text-slate-900">{fullName}</h3>
          </div>

          <div className="flex flex-col gap-1 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{booking.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{booking.country}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-1 text-xs text-slate-600 flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <strong>Journey:</strong> {booking.journeyDate}
            </span>
            <span className="inline-flex items-center gap-1 font-bold text-indigo-700">
              <Users className="w-3.5 h-3.5 text-indigo-500" />
              {totalPax} Pax
            </span>
          </div>

          <p className="text-[11px] bg-slate-50 border border-slate-100 px-3 py-2 rounded-lg text-slate-600">
            {formatTravelerSubtext(booking)}
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
              Selected Package
            </span>
            <p className="text-xs font-extrabold text-slate-900 bg-white border border-slate-200 px-3 py-2.5 rounded-lg flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="truncate">{booking.packageName}</span>
            </p>
          </div>

          <div className="flex items-end justify-between pt-2 border-t border-slate-200/60">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400 block">
                Total Amount
              </span>
              <span className="text-lg font-black text-slate-900">
                {formatMoney(clientTotal, currency)}
              </span>
            </div>
            {(booking.selectedOptions?.length || 0) > 0 && (
              <span className="rounded-md bg-purple-50 border border-purple-200 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                +{booking.selectedOptions?.length} Add-ons
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100">
        <span className="text-[11px] text-slate-400">
          Booked {formatRelativeTime(booking.createdAt)}
        </span>

        <div className="flex items-center gap-2">
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(booking)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              View Full Details
            </button>
          )}

          <button
            type="button"
            disabled={loadingAction !== null}
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold rounded-lg transition-colors cursor-pointer"
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
