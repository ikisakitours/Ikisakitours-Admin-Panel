"use client";

interface TourServiceNavbarProps {
    activeTab: string;
    setActiveTab: (tab: "custom" | "chauffeur" | "transfer") => void;
}

export default function TourServiceNavbar({ activeTab, setActiveTab }: TourServiceNavbarProps) {
    const tabs = [
        { id: "custom", label: "Custom Made Tours" },
        { id: "chauffeur", label: "Private Chauffeur" },
        { id: "transfer", label: "Transfers" },
    ];

    return (
        <div className="flex gap-2 border-b border-slate-200 pb-3">
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
    );
}