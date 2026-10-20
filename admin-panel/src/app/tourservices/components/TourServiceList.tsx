"use client";

import { useState, useEffect } from "react";
import { tourServiceAdmin } from "@/services/tourservice.service";
import TourServiceCard from "./TourServiceCard";

interface TourServiceListProps {
    activeTab: "custom" | "chauffeur" | "transfer";
    refreshKey: number;
}

export default function TourServiceList({ activeTab, refreshKey }: TourServiceListProps) {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData(activeTab);
    }, [activeTab, refreshKey]);

    const fetchData = async (tab: string) => {
        setLoading(true);
        try {
            let data = [];
            if (tab === "custom") data = await tourServiceAdmin.getCustomRequests();
            if (tab === "chauffeur") data = await tourServiceAdmin.getChauffeurRequests();
            if (tab === "transfer") data = await tourServiceAdmin.getTransferRequests();
            setRequests(data);
        } catch (err) {
            console.error(err);
            setRequests([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-12 text-xs text-slate-400">Loading requests...</div>;
    }

    if (requests.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200 text-xs text-slate-400 shadow-sm">
                No requests found for this category.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {requests.map((item) => (
                <TourServiceCard key={item.id} item={item} />
            ))}
        </div>
    );
}