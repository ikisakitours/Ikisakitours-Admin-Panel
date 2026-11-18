"use client";

import { useEffect, useState } from "react";
import { Monitor, ShieldAlert, Smartphone } from "lucide-react";

type BlockReason = "mobile_device" | "small_viewport" | null;

function detectBlockedDevice(): BlockReason {
  if (typeof window === "undefined") return null;

  const ua = navigator.userAgent || "";
  const navWithUAData = navigator as Navigator & {
    userAgentData?: { mobile?: boolean };
  };

  // 1. Explicit mobile/tablet user-agent or Client Hints check
  const isMobileUA =
    navWithUAData.userAgentData?.mobile === true ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Tablet/i.test(ua);

  // 2. Hardware touch-only pointer check (CANNOT be bypassed by "Desktop Site" mode on phones/tablets!)
  // Real touchscreen laptops still report (any-pointer: fine) = true because of their trackpad/mouse.
  const hasCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const hasAnyFinePointer = window.matchMedia("(any-pointer: fine)").matches;
  const hasNoHover = window.matchMedia("(hover: none)").matches;
  const isTouchOnlyDevice = hasCoarsePointer && !hasAnyFinePointer && hasNoHover;

  // 3. Physical screen dimension check (even when "Desktop Site" spoofs viewport to 980px+,
  // physical phone screen short-edge stays ~360-430px with touch points > 0)
  const minPhysicalEdge = Math.min(window.screen.width, window.screen.height);
  const hasTouchPoints = navigator.maxTouchPoints > 0;
  const isSmallPhysicalTouchScreen = hasTouchPoints && minPhysicalEdge < 768;

  if (isMobileUA || isTouchOnlyDevice || isSmallPhysicalTouchScreen) {
    return "mobile_device";
  }

  // 4. Desktop viewport minimum width (blocks 980px spoofed viewports & narrow windows)
  if (window.innerWidth < 1024) {
    return "small_viewport";
  }

  return null;
}

export function DesktopOnlyGuard({ children }: { children: React.ReactNode }) {
  // null = checking on client; string = blocked; "allowed" = verified real desktop
  const [status, setStatus] = useState<"checking" | "allowed" | "mobile_device" | "small_viewport">(
    "checking"
  );

  useEffect(() => {
    const evaluate = () => {
      const reason = detectBlockedDevice();
      setStatus(reason ?? "allowed");
    };

    evaluate();
    window.addEventListener("resize", evaluate);
    window.addEventListener("orientationchange", evaluate);
    return () => {
      window.removeEventListener("resize", evaluate);
      window.removeEventListener("orientationchange", evaluate);
    };
  }, []);

  const isBlocked = status === "mobile_device" || status === "small_viewport";

  return (
    <>
      {/* Blocking Screen:
          - Before client check finishes: CSS `lg:hidden` immediately blocks <1024px viewports (zero flash!)
          - After client check: if blocked (including Mobile "Desktop Site" mode!), shows unconditionally */}
      <div
        className={`fixed inset-0 z-[9999] bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center ${
          isBlocked ? "flex" : status === "allowed" ? "hidden" : "flex lg:hidden"
        }`}
      >
        <div className="w-16 h-16 bg-rose-500/15 text-rose-400 rounded-2xl flex items-center justify-center mb-5 border border-rose-500/30 shadow-lg shadow-rose-500/10">
          {status === "mobile_device" ? (
            <ShieldAlert className="w-8 h-8" />
          ) : (
            <Smartphone className="w-8 h-8 animate-pulse" />
          )}
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-rose-300 mb-3">
          Access Restricted
        </span>

        <h2 className="text-xl font-extrabold mb-2 tracking-tight">
          Desktop Computer Required
        </h2>

        <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
          {status === "mobile_device"
            ? "Mobile phones and tablets are strictly restricted from accessing the Ikisaki Tours Admin Panel — including when Desktop Site mode is enabled. Please sign in from a PC or laptop."
            : "This admin panel contains complex tour management tools, dynamic pricing grids, and itineraries that require a full desktop viewport. Please maximize your browser window on a PC or laptop."}
        </p>

        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300">
          <Monitor className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Required: PC / Laptop (Width ≥ 1024px with Mouse / Trackpad)</span>
        </div>
      </div>

      {/* Actual Admin Panel Content:
          - Completely unmounted when blocked (prevents DOM inspection or API calls from mobile!) */}
      {!isBlocked && (
        <div className={status === "allowed" ? "block min-h-screen" : "hidden lg:block min-h-screen"}>
          {children}
        </div>
      )}
    </>
  );
}
