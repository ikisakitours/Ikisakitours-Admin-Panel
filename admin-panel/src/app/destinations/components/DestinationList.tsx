"use client";

import { useEffect, useState } from "react";
import { destinationService, DestinationPreview } from "@/services/destination.service";
import { Trash2 } from "lucide-react";

interface DestinationListProps {
  refreshKey?: number; // Used to re-fetch when a new destination is published
}

export default function DestinationList({ refreshKey }: DestinationListProps) {
  const [destinations, setDestinations] = useState<DestinationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>("en");

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const data = await destinationService.getPreviews(selectedLang);
      setDestinations(data);
    } catch (err: any) {
      alert(`Failed to load destinations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, [refreshKey, selectedLang]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      setDeletingId(id);
      await destinationService.deleteDestination(id);
      setDestinations((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(`Failed to delete destination: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
      {/* List Header with Sticky/Integrated Language Switcher */}
      <div className="pb-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">All Travel Destinations</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage live destination guides or remove outdated spots.
          </p>
        </div>

        {/* Integrated Language Selector Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold border border-slate-200">
          {(["en", "ja", "fr"] as const).map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => setSelectedLang(lang)}
              className={`px-3 py-1 rounded-md uppercase transition-all ${
                selectedLang === lang
                  ? "bg-white text-slate-900 shadow-sm font-bold"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading travel destinations ({selectedLang.toUpperCase()})...
        </div>
      ) : destinations.length === 0 ? (
        /* Empty State */
        <div className="py-12 text-center text-xs text-slate-500">
          No travel destinations found for <span className="uppercase font-semibold">{selectedLang}</span>. Create one using the form above.
        </div>
      ) : (
        /* Destinations Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinations.map((dest) => (
            <div
              key={dest.id}
              className="flex flex-col justify-between border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50 hover:shadow-sm transition-shadow"
            >
              {/* Hero Image Preview */}
              {dest.heroImage ? (
                <img
                  src={dest.heroImage}
                  alt={dest.title}
                  className="w-full h-36 object-cover"
                />
              ) : (
                <div className="w-full h-36 bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                  No Hero Image
                </div>
              )}

              {/* Metadata & Content */}
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {dest.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {dest.summary}
                  </p>
                </div>

                {/* Footer / Delete Button */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-end mt-3 text-xs">
                  <button
                    type="button"
                    disabled={deletingId === dest.id}
                    onClick={() => handleDelete(dest.id, dest.title)}
                    className="flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    {deletingId === dest.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}