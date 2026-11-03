"use client";

import React, { useState } from "react";
import { Globe } from "lucide-react";
import { ServiceNotePayload } from "@/services/service-notes.service";
import ServiceNoteForm from "./components/ServiceNoteForm";

const AVAILABLE_LOCALES = [
    { code: "en", label: "English" },
    { code: "ja", label: "Japanese" },
];

interface Props {
    initialData?: ServiceNotePayload | null;
    editingId?: string | number | null;
    onSubmit: (formData: ServiceNotePayload) => Promise<void>;
    onCancel?: () => void;
}

export default function ServiceNoteFormWrapper({
    initialData,
    editingId,
    onSubmit,
    onCancel,
}: Props) {
    const [locale, setLocale] = useState<string>("en");
    const [formData, setFormData] = useState<ServiceNotePayload>(
        initialData || {
            serviceType: "custom",
            vehicleType: "",
            startingPrice: "",
            vehicleCapacity: "",
            luggages: "",
            withDriverPrice: "",
            withGuidePrice: "",
            withDriverAndGuidePrice: "",
            notes: {
                en: [""],
                ja: [""],
            },
        }
    );

    // Sync state if editingId or initialData changes
    React.useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="space-y-6">
            {/* Language Switcher Bar */}
            <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <Globe className="w-4 h-4 text-indigo-500" />
                    <span>Active Editing Language:</span>
                </div>
                <div className="flex gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-100">
                    {AVAILABLE_LOCALES.map((l) => (
                        <button
                            key={l.code}
                            type="button"
                            onClick={() => setLocale(l.code)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                                locale === l.code
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            {l.label} ({l.code.toUpperCase()})
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Form Component */}
            <ServiceNoteForm
                formData={formData}
                setFormData={setFormData}
                locale={locale}
                editingId={editingId}
                onSubmit={handleFormSubmit}
                onCancel={onCancel}
            />
        </div>
    );
}