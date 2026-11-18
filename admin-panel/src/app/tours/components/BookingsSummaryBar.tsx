"use client";

import React from "react";
import { CalendarCheck, Clock, CreditCard, ShieldAlert, ShieldCheck } from "lucide-react";
import type { PackageBooking } from "@/app/tours/types/package-booking.types";
import { formatMoney, toNumber } from "../utils/bookingFormatters";

interface BookingsSummaryBarProps {
  bookings: PackageBooking[];
  tamperedOnly: boolean;
  onToggleTamperedOnly: () => void;
}

export function BookingsSummaryBar({ bookings, tamperedOnly, onToggleTamperedOnly }: BookingsSummaryBarProps) {
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed" || b.status === "completed").length;
  const paidCount = bookings.filter((b) => b.paymentStatus === "paid").length;
  const tamperedCount = bookings.filter((b) => Boolean(b.isPriceTampered)).length;

  // Sum USD-equivalent verified/total volume for non-cancelled bookings
  const activeVolume = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((sum, b) => {
      const amount =
        b.verifiedAmount !== null && b.verifiedAmount !== undefined
          ? toNumber(b.verifiedAmount)
          : toNumber(b.totalAmount);
      return sum + amount;
    }, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total & Active */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Bookings</p>
          <p className="text-2xl font-black text-slate-900 mt-0.5">{totalCount}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{confirmedCount} confirmed / completed</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
          <CalendarCheck className="h-5 w-5" />
        </div>
      </div>

      {/* Pending Action */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Review</p>
          <p className="text-2xl font-black text-amber-600 mt-0.5">{pendingCount}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting confirmation</p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center shrink-0">
          <Clock className="h-5 w-5" />
        </div>
      </div>

      {/* Financial Volume */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Booking Value</p>
          <p className="text-xl font-black text-slate-900 mt-0.5 truncate">{formatMoney(activeVolume, "USD")}</p>
          <p className="text-[11px] text-green-700 font-semibold mt-0.5">
            {paidCount} paid reservation{paidCount === 1 ? "" : "s"}
          </p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-600 flex items-center justify-center shrink-0">
          <CreditCard className="h-5 w-5" />
        </div>
      </div>

      {/* Anti-Tampering Security Audit Card */}
      <button
        type="button"
        onClick={onToggleTamperedOnly}
        className={`rounded-2xl border p-4 shadow-2xs flex items-center justify-between text-left transition-all cursor-pointer ${
          tamperedOnly
            ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-500/20"
            : tamperedCount > 0
              ? "bg-rose-50/80 border-rose-300 hover:bg-rose-100/70"
              : "bg-white border-slate-200 hover:border-emerald-300"
        }`}
      >
        <div>
          <p
            className={`text-[10px] font-bold uppercase tracking-wider ${
              tamperedOnly ? "text-rose-100" : tamperedCount > 0 ? "text-rose-700" : "text-slate-400"
            }`}
          >
            Price Audit Flags
          </p>
          <p
            className={`text-2xl font-black mt-0.5 ${
              tamperedOnly ? "text-white" : tamperedCount > 0 ? "text-rose-700" : "text-emerald-600"
            }`}
          >
            {tamperedCount}
          </p>
          <p
            className={`text-[11px] font-semibold mt-0.5 ${
              tamperedOnly ? "text-rose-100" : tamperedCount > 0 ? "text-rose-600" : "text-slate-500"
            }`}
          >
            {tamperedOnly
              ? "Showing flagged only (click to reset)"
              : tamperedCount > 0
                ? "Click to filter discrepancies"
                : "All prices server-verified"}
          </p>
        </div>
        <div
          className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${
            tamperedOnly
              ? "bg-white/15 border-white/25 text-white"
              : tamperedCount > 0
                ? "bg-rose-100 border-rose-300 text-rose-600"
                : "bg-emerald-50 border-emerald-200 text-emerald-600"
          }`}
        >
          {tamperedCount > 0 ? <ShieldAlert className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
        </div>
      </button>
    </div>
  );
}
