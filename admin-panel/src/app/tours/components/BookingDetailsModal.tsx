"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Calendar,
  Check,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  PackagePlus,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import type {
  BookingStatus,
  PackageBooking,
  PaymentStatus,
} from "@/app/tours/types/package-booking.types";
import { packageBookingService } from "@/services/package-booking.service";
import {
  BOOKING_STATUS_CONFIG,
  PAYMENT_STATUS_CONFIG,
  formatFullDateTime,
  formatMoney,
  formatOptionCalcType,
  getDisplayReference,
  getTotalPax,
  resolveOptionName,
  toNumber,
} from "../utils/bookingFormatters";

interface BookingDetailsModalProps {
  booking: PackageBooking | null;
  onClose: () => void;
  onUpdated: (updated: PackageBooking) => void;
  onNotify: (message: string, variant: "success" | "error" | "info") => void;
}

const QUICK_PAYMENT_METHODS = ["Pay on Arrival", "Stripe", "Bank Transfer", "PayPal", "Cash"];

export function BookingDetailsModal({
  booking,
  onClose,
  onUpdated,
  onNotify,
}: BookingDetailsModalProps) {
  const [detail, setDetail] = useState<PackageBooking | null>(booking);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Editable Operational & Payment Form State
  const [status, setStatus] = useState<BookingStatus>(booking?.status || "pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    booking?.paymentStatus || "unpaid"
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(booking?.paymentMethod || "");
  const [paymentTransactionId, setPaymentTransactionId] = useState<string>(
    booking?.paymentTransactionId || ""
  );
  const [saving, setSaving] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Lock background page scroll completely while modal is open
  useEffect(() => {
    if (!booking) return;

    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyPaddingRight = document.body.style.paddingRight;

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.paddingRight = prevBodyPaddingRight;
    };
  }, [booking]);

  // Sync local state & fetch freshest booking details from server when modal opens
  useEffect(() => {
    if (!booking) {
      setDetail(null);
      return;
    }

    setDetail(booking);
    setStatus(booking.status);
    setPaymentStatus(booking.paymentStatus || "unpaid");
    setPaymentMethod(booking.paymentMethod || "");
    setPaymentTransactionId(booking.paymentTransactionId || "");

    let cancelled = false;
    const fetchFresh = async () => {
      try {
        setLoadingDetail(true);
        const fresh = await packageBookingService.getBookingById(booking.id);
        if (!cancelled && fresh) {
          setDetail(fresh);
          setStatus(fresh.status);
          setPaymentStatus(fresh.paymentStatus || "unpaid");
          setPaymentMethod(fresh.paymentMethod || "");
          setPaymentTransactionId(fresh.paymentTransactionId || "");
        }
      } catch {
        // Keep initial row data cleanly if detail endpoint returns error
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    };

    void fetchFresh();
    return () => {
      cancelled = true;
    };
  }, [booking]);

  // Close with Escape key
  useEffect(() => {
    if (!booking) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [booking, onClose]);

  if (!booking || !detail) return null;

  const refCode = getDisplayReference(detail);
  const currency = detail.currency || detail.pricingSummary?.baseCurrency || "USD";
  const displayCurrency = detail.pricingSummary?.displayCurrency || currency;
  const totalPax = getTotalPax(detail);
  const isOneDay = (detail.type || detail.packageType) === "oneday";
  const isTampered = Boolean(detail.isPriceTampered);

  const breakdown = detail.pricingSummary?.breakdown;
  const appliedTier = detail.pricingSummary?.appliedTier;
  const selectedOptions = detail.selectedOptions || [];

  const baseTotal =
    detail.basePrice !== undefined && detail.basePrice !== null
      ? toNumber(detail.basePrice)
      : toNumber(detail.pricingSummary?.baseTotal, 0);
  const optionsTotal =
    detail.optionsTotal !== undefined && detail.optionsTotal !== null
      ? toNumber(detail.optionsTotal)
      : toNumber(detail.pricingSummary?.optionsTotal, 0);
  const clientGrandTotal =
    detail.totalAmount !== undefined && detail.totalAmount !== null
      ? toNumber(detail.totalAmount)
      : toNumber(detail.pricingSummary?.grandTotal, baseTotal + optionsTotal);
  const serverVerifiedAmount =
    detail.verifiedAmount !== null && detail.verifiedAmount !== undefined
      ? toNumber(detail.verifiedAmount)
      : null;

  const statusCfg = BOOKING_STATUS_CONFIG[status] || BOOKING_STATUS_CONFIG.pending;
  const paymentCfg = PAYMENT_STATUS_CONFIG[paymentStatus] || PAYMENT_STATUS_CONFIG.unpaid;

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(refCode);
      setCopiedRef(true);
      onNotify(`Copied reference ${refCode}`, "info");
      setTimeout(() => setCopiedRef(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await packageBookingService.updateBookingStatus(detail.id, {
        status,
        paymentStatus,
        paymentMethod: paymentMethod.trim() || undefined,
        paymentTransactionId: paymentTransactionId.trim() || undefined,
      });
      setDetail(updated);
      onUpdated(updated);
      onNotify(`Booking ${refCode} updated successfully.`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save booking updates";
      onNotify(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const adultCount = breakdown?.adults?.count ?? detail.travelers?.adults ?? 0;
  const coupleCount = breakdown?.couples?.count ?? detail.travelers?.couples ?? 0;
  const childCount = breakdown?.children?.count ?? detail.travelers?.children ?? 0;
  const infantCount = breakdown?.infants?.count ?? detail.travelers?.infants ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150"
      />

      {/* Wide Dynamic Enterprise Modal (Fits cleanly on desktop; smooth internal scroll on smaller laptops) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Booking details for ${refCode}`}
        className="relative z-10 flex max-h-[92vh] w-[96vw] max-w-6xl flex-col bg-slate-50 rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* 1. COMPACT BRAND HEADER */}
        <div className="bg-slate-950 text-white px-6 py-4 border-b border-slate-800 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-lg bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 font-mono text-xs font-extrabold tracking-wider text-emerald-300">
                  {refCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyRef}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-slate-200 hover:bg-white/15 transition-colors cursor-pointer"
                >
                  {copiedRef ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                    isOneDay
                      ? "bg-amber-500/15 text-amber-300 border-amber-400/30"
                      : "bg-purple-500/15 text-purple-200 border-purple-400/30"
                  }`}
                >
                  {isOneDay ? "One-Day Tour" : "Multi-Day Tour"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 ml-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <strong className="text-white">{detail.journeyDate}</strong>
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  Booked {formatFullDateTime(detail.createdAt)}
                </span>
                {loadingDetail && (
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-300">
                    <Loader2 className="w-3 h-3 animate-spin" /> Syncing
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-extrabold text-white leading-tight truncate">
                {detail.packageName}
              </h2>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-extrabold ${statusCfg.pillClass}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
                {statusCfg.label}
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold ${paymentCfg.pillClass}`}
              >
                {paymentCfg.label}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:bg-emerald-500 hover:border-emerald-500 hover:text-slate-950 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </div>

        {/* DYNAMIC INTERNAL SCROLL AREA (Zero scroll on large monitors; smooth scroll on smaller laptops) */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4">
          {/* ANTI-TAMPERING SECURITY WARNING BANNER (Full Width) */}
          {isTampered && (
            <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 px-4 py-3 flex items-center gap-3 shadow-xs">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white">
                <ShieldAlert className="w-4.5 h-4.5" />
              </div>
              <p className="text-xs text-rose-900 leading-relaxed">
                <strong className="uppercase tracking-wider mr-1.5">Security Alert:</strong>
                The client-submitted price (
                <strong>{formatMoney(clientGrandTotal, currency)}</strong>) differs from the live
                server-recalculated price (
                <strong>
                  {serverVerifiedAmount !== null
                    ? formatMoney(serverVerifiedAmount, currency)
                    : "N/A"}
                </strong>
                ). Please verify the pricing breakdown before confirming this reservation.
              </p>
            </div>
          )}

          {/* TWO-COLUMN WIDE DASHBOARD GRID (Left 7 cols: Details & Breakdown | Right 5 cols: Financials & Controls) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* ── LEFT COLUMN (7 / 12): CUSTOMER + TOUR + PRICING + ADD-ONS ── */}
            <div className="lg:col-span-7 space-y-4">
              {/* Compact Customer + Tour Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Customer Card */}
                <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" /> Customer
                    </h3>
                    <a
                      href={`mailto:${detail.email}?subject=${encodeURIComponent(
                        `Ikisaki Tours Booking ${refCode}: ${detail.packageName}`
                      )}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      <Mail className="w-3 h-3" /> Email
                    </a>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-extrabold text-slate-900 text-sm">
                      {detail.firstname} {detail.lastname}
                    </p>
                    <p className="text-[11px] text-slate-600 truncate" title={detail.email}>
                      {detail.email}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <Globe className="w-3 h-3 text-emerald-600" />
                        {detail.country || "—"}
                        {detail.locale && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">
                            {detail.locale}
                          </span>
                        )}
                      </span>
                      {detail.userId && (
                        <Link
                          href="/users"
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:underline"
                        >
                          User Profile <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Package & Tier Card */}
                <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Party &amp; Tier
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700">
                      <Users className="w-3 h-3" /> {totalPax} Pax
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    {appliedTier ? (
                      <div className="rounded-xl bg-emerald-50/80 border border-emerald-200 px-3 py-2 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1.5 truncate">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">
                            {appliedTier.label ||
                              `${appliedTier.minPax ?? "?"}–${appliedTier.maxPax ?? "?"} Pax`}
                          </span>
                        </span>
                        {appliedTier.pricePerPerson !== undefined && (
                          <span className="text-[11px] font-black text-emerald-700 whitespace-nowrap">
                            {formatMoney(appliedTier.pricePerPerson, currency)}/pax
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-[11px] text-slate-500">
                        Standard Package Rate
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 truncate">
                      Pkg ID: <code className="text-slate-600">{detail.packageId}</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* Itemized Pricing Breakdown Table */}
              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600">
                    Tour &amp; Group Pricing Breakdown
                  </h3>
                  <span className="text-xs font-black text-slate-900">
                    Base: {formatMoney(baseTotal, currency)}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-2 px-4">Category</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Unit Rate</th>
                        <th className="py-2 px-4 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {adultCount > 0 && (
                        <tr>
                          <td className="py-2 px-4 font-semibold text-slate-800">Adults (13+)</td>
                          <td className="py-2 px-3 text-center font-bold text-slate-700">
                            {adultCount}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-600">
                            {breakdown?.adults
                              ? formatMoney(breakdown.adults.unitPrice, currency)
                              : "—"}
                          </td>
                          <td className="py-2 px-4 text-right font-bold text-slate-900">
                            {breakdown?.adults ? formatMoney(breakdown.adults.total, currency) : "—"}
                          </td>
                        </tr>
                      )}

                      {coupleCount > 0 && (
                        <tr>
                          <td className="py-2 px-4">
                            <span className="font-semibold text-slate-800">Couples (2 Adults)</span>
                            <span className="ml-1.5 inline-block rounded bg-indigo-50 border border-indigo-200/70 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700">
                              {breakdown?.couples?.discountNote || "Shared Room"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-slate-700">
                            {coupleCount}{" "}
                            <span className="text-[10px] font-normal text-slate-400">
                              ({coupleCount * 2}p)
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right text-slate-600">
                            {breakdown?.couples
                              ? formatMoney(breakdown.couples.unitPrice, currency)
                              : "—"}
                          </td>
                          <td className="py-2 px-4 text-right font-bold text-slate-900">
                            {breakdown?.couples
                              ? formatMoney(breakdown.couples.total, currency)
                              : "—"}
                          </td>
                        </tr>
                      )}

                      {childCount > 0 && (
                        <tr>
                          <td className="py-2 px-4">
                            <span className="font-semibold text-slate-800">Children (2–12)</span>
                            <span className="ml-1.5 inline-block rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                              {breakdown?.children?.discountNote || "Child Rate"}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-slate-700">
                            {childCount}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-600">
                            {breakdown?.children
                              ? formatMoney(breakdown.children.unitPrice, currency)
                              : "—"}
                          </td>
                          <td className="py-2 px-4 text-right font-bold text-slate-900">
                            {breakdown?.children
                              ? formatMoney(breakdown.children.total, currency)
                              : "—"}
                          </td>
                        </tr>
                      )}

                      {infantCount > 0 && (
                        <tr>
                          <td className="py-2 px-4">
                            <span className="font-semibold text-slate-800">Infants (&lt;2)</span>
                            <span className="ml-1.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                              {breakdown?.infants?.discountNote ||
                                (breakdown?.infants?.unitPrice ? "Fee" : "Free")}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-center font-bold text-slate-700">
                            {infantCount}
                          </td>
                          <td className="py-2 px-3 text-right text-slate-600">
                            {breakdown?.infants
                              ? formatMoney(breakdown.infants.unitPrice, currency)
                              : formatMoney(0, currency)}
                          </td>
                          <td className="py-2 px-4 text-right font-bold text-emerald-700">
                            {breakdown?.infants
                              ? formatMoney(breakdown.infants.total, currency)
                              : formatMoney(0, currency)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Selected Add-On Options Card */}
              <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <PackagePlus className="w-3.5 h-3.5 text-purple-600" />
                    Selected Add-Ons ({selectedOptions.length})
                  </h3>
                  <span className="text-xs font-black text-purple-700">
                    +{formatMoney(optionsTotal, currency)}
                  </span>
                </div>

                {selectedOptions.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-400">
                    No optional add-ons or supplements were selected.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          <th className="py-2 px-4">Option</th>
                          <th className="py-2 px-3">Type</th>
                          <th className="py-2 px-3 text-center">Qty</th>
                          <th className="py-2 px-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedOptions.map((opt) => {
                          const qty = opt.count ?? 1;
                          const unit = toNumber(opt.price, 0);
                          const lineTotal =
                            opt.total !== undefined ? toNumber(opt.total, 0) : unit * qty;
                          return (
                            <tr key={opt.id}>
                              <td className="py-2 px-4 font-semibold text-slate-800">
                                {resolveOptionName(opt.name, detail.locale || "en")}
                              </td>
                              <td className="py-2 px-3">
                                <span className="inline-block rounded bg-purple-50 border border-purple-200 px-1.5 py-0.5 text-[10px] font-bold text-purple-700 whitespace-nowrap">
                                  {formatOptionCalcType(opt.calculationType)}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center font-bold text-slate-700">
                                ×{qty}
                              </td>
                              <td className="py-2 px-4 text-right font-bold text-slate-900">
                                {formatMoney(lineTotal, currency)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT COLUMN (5 / 12): FINANCIAL AUDIT + OPERATIONAL CONTROLS ── */}
            <div className="lg:col-span-5 space-y-4">
              {/* Financial Summary Card */}
              <div className="rounded-2xl bg-slate-950 text-white p-4 space-y-3 border border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Client Total
                    </p>
                    <p className="text-xl font-black text-white mt-0.5">
                      {formatMoney(clientGrandTotal, currency)}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {currency}
                      {displayCurrency !== currency ? ` · ${displayCurrency}` : ""}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Server Verified
                    </p>
                    <p
                      className={`text-xl font-black mt-0.5 ${
                        isTampered ? "text-rose-400" : "text-emerald-400"
                      }`}
                    >
                      {serverVerifiedAmount !== null
                        ? formatMoney(serverVerifiedAmount, currency)
                        : "Not Audited"}
                    </p>
                    <p className="text-[10px] mt-0.5">
                      {isTampered ? (
                        <span className="text-rose-300 font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Mismatch
                        </span>
                      ) : (
                        <span className="text-emerald-300 font-semibold inline-flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified OK
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Operational & Payment Controls Form */}
              <form
                onSubmit={handleSaveChanges}
                className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3.5 shadow-2xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    Status &amp; Payment Controls
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Booking Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as BookingStatus)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
                    >
                      <option value="unpaid">Unpaid</option>
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Payment Method
                  </label>
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="e.g. Pay on Arrival, Stripe, Bank Transfer"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {QUICK_PAYMENT_METHODS.map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Payment Transaction ID
                  </label>
                  <input
                    type="text"
                    value={paymentTransactionId}
                    onChange={(e) => setPaymentTransactionId(e.target.value)}
                    placeholder="e.g. pi_3Qx9a2... or BANK-REF-2026"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 disabled:bg-emerald-300 transition-colors shadow-xs cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
