"use client";

import React, { useState } from "react";
import { Globe } from "lucide-react";
import { ServiceNotePayload } from "@/services/service-notes.service";
import ServiceNoteForm from "./components/ServiceNoteForm";
import { FormReadinessDrawer, FormReadinessItem } from "@/components/FormReadinessDrawer";

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

    const readinessItems: FormReadinessItem[] = [
        {
            id: "sn_vehicle_type",
            label: "Vehicle Model / Type",
            isComplete: Boolean(formData.vehicleType?.trim()),
            elementId: "sn_input_vehicle_type",
            hint: "e.g. KDH Super GL, Prius",
        },
        {
            id: "sn_starting_price",
            label: "Starting Price ($)",
            isComplete: Boolean(formData.startingPrice?.trim()),
            elementId: "sn_input_starting_price",
            hint: "Base charter rate in USD",
        },
        {
            id: "sn_capacity",
            label: "Passenger Capacity",
            isComplete: Boolean(formData.vehicleCapacity?.trim()),
            elementId: "sn_input_capacity",
            hint: "Maximum seats / passengers",
        },
        {
            id: "sn_luggage",
            label: "Luggage Allowance",
            isComplete: Boolean(formData.luggages?.trim()),
            elementId: "sn_input_luggage",
            hint: "Suitcase and baggage capacity",
        },
        {
            id: "sn_driver_price",
            label: "With Driver Rate ($)",
            isComplete: Boolean(formData.withDriverPrice?.trim()),
            elementId: "sn_input_driver_price",
            hint: "Rate with chauffeur included",
        },
        {
            id: "sn_guide_price",
            label: "With Guide Rate ($)",
            isComplete: Boolean(formData.withGuidePrice?.trim()),
            elementId: "sn_input_guide_price",
            hint: "Rate with national guide included",
        },
        {
            id: "sn_notes_en",
            label: "Service Notes (English)",
            isComplete: (formData.notes?.en || []).filter((n) => n?.trim()).length > 0,
            elementId: "sn_input_notes",
            targetLang: "en",
            hint: "Fleet & service inclusions in English",
        },
        {
            id: "sn_notes_ja",
            label: "Service Notes (Japanese)",
            isComplete: (formData.notes?.ja || []).filter((n) => n?.trim()).length > 0,
            elementId: "sn_input_notes",
            targetLang: "ja",
            hint: "Fleet & service inclusions in Japanese",
        },
    ];

    return (
        <div className="space-y-4">
            <FormReadinessDrawer
                items={readinessItems}
                entityTitle="Service Note"
                onNavigateToField={(item) => {
                    if (item.targetLang) {
                        setLocale(item.targetLang);
                    }
                }}
            />
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
            <div id="service_note_form_container">
                <ServiceNoteForm
                    formData={formData}
                    setFormData={setFormData}
                    locale={locale}
                    editingId={editingId}
                    onSubmit={handleFormSubmit}
                    onCancel={onCancel}
                />
            </div>
        </div>
    );
}