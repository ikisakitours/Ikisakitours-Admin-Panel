"use client";

import React, { useState, useEffect } from "react";
import { Briefcase, Edit2 } from "lucide-react";
import { ServiceNotePayload, serviceNotesService } from "@/services/service-notes.service";
import ServiceNoteFormWrapper from "./ServiceNoteFormWrapper";

interface ServiceNoteItem extends ServiceNotePayload {
    id: string | number;
    createdAt?: string;
    updatedAt?: string;
}

export default function ServiceNotesPage() {
    const [notesList, setNotesList] = useState<ServiceNoteItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [editingId, setEditingId] = useState<string | number | null>(null);
    const [currentFormData, setCurrentFormData] = useState<ServiceNotePayload | null>(null);

    const fetchNotes = async () => {
        try {
            setLoading(true);
            const data = await serviceNotesService.getAllServiceNotes();
            setNotesList(data);
        } catch (error) {
            console.error("Failed to fetch service notes:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotes();
    }, []);

    const handleFormSubmit = async (formData: ServiceNotePayload) => {
        try {
            if (editingId) {
                await serviceNotesService.updateServiceNote(editingId, formData);
                alert("Service note updated successfully!");
            } else {
                await serviceNotesService.createServiceNote(formData);
                alert("Service note created successfully!");
            }
            handleCancelEdit();
            fetchNotes();
        } catch (error: any) {
            alert(error.message || "Something went wrong");
        }
    };

    const handleEdit = (item: ServiceNoteItem) => {
        setEditingId(item.id);
        setCurrentFormData({
            serviceType: item.serviceType,
            vehicleType: item.vehicleType,
            startingPrice: item.startingPrice,
            vehicleCapacity: item.vehicleCapacity,
            luggages: item.luggages,
            driverOption: item.driverOption,
            notes: item.notes || { en: [""], ja: [""] },
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setCurrentFormData(null);
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 space-y-8">
            {/* Page Title & Subtitle */}
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Service Notes Management
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    Configure multi-language vehicle parameters, capacities, pricing rules, and note bullet points.
                </p>
            </div>

            {/* Modular Form Wrapper */}
            <ServiceNoteFormWrapper
                key={editingId ?? "new"}
                initialData={currentFormData}
                editingId={editingId}
                onSubmit={handleFormSubmit}
                onCancel={handleCancelEdit}
            />

            {/* Existing Service Notes List Section */}
            <div className="bg-white shadow-sm rounded-xl p-6 border border-slate-100 space-y-4">
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-500" /> Existing Service Notes ({notesList.length})
                </h2>

                {loading ? (
                    <p className="text-xs text-slate-400 py-6 text-center">Loading service notes...</p>
                ) : notesList.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No service notes found. Create your first one above!</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {notesList.map((item) => (
                            <div key={item.id} className="border border-slate-200/60 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-600 uppercase tracking-wide">
                                            {item.serviceType?.replace("_", " ")}
                                        </span>
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                    </div>

                                    <h3 className="text-sm font-bold text-slate-900 mb-2">{item.vehicleType}</h3>

                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mb-3">
                                        <div><span className="font-semibold text-slate-700">Price:</span> {item.startingPrice}</div>
                                        <div><span className="font-semibold text-slate-700">Capacity:</span> {item.vehicleCapacity}</div>
                                        <div><span className="font-semibold text-slate-700">Luggage:</span> {item.luggages}</div>
                                        <div><span className="font-semibold text-slate-700">Driver:</span> {item.driverOption}</div>
                                    </div>

                                    <div className="border-t border-slate-200/60 pt-2">
                                        <span className="text-[11px] font-bold text-slate-500 block mb-1">Stored Notes (Multilingual Dict):</span>
                                        <pre className="text-[10px] bg-white border border-slate-200/60 p-2 rounded-lg text-slate-600 overflow-x-auto max-h-28">
                                            {JSON.stringify(item.notes, null, 2)}
                                        </pre>
                                    </div>
                                </div>

                                <div className="mt-4 pt-2 border-t border-slate-200/60 text-[10px] text-slate-400 flex justify-between font-medium">
                                    <span>ID: {item.id}</span>
                                    <span>Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "N/A"}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}