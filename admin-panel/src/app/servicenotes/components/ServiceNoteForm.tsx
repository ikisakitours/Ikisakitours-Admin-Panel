"use client";

import React, { useState, useEffect } from "react";
import { Plus, Save, X, ClipboardList, Globe } from "lucide-react";
import { ServiceNotePayload } from "@/services/service-notes.service";

const ALLOWED_SERVICE_TYPES = [
    "round_tours",
    "day_tours",
    "airport_transfers",
];

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

    // Helper for record-based string fields if any are added later, or regular values
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
            await onSubmit(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white shadow-sm rounded-xl p-6 border border-slate-100 space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-indigo-500" />
                    {editingId ? `Edit Service Note #${editingId}` : "Create Service Note"} ({locale.toUpperCase()})
                </h3>
                {editingId && onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium"
                    >
                        <X className="w-3.5 h-3.5" /> Cancel Edit
                    </button>
                )}
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Service Type */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Service Type</label>
                        <select
                            value={formData.serviceType}
                            onChange={(e) => handleRecordChange("serviceType", e.target.value)}
                            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white"
                            required
                        >
                            {ALLOWED_SERVICE_TYPES.map((type) => (
                                <option key={type} value={type}>
                                    {type.replace("_", " ").toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Vehicle Type */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle Type</label>
                        <input
                            type="text"
                            required
                            value={formData.vehicleType}
                            onChange={(e) => handleRecordChange("vehicleType", e.target.value)}
                            placeholder="e.g., Luxury Van, SUV"
                            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
                        />
                    </div>

                    {/* Starting Price */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Starting Price</label>
                        <input
                            type="text"
                            required
                            value={formData.startingPrice}
                            onChange={(e) => handleRecordChange("startingPrice", e.target.value)}
                            placeholder="e.g., $45 or From $50"
                            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
                        />
                    </div>

                    {/* Vehicle Capacity */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Vehicle Capacity</label>
                        <input
                            type="text"
                            required
                            value={formData.vehicleCapacity}
                            onChange={(e) => handleRecordChange("vehicleCapacity", e.target.value)}
                            placeholder="e.g., 1-3 Passengers"
                            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
                        />
                    </div>

                    {/* Luggages */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Luggages</label>
                        <input
                            type="text"
                            required
                            value={formData.luggages}
                            onChange={(e) => handleRecordChange("luggages", e.target.value)}
                            placeholder="e.g., 2 Large Bags"
                            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
                        />
                    </div>

                    {/* Driver Option */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Driver Option</label>
                        <input
                            type="text"
                            required
                            value={formData.driverOption}
                            onChange={(e) => handleRecordChange("driverOption", e.target.value)}
                            placeholder="e.g., English Speaking Driver Included"
                            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
                        />
                    </div>
                </div>

                {/* Multilingual Notes List Section */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-indigo-500" />
                            Notes Bullets ({locale.toUpperCase()})
                        </label>
                    </div>

                    <div className="space-y-2 bg-slate-50/60 p-4 rounded-xl border border-slate-200/60">
                        {(formData.notes?.[locale] || [""]).map((noteLine, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={noteLine}
                                    onChange={(e) => handleNoteChange(index, e.target.value)}
                                    placeholder={`Enter ${locale.toUpperCase()} note line #${index + 1}`}
                                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeNoteLine(index)}
                                    className="px-3 text-rose-500 hover:bg-rose-50 rounded-lg border border-slate-200 bg-white"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addNoteLine}
                            className="mt-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 py-1"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add another {locale.toUpperCase()} note line
                        </button>
                    </div>
                </div>

                {/* Submit Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    {editingId && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all"
                    >
                        <Save className="w-3.5 h-3.5" />
                        {submitting ? "Saving..." : editingId ? "Update Service Note" : "Create Service Note"}
                    </button>
                </div>
            </form>
        </div>
    );
}