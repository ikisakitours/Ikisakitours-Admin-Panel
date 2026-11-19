"use client";

import { useState } from "react";
import {
  Calendar,
  Car,
  Clock,
  Compass,
  Eye,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plane,
  Trash2,
  Users,
} from "lucide-react";
import type { TourServiceRequest } from "../types/tourservice.types";
import {
  SERVICE_CATEGORY_CONFIG,
  SERVICE_STATUS_CONFIG,
  formatServiceMoney,
  formatServiceRelativeTime,
  getDisplayServiceReference,
  getTotalServicePax,
} from "../utils/tourserviceFormatters";

interface TourServiceCardProps {
  item: TourServiceRequest;
  onViewDetails?: (item: TourServiceRequest) => void;
  onStatusChange?: (serviceId: string, newStatus: string) => Promise<void>;
  onDelete?: (item: TourServiceRequest) => Promise<void>;
}

export default function TourServiceCard({
  item,
  onViewDetails,
  onStatusChange,
  onDelete,
}: TourServiceCardProps) {
  const [loading, setLoading] = useState(false);

  const refCode = getDisplayServiceReference(item);
  const totalPax = getTotalServicePax(item.travelers);
  const statusKey = (item.status || "pending").toLowerCase();
  const statusCfg = SERVICE_STATUS_CONFIG[statusKey] || SERVICE_STATUS_CONFIG.pending;
  const catCfg = SERVICE_CATEGORY_CONFIG[item.category] || SERVICE_CATEGORY_CONFIG.custom;

  const handleStatusUpdate = async (newStatus: string) => {
    if (!onStatusChange) return;
    try {
      setLoading(true);
      await onStatusChange(item.id, newStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between">
      <div className="space-y-3.5">
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
              {refCode}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${catCfg.pillClass}`}
            >
              {item.category === "custom" && <Compass className="w-3 h-3" />}
              {item.category === "chauffeur" && <Car className="w-3 h-3" />}
              {item.category === "transfer" && <Plane className="w-3 h-3" />}
              <span>{catCfg.label}</span>
            </span>
          </div>

          <span className="text-[10px] font-semibold text-slate-400">
            {formatServiceRelativeTime(item.createdAt)}
          </span>
        </div>

        {/* Vehicle & Customer */}
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 truncate">
              {item.vehicleType || "Standard Vehicle"}
            </h3>
            {item.transferServiceType && (
              <span className="rounded bg-teal-50 border border-teal-200/70 px-1.5 py-0.5 text-[9px] font-bold text-teal-700 capitalize">
                {item.transferServiceType}
              </span>
            )}
          </div>
          <p className="text-xs font-bold text-slate-700 mt-1">{item.fullName}</p>
          <div className="flex flex-col gap-0.5 text-[11px] text-slate-500 mt-1">
            <span className="flex items-center gap-1.5 truncate">
              <Mail className="w-3 h-3 text-slate-400 shrink-0" /> {item.email || "—"}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {item.phoneNumber || "—"}
            </span>
          </div>
        </div>

        {/* Route & Schedule */}
        <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-3 text-xs space-y-1.5 text-slate-700">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">
              <strong>From:</strong> {item.pickupLocation}
            </span>
          </div>
          {item.dropOffLocation && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-3.5 text-center text-[10px] text-rose-500 font-bold">↳</span>
              <span className="truncate">
                <strong>To:</strong> {item.dropOffLocation}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 border-t border-slate-200/60">
            <span className="flex items-center gap-1 font-semibold text-slate-700">
              <Calendar className="w-3 h-3 text-emerald-600" /> {item.journeyDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> {item.pickupTime}
            </span>
            <span className="flex items-center gap-1 font-bold text-indigo-700">
              <Users className="w-3 h-3" /> {totalPax}p
            </span>
          </div>
        </div>

        {/* Pricing Estimate */}
        {(item.selectedPrice || item.startingPrice) && (
          <div className="flex items-center justify-between text-xs px-1">
            <span className="text-[11px] text-slate-400 font-semibold">Quote / Rate</span>
            <span className="text-sm font-black text-slate-900">
              {formatServiceMoney(item.selectedPrice || item.startingPrice)}
            </span>
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <select
            value={statusKey}
            disabled={loading}
            onChange={(e) => handleStatusUpdate(e.target.value)}
            className={`rounded-lg border px-2.5 py-1 text-[11px] font-bold outline-none cursor-pointer transition-colors ${statusCfg.pillClass}`}
          >
            <option value="pending" className="bg-white text-slate-800">Pending</option>
            <option value="approved" className="bg-white text-slate-800">Approved</option>
            <option value="active" className="bg-white text-slate-800">Active</option>
            <option value="completed" className="bg-white text-slate-800">Completed</option>
            <option value="rejected" className="bg-white text-slate-800">Rejected</option>
          </select>
          {loading && <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />}
        </div>

        <div className="flex items-center gap-1.5">
          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(item)}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
            >
              <Eye className="w-3 h-3" />
              <span>View</span>
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(item)}
              title="Delete request"
              className="p-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
