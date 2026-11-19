"use client";

import React, { useState } from "react";
import { Plus, Save, X, ClipboardList, Globe, Car, Plane, Compass, Sparkles, DollarSign, Users, Briefcase } from "lucide-react";
import { ServiceNotePayload } from "@/services/service-notes.service";

const ALLOWED_SERVICE_TYPES = [
    { value: "custom", label: "Custom Tour Itinerary", icon: Compass },
    { value: "chauffeur", label: "Private Chauffeur Hire", icon: Car },
    { value: "transfer", label: "Airport & Intercity Transfer", icon: Plane },
];

const VEHICLE_PRESETS = ["SUV", "Sedan", "Van", "Mini Coach", "Luxury Coach"];

interface Props {
    formData: ServiceNotePayload;
    setFormData: React.Dispatch<React.SetStateAction<ServiceNotePayload>>;
    locale: string;
    editingId?: string | number | null;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    onCancel?: () => void;
}

export default function ServiceNoteForm({
    formData,
    setFormData,
    locale,
    editingId,
    onSubmit,
    onCancel,
}: Props) {
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [isCustomVehicle, setIsCustomVehicle] = useState<boolean>(
        Boolean(formData.vehicleType && !VEHICLE_PRESETS.includes(formData.vehicleType))
    );
    const isTransfer = formData.serviceType === "transfer";

    // Helper for record-based string fields or regular values
    const handleRecordChange = (field: keyof ServiceNotePayload, value: any) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Helper for multilingual notes array lines per locale
    const handleNoteChange = (index: number, value: string) => {
        setFormData((prev) => {
            const currentLocaleNotes = [...(prev.notes?.[locale] || [""])];
            currentLocaleNotes[index] = value;
            return {
                ...prev,
                notes: {
                    ...prev.notes,
                    [locale]: currentLocaleNotes,
                },
            };
        });
    };

    const addNoteLine = () => {
        setFormData((prev) => ({
            ...prev,
            notes: {
                ...prev.notes,
                [locale]: [...(prev.notes?.[locale] || []), ""],
            },
        }));
    };

    const removeNoteLine = (index: number) => {
        setFormData((prev) => {
            const currentLocaleNotes = [...(prev.notes?.[locale] || [])];
            currentLocaleNotes.splice(index, 1);
            return {
                ...prev,
                notes: {
                    ...prev.notes,
                    [locale]: currentLocaleNotes.length ? currentLocaleNotes : [""],
                },
            };
        });
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            // For transfer, omit driver/guide tier rates
            if (isTransfer) {
                const cleaned: ServiceNotePayload = {
                    ...formData,
                    withDriverPrice: "",
                    withGuidePrice: "",
                    withDriverAndGuidePrice: "",
                };
                setFormData(cleaned);
            }
            await onSubmit(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="bg-slate-950 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <ClipboardList className="w-4 h-4" />
                    </span>
                    <div>
                        <h3 className="text-sm font-extrabold tracking-tight">
                            {editingId ? `Edit Service Guideline #${editingId}` : "Create New Service Guideline"}
                        </h3>
                        <p className="text-[10px] text-slate-400">
                            Editing {locale === "ja" ? "日本語 (Japanese)" : "English"} translation
                        </p>
                    </div>
                </div>

                {editingId && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-xs text-rose-300 hover:text-white flex items-center gap-1 font-bold py-1 px-2.5 rounded-lg border border-rose-500/30 bg-rose-500/10 cursor-pointer"
                    >
                        <X className="w-3.5 h-3.5" /> Cancel Edit
                    </button>
                )}
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-6">
                {/* 1. Core Vehicle & Service Specs */}
                <div>
                    <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Service Type &amp; Vehicle Specifications
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Service Type */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Service Type</label>
                            <select
                                value={formData.serviceType}
                                onChange={(e) => handleRecordChange("serviceType", e.target.value)}
                                className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 outline-none bg-slate-50 focus:bg-white focus:border-emerald-500 cursor-pointer"
                                required
                            >
                                {ALLOWED_SERVICE_TYPES.map((type) => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Vehicle Type / Model Selector & Custom Input */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                                    <Car className="w-3 h-3 text-slate-400" /> Vehicle Type / Model
                                </label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const next = !isCustomVehicle;
                                        setIsCustomVehicle(next);
                                        if (!next && !VEHICLE_PRESETS.includes(formData.vehicleType)) {
                                            handleRecordChange("vehicleType", "SUV");
                                        }
                                    }}
                                    className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                                >
                                    {isCustomVehicle ? "← Choose Preset" : "+ Custom Type"}
                                </button>
                            </div>

                            {isCustomVehicle ? (
                                <input
                                    type="text"
                                    required
                                    value={formData.vehicleType}
                                    onChange={(e) => handleRecordChange("vehicleType", e.target.value)}
                                    placeholder="Type custom vehicle name (e.g. Electric SUV, Tuk-Tuk)"
                                    className="w-full text-xs border border-emerald-400 rounded-xl p-2.5 outline-none bg-white focus:ring-1 focus:ring-emerald-500 font-bold text-slate-900"
                                />
                            ) : (
                                <select
                                    value={formData.vehicleType || ""}
                                    onChange={(e) => {
                                        if (e.target.value === "__custom__") {
                                            setIsCustomVehicle(true);
                                            handleRecordChange("vehicleType", "");
                                        } else {
                                            handleRecordChange("vehicleType", e.target.value);
                                        }
                                    }}
                                    className="w-full text-xs font-bold border border-slate-200 rounded-xl p-2.5 outline-none bg-slate-50 focus:bg-white focus:border-emerald-500 cursor-pointer text-slate-900"
                                    required
                                >
                                    <option value="" disabled>Select vehicle type...</option>
                                    {VEHICLE_PRESETS.map((preset) => (
                                        <option key={preset} value={preset}>
                                            {preset}
                                        </option>
                                    ))}
                                    <option value="__custom__">+ Custom Vehicle Type...</option>
                                </select>
                            )}
                        </div>

                        {/* Starting Base Price */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                                <DollarSign className="w-3 h-3 text-emerald-600" />
                                {isTransfer ? "Base Transfer Rate" : "Starting Base Rate"}
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.startingPrice}
                                onChange={(e) => handleRecordChange("startingPrice", e.target.value)}
                                placeholder="e.g. $45 or 45"
                                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none bg-slate-50 focus:bg-white focus:border-emerald-500 font-bold text-emerald-900"
                            />
                        </div>

                        {/* Vehicle Capacity */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                                <Users className="w-3 h-3 text-slate-400" /> Passenger Capacity
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.vehicleCapacity}
                                onChange={(e) => handleRecordChange("vehicleCapacity", e.target.value)}
                                placeholder="e.g. 1-4 Passengers or 7 Seats"
                                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none bg-slate-50 focus:bg-white focus:border-emerald-500"
                            />
                        </div>

                        {/* Luggages */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-slate-400" /> Luggage Allowance
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.luggages}
                                onChange={(e) => handleRecordChange("luggages", e.target.value)}
                                placeholder="e.g. 2-3 Suitcases"
                                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none bg-slate-50 focus:bg-white focus:border-emerald-500"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Driver / Guide Pricing Options — CONDITIONAL (HIDDEN FOR TRANSFERS) */}
                <div className="border-t border-slate-100 pt-4">
                    {isTransfer ? (
                        <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
                            <Plane className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-extrabold">Airport &amp; Intercity Transfer Rule</p>
                                <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                                    Transfers are charged based on the base vehicle rate above plus mileage/toll calculated by admin. 
                                    Driver/Guide tiers are not applicable and are automatically omitted from database records.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Driver &amp; Guide Tier Pricing
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">With Driver Price</label>
                                    <input
                                        type="text"
                                        required={!isTransfer}
                                        value={formData.withDriverPrice || ""}
                                        onChange={(e) => handleRecordChange("withDriverPrice", e.target.value)}
                                        placeholder="e.g. $60 or 60"
                                        className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none bg-slate-50 focus:bg-white focus:border-emerald-500 font-semibold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">With Guide Price</label>
                                    <input
                                        type="text"
                                        required={!isTransfer}
                                        value={formData.withGuidePrice || ""}
                                        onChange={(e) => handleRecordChange("withGuidePrice", e.target.value)}
                                        placeholder="e.g. $75 or 75"
                                        className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none bg-slate-50 focus:bg-white focus:border-emerald-500 font-semibold"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">With Driver &amp; Guide Price</label>
                                    <input
                                        type="text"
                                        required={!isTransfer}
                                        value={formData.withDriverAndGuidePrice || ""}
                                        onChange={(e) => handleRecordChange("withDriverAndGuidePrice", e.target.value)}
                                        placeholder="e.g. $95 or 95"
                                        className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none bg-slate-50 focus:bg-white focus:border-emerald-500 font-semibold"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* 3. Multilingual Policy Bullets */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                            <Globe className="w-4 h-4 text-emerald-600" />
                            Service Guideline Bullet Points ({locale.toUpperCase()})
                        </label>
                        <span className="text-[10px] text-slate-400">
                            Bullet points shown to guest on booking modal
                        </span>
                    </div>

                    <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {(formData.notes?.[locale] || [""]).map((noteLine, index) => (
                            <div key={index} className="flex gap-2">
                                <span className="flex h-9 w-6 items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                                    #{index + 1}
                                </span>
                                <input
                                    type="text"
                                    value={noteLine}
                                    onChange={(e) => handleNoteChange(index, e.target.value)}
                                    placeholder={`Enter ${locale.toUpperCase()} guideline bullet #${index + 1}`}
                                    className="w-full text-xs border border-slate-200 rounded-xl p-2.5 outline-none bg-white focus:border-emerald-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeNoteLine(index)}
                                    title="Remove line"
                                    className="px-3 text-rose-500 hover:bg-rose-50 rounded-xl border border-slate-200 bg-white cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addNoteLine}
                            className="mt-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 py-1 cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add another {locale.toUpperCase()} bullet point
                        </button>
                    </div>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                    {editingId && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-extrabold hover:bg-emerald-700 flex items-center gap-2 shadow-xs disabled:opacity-50 transition-all cursor-pointer"
                    >
                        <Save className="w-3.5 h-3.5" />
                        {submitting ? "Saving..." : editingId ? "Update Service Guideline" : "Save Service Guideline"}
                    </button>
                </div>
            </form>
        </div>
    );
}