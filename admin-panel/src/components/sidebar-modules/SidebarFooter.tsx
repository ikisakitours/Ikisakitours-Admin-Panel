"use client";

import { useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface SidebarFooterProps {
  isExpanded: boolean;
}

export default function SidebarFooter({ isExpanded }: SidebarFooterProps) {
  const [bottomLogoLoaded, setBottomLogoLoaded] = useState(false);

  return (
    <div
      className={`relative shrink-0 border-t border-white/5 transition-all duration-300 ${
        isExpanded ? "py-3.5" : "py-2"
      }`}
    >
      <div
        className={`group flex cursor-default items-center transition-all duration-300 ${
          isExpanded ? "justify-start px-5 gap-3" : "justify-center px-0"
        }`}
      >
        {/* Logo mark (Centered in collapsed mode) */}
        <span className="relative shrink-0 flex items-center justify-center">
          <span className="absolute inset-0 rounded-lg bg-emerald-400/40 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 border border-white/10 shadow-md shadow-emerald-500/20 ring-1 ring-white/20 overflow-hidden transition-transform duration-300 group-hover:scale-105 p-0.5">
            {!bottomLogoLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              </div>
            )}
            <Image
              src="/Layout-Icons/two2flod-brand-seal.webp"
              alt="Two2Flod Seal"
              width={36}
              height={36}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                bottomLogoLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setBottomLogoLoaded(true)}
            />
          </span>
        </span>

        {/* Text (Visible only when expanded) */}
        {isExpanded && (
          <div className="flex min-w-0 flex-col justify-center gap-1 whitespace-nowrap animate-in fade-in duration-200">
            {/* Line 1: Powered by + brand */}
            <p className="flex items-baseline gap-1.5 leading-none">
              <span className="text-[10px] font-medium text-slate-500">Powered by</span>
              <span className="flex items-baseline gap-1">
                <span className="text-[12px] font-bold tracking-wide text-slate-300 transition-colors duration-300 group-hover:text-emerald-300">
                  Two2Flod
                </span>
              </span>
            </p>
            {/* Line 2: Engineer credit */}
            <p className="text-[10px] leading-none text-slate-600">
              Engineered by <span className="text-slate-400">Pramod_S & Shehan_W</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
