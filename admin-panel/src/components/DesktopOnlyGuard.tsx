"use client";

import { Monitor, Smartphone } from "lucide-react";

export function DesktopOnlyGuard({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Mobile/Tablet Blocking Screen */}
      <div className="fixed inset-0 z-50 bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center md:hidden">
        <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mb-4 border border-indigo-500/30">
          <Smartphone className="w-8 h-8 animate-pulse" />
        </div>
        
        <h2 className="text-xl font-bold mb-2">Desktop Screen Required</h2>
        <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
          This admin panel contains complex tour management tools, itineraries, and data grids that are not supported on mobile devices. Please open this app on a PC or laptop.
        </p>

        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-slate-300">
          <Monitor className="w-4 h-4 text-indigo-400" />
          <span>Recommended width: 1024px or higher</span>
        </div>
      </div>

      {/* Actual Admin Panel Content (Hidden on mobile via CSS, visible on md+) */}
      <div className="hidden md:block min-h-screen">
        {children}
      </div>
    </>
  );
}