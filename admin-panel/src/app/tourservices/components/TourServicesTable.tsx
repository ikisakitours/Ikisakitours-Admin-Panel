"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Car,
  Check,
  ChevronDown,
  Clock,
  Compass,
  Copy,
  Eye,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plane,
  Trash2,
  Users,
  X,
} from "lucide-react";
import type { TourServiceRequest } from "../types/tourservice.types";
import {
  SERVICE_CATEGORY_CONFIG,
  SERVICE_STATUS_CONFIG,
  formatServicePricingLabel,
  formatServiceRelativeTime,
  getDisplayServiceReference,
  getTotalServicePax,
  isNewServiceRequest,
} from "../utils/tourserviceFormatters";

interface TourServicesTableProps {
  services: TourServiceRequest[];
  loading: boolean;
  updatingId: string | null;
  deletingId: string | null;
  onViewDetails: (service: TourServiceRequest) => void;
  onStatusChange: (serviceId: string, newStatus: string) => Promise<void>;
  onDelete: (service: TourServiceRequest) => Promise<void>;
  onCopyReference: (reference: string) => void;
}

interface TravelerPopoverState {
  service: TourServiceRequest;
  top: number;
  left: number;
  placement: "bottom" | "top";
}

export function TourServicesTable({
  services,
  loading,
  updatingId,
  deletingId,
  onViewDetails,
  onStatusChange,
  onDelete,
  onCopyReference,
}: TourServicesTableProps) {
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

  const handleCopy = async (service: TourServiceRequest) => {
    const ref = getDisplayServiceReference(service);
    try {
      await navigator.clipboard.writeText(ref);
      setCopiedId(service.id);
      onCopyReference(ref);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      onCopyReference(ref);
    }
  };

  const handleToggleTravelers = (
    service: TourServiceRequest,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    if (travelerPopover?.service.id === service.id) {
      setTravelerPopover(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const popoverWidth = 220;
    const estimatedHeight = 210;
    const spaceBelow = window.innerHeight - rect.bottom;
    const placement: "bottom" | "top" = spaceBelow >= estimatedHeight ? "bottom" : "top";

    const rawLeft = rect.left + rect.width / 2 - popoverWidth / 2;
    const clampedLeft = Math.max(12, Math.min(rawLeft, window.innerWidth - popoverWidth - 12));
    const top = placement === "bottom" ? rect.bottom + 8 : rect.top - 8;

    setTravelerPopover({
      service,
      top,
      left: clampedLeft,
      placement,
    });
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

  if (services.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-dashed border-slate-300 py-14 px-6 text-center space-y-2">
        <Compass className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-sm font-bold text-slate-700">No tour service inquiries found</p>
        <p className="text-xs text-slate-500">
          Try adjusting your search query or switching category/status filters.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Top Meta Bar */}
      <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Tour Service Requests ({services.length})
          </span>
        </div>

        {/* Status Accent Legend */}
        <div className="hidden md:flex items-center gap-3 text-[10px] font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> Pending Review
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Approved
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-teal-500" /> Active
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> Rejected
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3 pl-4 pr-3">Ref &amp; Journey</th>
              <th className="py-3 px-3">Service &amp; Vehicle</th>
              <th className="py-3 px-3">Customer</th>
              <th className="py-3 px-3">Route / Location</th>
              <th className="py-3 px-3">Travelers</th>
              <th className="py-3 px-3">Pricing / Quote</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 pl-3 pr-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80 text-xs">
            {services.map((service, rowIndex) => {
              const refCode = getDisplayServiceReference(service);
              const totalPax = getTotalServicePax(service.travelers);
              const isTravelersOpen = travelerPopover?.service.id === service.id;
              const statusKey = (service.status || "pending").toLowerCase();
              const statusCfg = SERVICE_STATUS_CONFIG[statusKey] || SERVICE_STATUS_CONFIG.pending;
              const catCfg = SERVICE_CATEGORY_CONFIG[service.category] || SERVICE_CATEGORY_CONFIG.custom;
              const isNew = isNewServiceRequest(service.createdAt, 24);
              const pricingInfo = formatServicePricingLabel(service);
              const isBusy = updatingId === service.id || deletingId === service.id;

              return (
                <tr
                  key={service.id}
                  className={`border-l-[3px] ${statusCfg.borderClass} transition-colors odd:bg-white even:bg-slate-50/65 hover:bg-emerald-50/45`}
                >
                  {/* 1. Row # + Reference + Journey Date (Exact Match with Tour Bookings) */}
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
                        onClick={() => handleCopy(service)}
                        title="Copy service reference"
                        className={`p-1 rounded-md border transition-colors cursor-pointer ${
                          copiedId === service.id
                            ? "border-emerald-300 bg-emerald-100 text-emerald-700"
                            : "border-slate-200 bg-white text-slate-400 hover:text-emerald-700 hover:border-emerald-300"
                        }`}
                      >
                        {copiedId === service.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                      {isNew && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-200 animate-pulse" />
                          New
                        </span>
                      )}
                    </div>

                    <div className="mt-1.5 pl-6 flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                        <Calendar className="w-3 h-3 text-emerald-600 shrink-0" />
                        {service.journeyDate || "—"}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[10px] text-slate-400">
                        {formatServiceRelativeTime(service.createdAt)}
                      </span>
                    </div>
                  </td>

                  {/* 2. Service & Vehicle (Clean Unified Layout) */}
                  <td className="py-3.5 px-3 align-middle max-w-[190px]">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${catCfg.pillClass}`}
                    >
                      {service.category === "custom" && <Compass className="w-3 h-3" />}
                      {service.category === "chauffeur" && <Car className="w-3 h-3" />}
                      {service.category === "transfer" && <Plane className="w-3 h-3" />}
                      <span>{catCfg.label}</span>
                    </span>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wide mt-1 truncate">
                      {service.vehicleType || "Standard Vehicle"}
                    </p>
                  </td>

                  {/* 3. Customer (Clean Name + Email Subtitle) */}
                  <td className="py-3.5 px-3 align-middle max-w-[170px] whitespace-nowrap">
                    <p className="font-extrabold text-slate-900 text-xs truncate">
                      {service.fullName || "—"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5" title={service.email}>
                      {service.email || "—"}
                    </p>
                  </td>

                  {/* 4. Route / Location (Safely Truncated with Tooltips & MapPin) */}
                  <td className="py-3.5 px-3 align-middle max-w-[200px]">
                    <div
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 max-w-[195px]"
                      title={`${service.pickupLocation || "Pickup"}${
                        service.dropOffLocation ? ` → ${service.dropOffLocation}` : ""
                      }`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div className="flex items-center gap-1 min-w-0 truncate">
                        <span className="truncate font-bold text-slate-900" title={service.pickupLocation}>
                          {service.pickupLocation || "Pickup"}
                        </span>
                        {service.dropOffLocation && (
                          <>
                            <span className="text-slate-400 shrink-0 text-[11px]">→</span>
                            <span className="truncate text-slate-600 font-medium" title={service.dropOffLocation}>
                              {service.dropOffLocation}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {service.pickupTime && (
                      <p className="text-[10px] text-slate-400 mt-0.5 font-medium flex items-center gap-1 pl-5">
                        <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                        <span>Pickup: {service.pickupTime}</span>
                      </p>
                    )}
                  </td>

                  {/* 5. Pax & Communication Language */}
                  <td className="py-3 px-3 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        data-traveler-trigger="true"
                        onClick={(e) => handleToggleTravelers(service, e)}
                        aria-expanded={isTravelersOpen}
                        title="Click to view traveler breakdown"
                        className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-extrabold cursor-pointer transition-colors ${
                          isTravelersOpen
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "bg-indigo-50 text-indigo-700 border-indigo-200/80 hover:bg-emerald-50 hover:text-emerald-700"
                        }`}
                      >
                        <Users className="w-3 h-3" />
                        <span>{totalPax}p</span>
                        <ChevronDown className="w-2.5 h-2.5" />
                      </button>

                      {service.language && (
                        <span
                          title={`Preferred Communication Language: ${service.language}`}
                          className="rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 uppercase"
                        >
                          {service.language}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 6. Pricing / Quote */}
                  <td className="py-3 px-3 align-middle whitespace-nowrap">
                    <p className="text-xs font-extrabold text-slate-900">
                      {pricingInfo.primary}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[130px]" title={pricingInfo.secondary}>
                      {pricingInfo.secondary}
                    </p>
                  </td>

                  {/* 7. Status Selector */}
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <select
                        aria-label={`Status for ${refCode}`}
                        value={statusKey}
                        disabled={isBusy}
                        onChange={(e) => onStatusChange(service.id, e.target.value)}
                        className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold outline-none cursor-pointer transition-colors ${statusCfg.pillClass}`}
                      >
                        <option value="pending" className="bg-white text-slate-800">Pending</option>
                        <option value="approved" className="bg-white text-slate-800">Approved</option>
                        <option value="active" className="bg-white text-slate-800">Active</option>
                        <option value="completed" className="bg-white text-slate-800">Completed</option>
                        <option value="rejected" className="bg-white text-slate-800">Rejected</option>
                      </select>
                      {updatingId === service.id && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      )}
                    </div>
                  </td>

                  {/* 8. Actions */}
                  <td className="py-3.5 pl-3 pr-4 align-middle text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetails(service)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>

                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => onDelete(service)}
                        title="Delete or cancel service request"
                        className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-1.5 text-rose-600 hover:bg-rose-600 hover:text-white hover:border-rose-600 disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {deletingId === service.id ? (
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
        const t = travelerPopover.service.travelers || {};
        const adults = Number(t.adults) || 0;
        const couples = Number(t.couples) || 0;
        const children = Number(t.children) || 0;
        const infants = Number(t.infants) || 0;
        const total = getTotalServicePax(t);

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
            className="fixed z-40 w-[220px] rounded-xl border border-slate-200 bg-white shadow-xl ring-1 ring-slate-900/5 overflow-hidden"
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
