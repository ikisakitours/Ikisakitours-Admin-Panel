"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  Briefcase,
  MessageSquareText,
  Mail,
  PlusCircle,
  FileText,
  MapPin,
  RefreshCw,
  HelpCircle,
  FileCode,
  Image as ImageIcon,
  ListOrdered,
  ClipboardList,
  Scale,
  BadgeDollarSign,
  type LucideIcon,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavGroup = { title: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Management",
    items: [
      { href: "/users", label: "Registed Users", icon: Users },
      { href: "/tours", label: "Package Bookings", icon: CalendarCheck },
      { href: "/tourservices", label: "Tour Services", icon: Briefcase },
    ],
  },
  {
    title: "Engagement",
    items: [
      { href: "/comments", label: "Comments & Reviews", icon: MessageSquareText },
      { href: "/contact", label: "Contact", icon: Mail },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/addpackage", label: "Add New Package", icon: PlusCircle },
      { href: "/blogs", label: "Blogs", icon: FileText },
      { href: "/destinations", label: "Destinations", icon: MapPin },
      { href: "/faqs", label: "FAQS", icon: HelpCircle },
    ],
  },
  {
    title: "Content Managements",
    items: [
      { href: "/managepackages", label: "Manage Packages", icon: ListOrdered },
    ],
  },
  {
    title: "Legal & Policies",
    items: [{ href: "/legaldocs", label: "Legal Documents", icon: Scale }],
  },
  {
    title: "System Update",

    items: [
      { href: "/charterpricing", label: "Pricing Notes", icon: BadgeDollarSign },
      { href: "/newupdates", label: "Update Availability", icon: RefreshCw },
      { href: "/servicenotes", label: "Service Notes", icon: ClipboardList },
      { href: "/imageupload", label: "Image Uploads", icon: ImageIcon },
      { href: "/adminlogs", label: "Audit Logs", icon: FileCode },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  const activeStyles = "bg-emerald-500/10 text-emerald-300 font-medium border-emerald-500/20";
  const inactiveStyles = "text-slate-400 hover:text-slate-100 hover:bg-white/5 hover:border-white/5 border-transparent";

  // Root ("/") Dashboard auto select
  const isRouteActive = (href: string) => {
    if (href === "/dashboard" && (pathname === "/" || pathname === "")) return true;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside
      className="sticky top-0 z-50 h-screen w-20 shrink-0 select-none"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onFocus={(e) => {
        if (e.target.matches(":focus-visible")) setIsExpanded(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setIsExpanded(false);
      }}
    >
      <div
        className={`absolute inset-y-0 left-0 flex flex-col overflow-hidden border-r border-white/10 bg-slate-950/85 text-slate-300 backdrop-blur-md transition-[width,box-shadow] duration-300 ease-out motion-reduce:transition-none ${isExpanded ? "w-64 shadow-2xl shadow-black/60" : "w-20"
          }`}
      >
        {/* Header Brand */}
        <div className="group flex h-16 shrink-0 items-center gap-3.5 border-b border-white/5 pl-5.75 pr-4">
          {/* Logo Icon */}
          <span className="relative shrink-0">
            {/* Hover glow */}
            <span className="absolute inset-0 rounded-xl bg-emerald-400/40 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 text-sm font-extrabold leading-none text-slate-950 shadow-lg shadow-emerald-500/20 ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-110">
              IT
            </span>
          </span>

          {/* Text Container */}
          <div
            className={`flex flex-col justify-center transition-opacity duration-300 ${isExpanded ? "opacity-100 delay-100" : "opacity-0"
              }`}
          >
            {/* Main Title */}
            <div className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="bg-linear-to-r from-emerald-400 to-teal-400 bg-clip-text text-[15px] font-bold leading-tight tracking-wide text-transparent">
                IKISAKI
              </span>
              <span className="text-[15px] font-light leading-tight tracking-wide text-teal-400/70">TOURS</span>
            </div>

            {/* Subtitle (Admin Panel) */}
            <div className="mt-1.5 flex items-center gap-2 whitespace-nowrap">
              <span className="h-px w-4 bg-linear-to-r from-teal-500/70 to-transparent" />
              <span className="text-[10px] font-semibold uppercase leading-tight tracking-[0.2em] text-teal-500/80">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Area with Hidden Scrollbars */}
        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {navGroups.map((group, groupIndex) => (
            <div key={group.title} className={groupIndex > 0 ? "mt-3" : ""}>
              {/* Group heading (expanded) / divider line (collapsed) */}
              <div className="relative mb-1 h-5">
                <span
                  className={`absolute inset-y-0 left-3.5 flex items-center whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 transition-opacity duration-200 ${isExpanded ? "opacity-100 delay-100" : "opacity-0"
                    }`}
                >
                  {group.title}
                </span>
                {groupIndex > 0 && (
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3 top-1/2 h-px bg-white/10 transition-opacity duration-200 ${isExpanded ? "opacity-0" : "opacity-100"
                      }`}
                  />
                )}
              </div>

              <div className="space-y-1.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isRouteActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsExpanded(false)}
                      className={`relative flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm transition-all duration-200 ${isActive ? activeStyles : inactiveStyles
                        }`}
                    >
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute -left-4 top-2 bottom-2 w-0.75 rounded-r-full bg-emerald-400"
                        />
                      )}
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                      <span
                        className={`whitespace-nowrap transition-opacity duration-200 ${isExpanded ? "opacity-100 delay-100" : "opacity-0"
                          }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Branding */}
        <div
          className={`relative shrink-0 py-3.5 pr-4 transition-[padding] duration-300 ease-out motion-reduce:transition-none ${isExpanded ? "pl-4" : "pl-6.75"
            }`}
        >
          {/* Gradient top divider */}
          <span className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/30 to-transparent" />

          <div className="group flex cursor-default items-center gap-3">
            {/* Logo mark */}
            <span className="relative shrink-0">
              <span className="absolute inset-0 rounded-lg bg-emerald-400/40 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-400 to-teal-500 text-xs font-extrabold leading-none text-slate-950 shadow-md shadow-emerald-500/20 ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-110">
                AL
              </span>
            </span>

            {/* Text */}
            <div
              className={`flex min-w-0 flex-col justify-center gap-1 whitespace-nowrap transition-opacity duration-200 ${isExpanded ? "opacity-100 delay-100" : "opacity-0"
                }`}
            >
              {/* Line 1: Powered by + brand */}
              <p className="flex items-baseline gap-1.5 leading-none">
                <span className="text-[10px] font-medium text-slate-500">Powered by</span>
                <span className="flex items-baseline gap-1">
                  <span className="text-[12px] font-bold tracking-wide text-slate-300 transition-colors duration-300 group-hover:text-emerald-300">
                    AETHERIA
                  </span>
                  <span className="text-[12px] font-light tracking-wide text-slate-400 transition-colors duration-300 group-hover:text-teal-300/80">
                    LABS
                  </span>
                </span>
              </p>

              {/* Line 2: Engineer credit */}
              <p className="text-[10px] leading-none text-slate-600">
                Engineered by <span className="text-slate-400">Shehan_W</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
