"use client";

import { useState, useEffect } from "react";
import { Building, Plus, X } from "lucide-react";
import { destinationService } from "@/services/destination.service";
import { DestinationSnapshot } from "../types/package.types";

interface Props {
  selectedDestinations: DestinationSnapshot[];
  onChange: (destinations: DestinationSnapshot[]) => void;
}

export function PackageDestinationPicker({ selectedDestinations, onChange }: Props) {
  const [allPreviews, setAllPreviews] = useState<DestinationSnapshot[]>([]);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Fetch all destination previews on mount
  useEffect(() => {
    destinationService.getPreviews()
      .then((data) => setAllPreviews(data))
      .catch((err) => console.error("Failed to load destination previews", err));
  }, []);

  const filteredDestinations = allPreviews.filter(
    (dest) => 
      dest.title.toLowerCase().includes(query.toLowerCase()) &&
      !selectedDestinations.some((selected) => selected.id === dest.id)
  );

  const addDestination = (dest: DestinationSnapshot) => {
    onChange([...selectedDestinations, dest]);
    setQuery("");
    setIsOpen(false);
  };

  const removeDestination = (id: string) => {
    onChange(selectedDestinations.filter((dest) => dest.id !== id));
  };

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <Building className="w-4 h-4 text-indigo-500" /> Destinations Covered (Snapshots)
      </h3>

      {/* Selected Destinations Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {selectedDestinations.map((dest) => (
          <div key={dest.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3 overflow-hidden">
              {dest.heroImage ? (
                <img src={dest.heroImage} alt="" className="w-10 h-10 object-cover rounded-lg shrink-0" />
              ) : (
                <div className="w-10 h-10 bg-slate-200 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold text-slate-500">
                  {dest.title.charAt(0)}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-bold text-slate-800 truncate">{dest.title}</p>
                <p className="text-[11px] text-slate-500 truncate">{dest.summary}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeDestination(dest.id)}
              className="text-slate-400 hover:text-red-500 p-1 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Search Dropdown Trigger / Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search and attach destinations from database..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
        />

        {isOpen && filteredDestinations.length > 0 && (
          <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
            {filteredDestinations.map((dest) => (
              <div
                key={dest.id}
                onClick={() => addDestination(dest)}
                className="flex items-center justify-between px-3 py-2.5 hover:bg-slate-50 cursor-pointer text-xs border-b border-slate-50 last:border-none"
              >
                <span className="font-semibold text-slate-700">{dest.title}</span>
                <span className="flex items-center gap-1 text-indigo-600 font-medium">
                  <Plus className="w-3 h-3" /> Attach
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}