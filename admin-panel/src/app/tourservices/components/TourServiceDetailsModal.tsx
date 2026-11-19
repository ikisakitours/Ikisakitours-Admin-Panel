"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Car,
  Check,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plane,
  Save,
  Send,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import type { TourServiceRequest } from "../types/tourservice.types";
import { tourServiceAdmin } from "@/services/tourservice.service";
import {
  SERVICE_CATEGORY_CONFIG,
  SERVICE_STATUS_CONFIG,
  formatServiceFullDateTime,
  formatServiceMoney,
  getDisplayServiceReference,
  getTotalServicePax,
} from "../utils/tourserviceFormatters";

interface TourServiceDetailsModalProps {
  service: TourServiceRequest | null;
  onClose: () => void;
  onUpdated: (updated: TourServiceRequest) => void;
  onNotify: (message: string, variant: "success" | "error" | "info") => void;
}

export function TourServiceDetailsModal({
  service,
  onClose,
  onUpdated,
  onNotify,
}: TourServiceDetailsModalProps) {
  const [detail, setDetail] = useState<TourServiceRequest | null>(service);
  const [status, setStatus] = useState<string>(service?.status || "pending");
  const [saving, setSaving] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);

  // Lock background page scroll without touching html overflow (prevents sticky Sidebar from shifting)
  useEffect(() => {
    if (!service) return;

    const lockedScrollY = window.scrollY;
    const lockedScrollX = window.scrollX;

    const lockWindowScroll = () => {
      if (window.scrollY !== lockedScrollY || window.scrollX !== lockedScrollX) {
        window.scrollTo(lockedScrollX, lockedScrollY);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const container = modalScrollRef.current;
      const target = e.target as Node | null;
      if (!container || !target || !container.contains(target)) {
        e.preventDefault();
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = container;
      const canScroll = scrollHeight > clientHeight + 1;
      if (!canScroll) {
        e.preventDefault();
        return;
      }

      const scrollingUp = e.deltaY < 0;
      const scrollingDown = e.deltaY > 0;
      if ((scrollingUp && scrollTop <= 0) || (scrollingDown && scrollTop + clientHeight >= scrollHeight - 1)) {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const container = modalScrollRef.current;
      const target = e.target as Node | null;
      if (!container || !target || !container.contains(target)) {
        e.preventDefault();
      }
    };

    window.addEventListener("scroll", lockWindowScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("scroll", lockWindowScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [service]);

  useEffect(() => {
    if (service) {
      queueMicrotask(() => {
        setDetail(service);
        setStatus(service.status);
      });
    }
  }, [service]);

  // Close with Escape key
  useEffect(() => {
    if (!service) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [service, onClose]);

  if (!service || !detail) return null;

  const refCode = getDisplayServiceReference(detail);
  const totalPax = getTotalServicePax(detail.travelers);
  const statusKey = (status || "pending").toLowerCase();
  const statusCfg = SERVICE_STATUS_CONFIG[statusKey] || SERVICE_STATUS_CONFIG.pending;
  const catCfg = SERVICE_CATEGORY_CONFIG[detail.category] || SERVICE_CATEGORY_CONFIG.custom;

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(refCode);
      setCopiedRef(true);
      onNotify(`Copied reference ${refCode}`, "info");
      setTimeout(() => setCopiedRef(false), 1800);
    } catch {
      // ignore
    }
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await tourServiceAdmin.updateServiceStatus(detail.id, status);
      const merged = { ...detail, ...updated, status };
      setDetail(merged);
      onUpdated(merged);
      onNotify(`Service request ${refCode} updated to ${status.toUpperCase()}`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update service status";
      onNotify(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const travelers = detail.travelers || {};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Tour Service Details for ${refCode}`}
        className="relative z-10 flex max-h-[95vh] w-[96vw] max-w-5xl flex-col bg-slate-50 rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* 1. Header */}
        <div className="bg-slate-950 text-white px-6 sm:px-7 py-5 border-b border-slate-800 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-lg bg-emerald-500/15 border border-emerald-400/35 px-2.5 py-1 font-mono text-xs font-extrabold tracking-wider text-emerald-300">
                {refCode}
              </span>
              <button
                type="button"
                onClick={handleCopyRef}
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-white/15 transition-colors cursor-pointer"
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
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border ${catCfg.pillClass}`}
              >
                {detail.category === "custom" && <Compass className="w-3 h-3" />}
                {detail.category === "chauffeur" && <Car className="w-3 h-3" />}
                {detail.category === "transfer" && <Plane className="w-3 h-3" />}
                <span>{catCfg.label}</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-extrabold ${statusCfg.pillClass}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
                {statusCfg.label}
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

          <h2 className="mt-3 text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
            {detail.fullName} — {detail.vehicleType || "Tour Service Request"}
          </h2>

          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400">Journey Date:</span>
              <strong className="text-white">{detail.journeyDate || "—"}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Requested:</span>
              <span className="text-slate-200 font-medium">
                {formatServiceFullDateTime(detail.createdAt)}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <Users className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <strong className="text-white">{totalPax} Pax</strong>
            </span>
          </div>
        </div>

        {/* 2. Scrollable Body */}
        <div
          ref={modalScrollRef}
          className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (7 cols): Customer + Route + Service Specs + Description */}
            <div className="lg:col-span-7 space-y-4">
              {/* Customer & Route Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Customer Card */}
                <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" /> Customer
                    </h3>
                    <a
                      href={`mailto:${detail.email}?subject=${encodeURIComponent(
                        `Ikisaki Tours: ${catCfg.label} Inquiry (${refCode})`
                      )}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      <Mail className="w-3 h-3" /> Email
                    </a>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-extrabold text-slate-900 text-sm">{detail.fullName}</p>
                    <p className="text-[11px] text-slate-600 truncate" title={detail.email}>
                      {detail.email || "—"}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[11px]">
                      <a
                        href={`tel:${detail.phoneNumber}`}
                        className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                      >
                        <Phone className="w-3 h-3" /> {detail.phoneNumber || "—"}
                      </a>
                      {detail.language && (
                        <span
                          title="Guest preferred language to communicate with driver / guide"
                          className="rounded bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 uppercase"
                        >
                          Lang: {detail.language}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Service Specs Card */}
                <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-emerald-600" /> Service &amp; Vehicle
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700">
                      <Users className="w-3 h-3" /> {totalPax} Pax
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <p className="font-extrabold text-slate-900">{detail.vehicleType || "Standard Vehicle"}</p>
                    {detail.transferServiceType && (
                      <p className="text-[11px] text-teal-700 font-semibold">
                        Transfer Type: <span className="capitalize">{detail.transferServiceType}</span>
                      </p>
                    )}
                    {detail.tourPackageType && (
                      <p className="text-[11px] text-purple-700 font-semibold">
                        Driver/Guide: <span>{detail.tourPackageType}</span>
                      </p>
                    )}
                    {detail.flightNumber && (
                      <p className="text-[10px] text-slate-500">
                        Flight #: <code className="text-slate-700">{detail.flightNumber}</code>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Route & Schedule Card */}
              <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Route &amp; Schedule
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Pickup Location
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">{detail.pickupLocation || "—"}</p>
                    {detail.pickupTime && (
                      <p className="text-[10px] text-slate-500 mt-1">Time: {detail.pickupTime}</p>
                    )}
                  </div>

                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Drop-off Location
                    </span>
                    <p className="font-bold text-slate-900 mt-0.5">{detail.dropOffLocation || "As per custom itinerary"}</p>
                    {detail.tourDuration && (
                      <p className="text-[10px] text-slate-500 mt-1">Duration: {detail.tourDuration}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Party Breakdown Card */}
              <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-600" /> Travelers Headcount ({totalPax})
                </h3>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Adults</p>
                    <p className="text-base font-extrabold text-slate-800 mt-0.5">{travelers.adults || 0}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Couples</p>
                    <p className="text-base font-extrabold text-slate-800 mt-0.5">
                      {travelers.couples || 0}
                      <span className="text-[10px] font-normal text-slate-400 block">
                        ({(travelers.couples || 0) * 2}p)
                      </span>
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Children</p>
                    <p className="text-base font-extrabold text-slate-800 mt-0.5">{travelers.children || 0}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Infants</p>
                    <p className="text-base font-extrabold text-slate-800 mt-0.5">{travelers.infants || 0}</p>
                  </div>
                </div>
              </div>

              {/* Description & Special Requests */}
              {(detail.description || detail.specialRequests) && (
                <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    Client Requirements &amp; Notes
                  </h3>
                  {detail.description && (
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-700 leading-relaxed">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Description / Itinerary Requests
                      </p>
                      <p className="whitespace-pre-wrap">{detail.description}</p>
                    </div>
                  )}
                  {detail.specialRequests && (
                    <div className="rounded-xl bg-amber-50/70 border border-amber-200/70 p-3 text-xs text-amber-900 leading-relaxed">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                        Special Requests
                      </p>
                      <p className="whitespace-pre-wrap">{detail.specialRequests}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column (5 cols): Pricing & Operations Controls */}
            <div className="lg:col-span-5 space-y-4">
              {/* Pricing & Quote Summary */}
              <div className="rounded-2xl bg-slate-950 text-white p-4 space-y-3 border border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                    Pricing &amp; Quote Status
                  </h3>
                  {detail.category === "transfer" && (
                    <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 text-[10px] font-bold">
                      Distance-Based Quote
                    </span>
                  )}
                </div>

                {detail.category === "transfer" ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Base Vehicle Rate
                        </p>
                        <p className="text-xl font-black text-emerald-400 mt-0.5">
                          {formatServiceMoney(detail.startingPrice || detail.price)}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">From Service Notes</p>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Route Fare Quote
                        </p>
                        <p className="text-sm font-extrabold text-amber-300 mt-1">
                          Distance Based
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Admin emails guest</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed px-1">
                      Airport &amp; Intercity transfers combine the vehicle base rate above with route mileage, then quoted to the client directly via email.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Base Charter Rate
                      </p>
                      <p className="text-xl font-black text-white mt-0.5">
                        {formatServiceMoney(detail.startingPrice)}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Starting rate</p>
                    </div>
                    <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Selected Option
                      </p>
                      <p className="text-xl font-black text-emerald-400 mt-0.5">
                        {formatServiceMoney(detail.selectedPrice)}
                      </p>
                      <p className="text-[10px] text-emerald-300 mt-0.5 truncate" title={detail.tourPackageType || "Standard"}>
                        {detail.tourPackageType || "Selected tier"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Operations Control Form */}
              <form
                onSubmit={handleSaveStatus}
                className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3.5"
              >
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Manage Status
                  </h3>
                  <span className="text-[10px] text-slate-400">Live operational sync</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Service Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active / Dispatched</option>
                    <option value="completed">Completed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>

              {/* Quick Communication Card */}
              <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
                <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Quick Client Response
                </h3>
                <p className="text-xs text-slate-600">
                  Send a fast reply or custom quote directly to this client via their email.
                </p>
                <a
                  href={`mailto:${detail.email}?subject=${encodeURIComponent(
                    `Ikisaki Tours: Quote & Confirmation for ${detail.vehicleType} (${refCode})`
                  )}&body=${encodeURIComponent(
                    `Dear ${detail.fullName},\n\nThank you for choosing Ikisaki Tours for your ${catCfg.label} in Sri Lanka.\n\nWe have reviewed your request for ${detail.journeyDate} from ${detail.pickupLocation}${detail.dropOffLocation ? ` to ${detail.dropOffLocation}` : ""}.\n\nBest regards,\nIkisaki Tours Operations Team`
                  )}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 p-2.5 text-xs font-bold text-slate-700 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Launch Email Response</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
