"use client";

import { Filter } from "lucide-react";

interface TourServiceNavbarProps {
    activeTab: string;
    setActiveTab: (tab: "custom" | "chauffeur" | "transfer") => void;
    selectedStatus: string;
    setSelectedStatus: (status: string) => void;
}

export default function TourServiceNavbar({ 
    activeTab, 
    setActiveTab, 
    selectedStatus, 
    setSelectedStatus 
}: TourServiceNavbarProps) {
    const tabs = [
        { id: "custom", label: "Custom Made Tours" },
        { id: "chauffeur", label: "Private Chauffeur" },
        { id: "transfer", label: "Transfers" },
    ];

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-3">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                            activeTab === tab.id
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span>Filter:</span>
                </div>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="text-xs font-semibold px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="active">Active</option>
                    <option value="rejected">Rejected</option>
                </select>
            </div>
        </div>
    );
}