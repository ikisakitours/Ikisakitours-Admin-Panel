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
            queueMicrotask(() => {
                setFormData(initialData);
            });
        }
    }, [initialData]);

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="space-y-4">
            {/* Language Switcher Bar */}
            <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>Active Content Language:</span>
                </div>
                <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    {AVAILABLE_LOCALES.map((l) => (
                        <button
                            key={l.code}
                            type="button"
                            onClick={() => setLocale(l.code)}
                            className={`px-3 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                                locale === l.code
                                    ? "bg-emerald-600 text-white shadow-2xs"
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