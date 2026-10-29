"use client";

import { useState } from "react";
import { Calendar, Clock, MapPin, User, Phone, Mail, Loader2 } from "lucide-react";
import { tourServiceAdmin } from "@/services/tourservice.service";

interface TourServiceCardProps {
    item: any;
    onStatusChange?: (updatedItem: any) => void;
}

export default function TourServiceCard({ item, onStatusChange }: TourServiceCardProps) {
    const [status, setStatus] = useState(item.status || "pending");
    const [loading, setLoading] = useState(false);

    // Handle instant status change from the card
    const handleStatusUpdate = async (newStatus: string) => {
        try {
            setLoading(true);
            const updated = await tourServiceAdmin.updateServiceStatus(item.id, newStatus);
            setStatus(newStatus);
            if (onStatusChange) {
                onStatusChange(updated);
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update status. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Dynamic background and text colors matched strictly with backend ServiceStatus enum
    const getStatusStyles = (currentStatus: string) => {
        switch (currentStatus?.toLowerCase()) {
            case 'approved':
            case 'active':
                return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'rejected':
                return 'bg-rose-50 text-rose-700 border-rose-200';
            case 'pending':
            default:
                return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
            <div className="space-y-3">
                {/* Top Badge & Vehicle */}
                <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded-md uppercase tracking-wider">
                        {item.vehicleType}
                    </span>
                    {item.transferServiceType && (
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md capitalize">
                            {item.transferServiceType}
                        </span>
                    )}
                    <span className="text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                </div>

                {/* Contact Person */}
                <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-indigo-600" />
                        {item.fullName}
                    </h3>
                    <div className="text-xs text-slate-500 mt-1 flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5"><Mail className="w-3 h-3 text-slate-400" /> {item.email}</span>
                        <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> {item.phoneNumber}</span>
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* Trip Details */}
                <div className="text-xs space-y-1.5 text-slate-600">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate"><strong>From:</strong> {item.pickupLocation}</span>
                    </div>
                    {item.dropOffLocation && (
                        <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span className="truncate"><strong>To:</strong> {item.dropOffLocation}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-4 pt-1">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {item.journeyDate}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {item.pickupTime}</span>
                    </div>
                </div>

                {/* Travelers & Duration */}
                <div className="bg-slate-50 p-2.5 rounded-lg text-[11px] text-slate-600 grid grid-cols-2 gap-2">
                    <div><strong>Language:</strong> {item.language}</div>
                    {item.tourDuration && <div><strong>Duration:</strong> {item.tourDuration}</div>}
                    <div className="col-span-2">
                        <strong>Travelers:</strong> Adults ({item.travelers?.adults || 0}), Couples ({item.travelers?.couples || 0}), Children ({item.travelers?.children || 0}), Infants ({item.travelers?.infants || 0})
                    </div>
                </div>

                {item.description && (
                    <p className="text-xs text-slate-500 bg-amber-50/50 p-2 rounded-lg border border-amber-100/50 italic">
                        &quot;{item.description}&quot;
                    </p>
                )}
            </div>

            {/* Status Footer with Backend-Synced Options */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-medium">Update Status:</span>
                <div className="flex items-center gap-2">
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />}
                    <select
                        value={status}
                        disabled={loading}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${getStatusStyles(status)}`}
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="active">Active</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
            </div>
        </div>
    );
}