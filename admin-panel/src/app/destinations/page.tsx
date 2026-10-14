"use client";

import { useState } from "react";
import DestinationForm from "./components/DestinationForm";
import DestinationList from "./components/DestinationList";

export default function DestinationsAdminPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4 space-y-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900">Destination Management</h1>
        <p className="text-slate-600 mt-1">Add and manage travel destinations for public readers.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">
        <DestinationForm onSuccess={handleSuccess} />
        <DestinationList refreshKey={refreshKey} />
      </div>
    </main>
  );
}