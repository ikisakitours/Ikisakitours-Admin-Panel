"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Loader2 } from "lucide-react";

interface SidebarHeaderProps {
  isExpanded: boolean;
}

export default function SidebarHeader({ isExpanded }: SidebarHeaderProps) {
  const [topLogoLoaded, setTopLogoLoaded] = useState(false);

  return (
    <Link
      href="/dashboard"
      title="Go to Dashboard"
      className={`group flex h-16 shrink-0 items-center border-b border-white/5 transition-all duration-300 cursor-pointer ${
        isExpanded ? "justify-start px-5 gap-3.5" : "justify-center px-0"
      }`}
    >
      {/* Logo Icon (Centered in collapsed mode) */}
      <span className="relative shrink-0 flex items-center justify-center">
        {/* Hover glow */}
        <span className="absolute inset-0 rounded-xl bg-emerald-400/40 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
        <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-white/10 shadow-lg shadow-emerald-500/20 ring-1 ring-white/20 overflow-hidden transition-transform duration-300 group-hover:scale-105 p-1">
          {!topLogoLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            </div>
          )}
          <Image
            src="/Layout-Icons/logo-transparent.webp"
            alt="Ikisaki Tours Logo"
            width={40}
            height={40}
            className={`w-full h-full object-contain transition-opacity duration-300 ${
              topLogoLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setTopLogoLoaded(true)}
            priority
          />
        </span>
      </span>

      {/* Text Container (Visible only when expanded) */}
      {isExpanded && (
        <div className="flex flex-col justify-center min-w-0 transition-opacity duration-200 animate-in fade-in">
          {/* Main Title */}
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-[15px] font-bold leading-tight tracking-wide text-transparent">
              IKISAKI
            </span>
            <span className="text-[15px] font-light leading-tight tracking-wide text-teal-400/70">
              TOURS
            </span>
          </div>

          {/* Subtitle (Admin Panel) */}
          <div className="mt-1 flex items-center gap-2 whitespace-nowrap">
            <span className="h-px w-4 bg-linear-to-r from-teal-500/70 to-transparent" />
            <span className="text-[10px] font-semibold uppercase leading-tight tracking-[0.2em] text-teal-500/80">
              Admin Panel
            </span>
          </div>
        </div>
      )}
    </Link>
  );
}
