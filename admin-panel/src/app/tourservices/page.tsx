"use client";

import { useState } from "react";
import TourServiceNavbar from "./components/TourServiceNavbar";
import TourServiceList from "./components/TourServiceList";

export default function TourServicesPage() {
    const [activeTab, setActiveTab] = useState<"custom" | "chauffeur" | "transfer">("custom");
    const [refreshKey, setRefreshKey] = useState(0);

    const handleTabChange = (tab: "custom" | "chauffeur" | "transfer") => {
        setActiveTab(tab);
        // Optional: trigger a refresh or reset when switching tabs if needed
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <main className="w-full py-8 px-4 sm:px-6 space-y-8">
            {/* Header */}
            <div className="pb-6 border-b border-slate-200">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    Tour Services Management
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                    Manage and review client inquiries across Custom Made Tours, Private Chauffeurs, and Transfers.
                </p>
            </div>

            {/* Tabbed Navbar Component */}
            <TourServiceNavbar activeTab={activeTab} setActiveTab={handleTabChange} />

            {/* Live Requests List Component */}
            <TourServiceList activeTab={activeTab} refreshKey={refreshKey} />
        </main>
    );
}