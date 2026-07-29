"use client";

import { useState } from "react";

interface NavbarProps {
  category: string;
  onCategoryChange: (val: string) => void;
  filter: string;
  onFilterChange: (val: string) => void;
}

export default function Navbar({
  category,
  onCategoryChange,
  filter,
  onFilterChange,
}: NavbarProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const handleFilterSelect = (value: string) => {
    onFilterChange(value); // Notify parent page
    setIsFilterOpen(false);
  };

  const handleCategorySelect = (value: string) => {
    onCategoryChange(value); // Notify parent page
    setIsCategoryOpen(false);
  };

  return (
    <div className="-mx-8 -mt-8 mb-8 flex h-16 items-center justify-between border-b border-slate-200 bg-slate-50 px-8">
      
      {/* Left side: Dropdowns */}
      <div className="flex items-center gap-3">
        
        {/* Category Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsCategoryOpen(!isCategoryOpen);
              if (isFilterOpen) setIsFilterOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <span>
              Type: <strong className="font-semibold text-blue-600">{category}</strong>
            </span>

            <svg
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                isCategoryOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isCategoryOpen && (
            <div className="absolute left-0 z-10 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5">
              <button
                onClick={() => handleCategorySelect("All Types")}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100 font-medium"
              >
                All Types
              </button>
              <button
                onClick={() => handleCategorySelect("Website Feedback")}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100"
              >
                🌐 About Website
              </button>
              <button
                onClick={() => handleCategorySelect("Specific Post")}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                📌 Specific Post
              </button>
            </div>
          )}
        </div>

        {/* Sort/Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setIsFilterOpen(!isFilterOpen);
              if (isCategoryOpen) setIsCategoryOpen(false);
            }}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <span>
              Sort: <strong className="font-semibold text-emerald-600">{filter}</strong>
            </span>

            <svg
              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                isFilterOpen ? "rotate-180" : ""
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isFilterOpen && (
            <div className="absolute left-0 z-10 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5">
              <button
                onClick={() => handleFilterSelect("By Date")}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100"
              >
                By Date
              </button>
              <button
                onClick={() => handleFilterSelect("By Not Responded")}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                By Not Responded
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Right side: Today Badge */}
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold tracking-wide text-slate-600 shadow-sm uppercase">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Today: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </div>

    </div>
  );
}