"use client";

import { useEffect, useState } from "react";
import { destinationService } from "@/services/destination.service";
import { Trash2, Calendar, Sun } from "lucide-react";

interface DestinationPreview {
  id: string;
  title: string;
  slug: string;
  summary: string;
  heroImage: string | null;
  bestTimeToVisit: string;
  climate: string;
}

interface DestinationListProps {
  refreshKey?: number; // Used to re-fetch when a new destination is published
}

export default function DestinationList({ refreshKey }: DestinationListProps) {
  const [destinations, setDestinations] = useState<DestinationPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      const data = await destinationService.getPreviews();
      setDestinations(data);
    } catch (err: any) {
      alert(`Failed to load destinations: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, [refreshKey]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      setDeletingId(id);
      await destinationService.deleteDestination(id);
      // Remove deleted destination from state
      setDestinations((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(`Failed to delete destination: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
        Loading travel destinations...
      </div>
    );
  }

  if (destinations.length === 0) {
    return (
      <div className="p-6 bg-white rounded-xl border border-slate-200 text-center text-xs text-slate-500">
        No travel destinations found. Create your first destination using the form above.
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 space-y-4">
      <div className="pb-4 border-b">
        <h2 className="text-lg font-bold text-slate-900">All Travel Destinations</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage your live destination guides or remove outdated spots.
        </p>
      </div>

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
                <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 gap-2 mb-1">
                  <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                    <Calendar className="w-3 h-3" />
                    {dest.bestTimeToVisit}
                  </span>
                  <span className="flex items-center gap-1">
                    <Sun className="w-3 h-3" />
                    {dest.climate}
                  </span>
                </div>

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
    </div>
  );
}