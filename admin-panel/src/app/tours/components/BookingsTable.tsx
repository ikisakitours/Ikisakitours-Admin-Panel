"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  Check,
  ChevronDown,
  Copy,
  Eye,
  Globe,
  Loader2,
  Package,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { BookingStatus, PackageBooking } from "@/app/tours/types/package-booking.types";
import {
  BOOKING_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  formatMoney,
  formatRelativeTime,
  getDisplayReference,
  getTotalPax,
  isNewBooking,
  toNumber,
} from "../utils/bookingFormatters";

interface BookingsTableProps {
  bookings: PackageBooking[];
  loading: boolean;
  updatingId: string | null;
  deletingId: string | null;
  onViewDetails: (booking: PackageBooking) => void;
  onQuickStatusChange: (bookingId: string, newStatus: BookingStatus) => Promise<void>;
  onDelete: (booking: PackageBooking) => Promise<void>;
  onCopyReference: (reference: string) => void;
}

const ROW_STATUS_ACCENT: Record<BookingStatus, string> = {
  pending: "border-l-amber-400",
  confirmed: "border-l-emerald-500",
  completed: "border-l-blue-500",
  cancelled: "border-l-rose-400",
};

interface TravelerPopoverState {
  booking: PackageBooking;
  top: number;
  left: number;
  placement: "bottom" | "top";
}

export function BookingsTable({
  bookings,
  loading,
  updatingId,
  deletingId,
  onViewDetails,
  onQuickStatusChange,
  onDelete,
  onCopyReference,
}: BookingsTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [travelerPopover, setTravelerPopover] = useState<TravelerPopoverState | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!travelerPopover) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (popoverRef.current?.contains(target)) return;
      if (target?.closest("[data-traveler-trigger='true']")) return;
      setTravelerPopover(null);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTravelerPopover(null);
    };

    const handleViewportChange = () => setTravelerPopover(null);

    document.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleViewportChange, true);
    window.addEventListener("resize", handleViewportChange);

    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleViewportChange, true);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, [travelerPopover]);

  const handleToggleTravelers = (
    booking: PackageBooking,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    if (travelerPopover?.booking.id === booking.id) {
      setTravelerPopover(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const popoverWidth = 232;
    const estimatedHeight = 225;
    const spaceBelow = window.innerHeight - rect.bottom;
    const placement: "bottom" | "top" = spaceBelow >= estimatedHeight ? "bottom" : "top";

    const rawLeft = rect.left + rect.width / 2 - popoverWidth / 2;
    const clampedLeft = Math.max(12, Math.min(rawLeft, window.innerWidth - popoverWidth - 12));
    const top = placement === "bottom" ? rect.bottom + 8 : rect.top - 8;

    setTravelerPopover({
      booking,
      top,
      left: clampedLeft,
      placement,
    });
  };

  const handleCopy = async (booking: PackageBooking) => {
    const ref = getDisplayReference(booking);
    try {
      await navigator.clipboard.writeText(ref);
      setCopiedId(booking.id);
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

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-dashed border-slate-300 py-14 px-6 text-center space-y-2">
        <Package className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-sm font-bold text-slate-700">No tour bookings match your filters</p>
        <p className="text-xs text-slate-500">
          Try clearing your search query or switching booking/payment status filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Top Meta Bar (Matches PackagesTable style) */}
      <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Tour Bookings ({bookings.length})
          </span>
        </div>

        {/* Status Accent Legend */}
        <div className="hidden md:flex items-center gap-3 text-[10px] font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Pending
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Confirmed
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-blue-500" /> Completed
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> Cancelled / Flagged
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3 pl-4 pr-3">Ref &amp; Journey</th>
              <th className="py-3 px-3">Tour Package</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Travelers</th>
              <th className="py-3 px-3">Amount</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 pl-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80 text-xs">
            {bookings.map((booking, rowIndex) => {
              const refCode = getDisplayReference(booking);
              const totalPax = getTotalPax(booking);
              const isTravelersOpen = travelerPopover?.booking.id === booking.id;
              const currency = booking.currency || booking.pricingSummary?.baseCurrency || "USD";
              const clientTotal = toNumber(booking.totalAmount, 0);
              const serverVerified =
                booking.verifiedAmount !== null && booking.verifiedAmount !== undefined
                  ? toNumber(booking.verifiedAmount, 0)
                  : null;
              const optionsCount = booking.selectedOptions?.length || 0;

              const statusCfg = BOOKING_STATUS_CONFIG[booking.status] || BOOKING_STATUS_CONFIG.pending;
              const payStatus = booking.paymentStatus || "unpaid";
              const payCfg = PAYMENT_STATUS_CONFIG[payStatus] || PAYMENT_STATUS_CONFIG.unpaid;

              const isOneDay = (booking.type || booking.packageType) === "oneday";
              const isTampered = Boolean(booking.isPriceTampered);
              const isBusy = updatingId === booking.id || deletingId === booking.id;
              const leftBorderClass = isTampered
                ? "border-l-rose-500"
                : ROW_STATUS_ACCENT[booking.status] || "border-l-slate-300";

              return (
                <tr
                  key={booking.id}
                  className={`border-l-[3px] ${leftBorderClass} transition-colors ${
                    isTampered
                      ? "bg-rose-50/40 hover:bg-rose-50/75"
                      : "odd:bg-white even:bg-slate-50/65 hover:bg-emerald-50/45"
                  }`}
                >
                  {/* 1. Row # + Reference + Journey Date */}
                  <td className="py-3.5 pl-3.5 pr-3 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400 w-5">
                        {String(rowIndex + 1).padStart(2, "0")}
                      </span>
                      <span className="inline-flex items-center rounded-lg border border-emerald-200/90 bg-emerald-50/80 px-2 py-0.5 font-mono text-[11px] font-extrabold text-emerald-900">
                        {refCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(booking)}
                        title="Copy booking reference"
                        className={`p-1 rounded-md border transition-colors cursor-pointer ${
                          copiedId === booking.id
                            ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-400 hover:text-emerald-700 hover:border-emerald-300"
                        }`}
                      >
                        {copiedId === booking.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      {isNewBooking(booking.createdAt, 24) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-200 animate-pulse" />
                          New
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 pl-6 flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                        <Calendar className="w-3 h-3 text-emerald-600 shrink-0" />
                        {booking.journeyDate || "—"}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-slate-400">
                        {formatRelativeTime(booking.createdAt)}
                      </span>
                    </div>
                  </td>

                  {/* 2. Tour Package (Clean Dedicated Column) */}
                  <td className="py-3.5 px-3 align-middle max-w-[230px]">
                    <button
                      type="button"
                      onClick={() => onViewDetails(booking)}
                      className="text-left text-xs font-extrabold text-slate-900 hover:text-emerald-700 transition-colors line-clamp-1 cursor-pointer block w-full"
                      title={booking.packageName}
                    >
                      {booking.packageName}
                    </button>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${
                          isOneDay
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}
                      >
                        {isOneDay ? "One Day" : "Multi Day"}
                      </span>
                      {booking.locale && (
                        <span className="rounded bg-slate-100 border border-slate-200/80 px-1.5 py-0.5 text-[9px] font-extrabold uppercase text-slate-500">
                          {booking.locale}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 3. Customer (Clean Dedicated Column) */}
                  <td className="py-3.5 px-3 align-middle max-w-[200px]">
                    <p className="font-bold text-slate-900 truncate">
                      {booking.firstname} {booking.lastname}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5" title={booking.email}>
                      {booking.email}
                    </p>
                    <p className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 mt-0.5">
                      <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{booking.country || "—"}</span>
                    </p>
                  </td>

                  {/* 4. Travelers (Click-to-reveal breakdown popover) */}
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                    <button
                      type="button"
                      data-traveler-trigger="true"
                      onClick={(e) => handleToggleTravelers(booking, e)}
                      aria-expanded={isTravelersOpen}
                      title="Click to view Adults, Couples, Children & Infants breakdown"
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                        isTravelersOpen
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200/80 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                      }`}
                    >
                      <Users className="w-3 h-3" />
                      <span>{totalPax} Pax</span>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-150 ${
                          isTravelersOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </td>

                  {/* 5. Financials & Tamper Flag */}
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                    <p className="text-[13px] font-black text-slate-900">
                      {formatMoney(clientTotal, currency)}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
                      <span>{currency}</span>
                      {optionsCount > 0 && (
                        <span className="rounded bg-indigo-50 text-indigo-700 px-1.5 py-0.5 font-bold">
                          +{optionsCount} extra{optionsCount === 1 ? "" : "s"}
                        </span>
                      )}
                    </div>

                    {isTampered && (
                      <div
                        className="mt-1.5 inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700"
                        title={`Client: ${formatMoney(clientTotal, currency)} vs Server Verified: ${
                          serverVerified !== null ? formatMoney(serverVerified, currency) : "N/A"
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3 shrink-0 text-rose-600" />
                        <span>
                          Discrepancy (
                          {serverVerified !== null
                            ? formatMoney(serverVerified, currency)
                            : "Check"}
                          )
                        </span>
                      </div>
                    )}
                  </td>

                  {/* 6. Status & Payment */}
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                    <div className="flex flex-col items-start gap-1.5">
                      <div className="flex items-center gap-1">
                        <select
                          aria-label={`Booking status for ${refCode}`}
                          value={booking.status}
                          disabled={isBusy}
                          onChange={(e) =>
                            onQuickStatusChange(booking.id, e.target.value as BookingStatus)
                          }
                          className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold outline-none cursor-pointer transition-colors ${statusCfg.pillClass}`}
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
                        {updatingId === booking.id && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        )}
                      </div>

                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${payCfg.pillClass}`}
                      >
                        {payCfg.label}
                      </span>
                    </div>
                  </td>

                  {/* 7. Actions (Clean Project-Themed Soft Buttons) */}
                  <td className="py-3.5 pl-3 pr-4 align-middle text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetails(booking)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onDelete(booking)}
                        title="Delete booking"
                        className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {deletingId === booking.id ? (
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

      {/* Click-to-Reveal Traveler Breakdown Popover */}
      {travelerPopover && (() => {
        const t = travelerPopover.booking.travelers || {
          adults: 0,
          couples: 0,
          children: 0,
          infants: 0,
        };
        const adults = Number(t.adults) || 0;
        const couples = Number(t.couples) || 0;
        const children = Number(t.children) || 0;
        const infants = Number(t.infants) || 0;
        const total = getTotalPax(travelerPopover.booking);

        const rows = [
          { label: "Adults", hint: "Age 13+", count: adults, note: null as string | null },
          {
            label: "Couples",
            hint: "1 Couple = 2 Pax",
            count: couples,
            note: couples > 0 ? `${couples * 2} pax` : null,
          },
          { label: "Children", hint: "Age 2–12", count: children, note: null as string | null },
          { label: "Infants", hint: "Under 2", count: infants, note: null as string | null },
        ];

        return (
          <div
            ref={popoverRef}
            role="dialog"
            aria-label="Traveler breakdown"
            style={{
              top: travelerPopover.top,
              left: travelerPopover.left,
              transform: travelerPopover.placement === "top" ? "translateY(-100%)" : undefined,
            }}
            className="fixed z-40 w-[232px] rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-900/5 overflow-hidden"
          >
            <div className="px-3.5 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                  Travelers
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTravelerPopover(null)}
                aria-label="Close traveler breakdown"
                className="p-0.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-2.5 space-y-1.5">
              {rows.map((row) => {
                const isActive = row.count > 0;
                return (
                  <div
                    key={row.label}
                    className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs ${
                      isActive
                        ? "bg-emerald-50/70 border border-emerald-200/70"
                        : "bg-slate-50/60 border border-transparent"
                    }`}
                  >
                    <div>
                      <p
                        className={`font-bold leading-tight ${
                          isActive ? "text-slate-900" : "text-slate-400"
                        }`}
                      >
                        {row.label}
                      </p>
                      <p className="text-[10px] text-slate-400">{row.hint}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {row.note && (
                        <span className="text-[10px] font-semibold text-emerald-700">
                          ({row.note})
                        </span>
                      )}
                      <span
                        className={`min-w-[24px] text-center rounded-md px-1.5 py-0.5 text-[11px] font-extrabold ${
                          isActive
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200/70 text-slate-400"
                        }`}
                      >
                        {row.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="px-3.5 py-2 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-500">Total Headcount</span>
              <span className="font-black text-emerald-700">{total} Pax</span>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
