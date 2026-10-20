"use client";

import { Calendar, Clock, MapPin, User, Phone, Mail } from "lucide-react";

interface TourServiceCardProps {
    item: any;
}

export default function TourServiceCard({ item }: TourServiceCardProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-sm flex flex-col justify-between">
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

            {/* Status Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-medium">Status: <span className="text-amber-600 capitalize font-semibold">{item.status}</span></span>
                <button className="text-indigo-600 font-semibold hover:text-indigo-800">View Details</button>
            </div>
        </div>
    );
}