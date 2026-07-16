"use client";

import { useState } from "react";

export default function Navbar() {
    const [filter, setFilter] = useState("By Date");
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (value: string) => {
        setFilter(value);
        setIsOpen(false);
    };

    return (
        <div className="-mx-8 -mt-8 mb-8 flex h-16 items-center justify-between border-b border-slate-200 bg-slate-50 px-8">


            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                    <span>Show: <strong className="font-semibold text-emerald-600">{filter}</strong></span>

                    <svg className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>


                {isOpen && (
                    <div className="absolute left-0 z-10 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5">
                        <button
                            onClick={() => handleSelect("By Date")}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors border-b border-slate-100"
                        >
                            By Date
                        </button>
                        <button
                            onClick={() => handleSelect("By Not Responded")}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                            By Not Responded
                        </button>
                    </div>
                )}
            </div>

            {/* Right side: Clear Date Window (Light Theme) */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold tracking-wide text-slate-600 shadow-sm uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>

        </div>
    );
}