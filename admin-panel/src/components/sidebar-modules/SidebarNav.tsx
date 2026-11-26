"use client";

import Link from "next/link";
import { type NavGroup } from "./sidebarData";

interface SidebarNavProps {
  isExpanded: boolean;
  visibleNavGroups: NavGroup[];
  pathname: string;
  navRef: React.RefObject<HTMLElement | null>;
  activeItemRef: React.RefObject<HTMLAnchorElement | null>;
  onItemClick: () => void;
}

export default function SidebarNav({
  isExpanded,
  visibleNavGroups,
  pathname,
  navRef,
  activeItemRef,
  onItemClick,
}: SidebarNavProps) {
  const activeStyles =
    "bg-emerald-500/15 text-emerald-300 font-semibold border-emerald-500/30 shadow-xs shadow-emerald-500/10";
  const inactiveStyles =
    "text-slate-400 hover:text-slate-100 hover:bg-white/5 hover:border-white/10 border-transparent";

  // Root ("/") Dashboard auto select
  const isRouteActive = (href: string) => {
    if (href === "/dashboard" && (pathname === "/" || pathname === "")) return true;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav
      ref={navRef}
      aria-label="Main navigation"
      className="flex-1 overflow-y-auto overflow-x-hidden px-3 pt-3 pb-6 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
    >
      {visibleNavGroups.map((group, groupIndex) => (
        <div key={group.title} className={groupIndex > 0 ? "mt-3" : ""}>
          {/* Group heading (expanded) / divider line (collapsed) */}
          <div className="relative mb-1.5 h-4 flex items-center">
            {isExpanded ? (
              <span className="px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 truncate animate-in fade-in">
                {group.title}
              </span>
            ) : (
              groupIndex > 0 && (
                <span
                  aria-hidden="true"
                  className="w-8 mx-auto h-px bg-white/10"
                />
              )
            )}
          </div>

          <div className="space-y-1.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = isRouteActive(item.href);

              return (
                <Link
                  key={item.href}
                  ref={isActive ? activeItemRef : undefined}
                  href={item.href}
                  title={!isExpanded ? item.label : undefined}
                  aria-current={isActive ? "page" : undefined}
                  onClick={onItemClick}
                  className={`relative flex items-center rounded-xl border text-sm transition-all duration-200 scroll-my-8 ${
                    isExpanded
                      ? "w-full px-3.5 py-2.5 justify-start gap-3"
                      : "w-11 h-11 mx-auto justify-center px-0"
                  } ${isActive ? activeStyles : inactiveStyles}`}
                >
                  {/* Active indicator bar on screen edge */}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute -left-3 top-2.5 bottom-2.5 w-1 rounded-r-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                    />
                  )}

                  {/* Icon */}
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 transition-colors ${
                      isActive ? "text-emerald-300" : "text-slate-400"
                    }`}
                  />

                  {/* Label (Expanded only) */}
                  {isExpanded && (
                    <span className="truncate whitespace-nowrap font-medium text-xs tracking-wide animate-in fade-in duration-150">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
