"use client";

import { useState } from "react";
import DestinationForm from "./components/sections/DestinationForm";
import DestinationList from "./components/DestinationList";

export default function DestinationsAdminPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedLang, setSelectedLang] = useState<string>("en");

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 space-y-8">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Destination Management</h1>
          <p className="text-slate-600 mt-1">Add and manage travel destinations across multiple languages.</p>
        </div>

        {/* Language Filter Tabs */}
        <div className="flex bg-slate-200 p-1 rounded-lg text-xs font-semibold">
          {(["en", "ja", "fr"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLang(lang)}
              className={`px-3 py-1.5 rounded-md uppercase transition-all ${
                selectedLang === lang
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <DestinationForm onSuccess={handleSuccess} />
        {/* Pass selectedLang down to your list component */}
        <DestinationList refreshKey={refreshKey} currentLang={selectedLang} />
      </div>
    </main>
  );
}