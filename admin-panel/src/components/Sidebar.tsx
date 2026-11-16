"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Compass,
  MessageSquareText,
  Mail,
  Package,
  PackagePlus,
  BookOpen,
  MapPin,
  HelpCircle,
  Scale,
  BadgeDollarSign,
  CalendarOff,
  ClipboardList,
  Images,
  ScrollText,
  type LucideIcon,
  FileText,
  FilePlus2,
  MessageSquarePlus,
  MapPinPlus,
} from "lucide-react";

type NavItem = { href: string; label: string; icon: LucideIcon };
type NavGroup = { title: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    title: "Overview",
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    title: "Bookings & Operations",
    items: [
      { href: "/tours", label: "Tour Bookings", icon: CalendarDays },
      { href: "/tourservices", label: "Tour Services", icon: Compass },
    ],
  },
  {
    title: "User Management",
    items: [
      { href: "/users", label: "Registered Users", icon: Users },
    ],
  },
  {
    title: "Tour Packages",
    items: [
      { href: "/managepackages", label: "Manage Packages", icon: Package },
      { href: "/addpackage", label: "Add Tour Package", icon: PackagePlus },
    ],
  },
  {
    title: "Destinations",
    items: [
      { href: "/managedestinations", label: "Manage Destinations", icon: MapPin },
      { href: "/destinations", label: "Add Destination", icon: MapPinPlus },
    ],
  },
  {
    title: "Blog Articles",
    items: [
      { href: "/manageblogs", label: "Manage Blogs", icon: BookOpen },
      { href: "/blogs", label: "Add Blog Article", icon: FilePlus2 },
    ],
  },
  {
    title: "FAQs & Help",
    items: [
      { href: "/managefaqs", label: "Manage FAQs", icon: HelpCircle },
      { href: "/faqs", label: "Add FAQ", icon: MessageSquarePlus },
    ],
  },
  {
    title: "Availability & Rates",
    items: [
      { href: "/newupdates", label: "Date Availability", icon: CalendarOff },
      { href: "/servicepricing", label: "Service Pricing", icon: BadgeDollarSign },
      { href: "/servicenotes", label: "Service Guidelines", icon: ClipboardList },
    ],
  },
  {
    title: "Media & Engagement",
    items: [
      { href: "/imageupload", label: "Media Gallery", icon: Images },
      { href: "/comments", label: "Reviews & Feedback", icon: MessageSquareText },
      { href: "/contact", label: "Contact Inquiries", icon: Mail },
    ],
  },
  {
    title: "Compliance & System",
    items: [
      { href: "/legaldocs", label: "Legal Documents", icon: Scale },
      { href: "/adminlogs", label: "Audit Logs", icon: ScrollText },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

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
    <aside
      className="sticky top-0 z-50 h-screen w-22 shrink-0 select-none"
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
        className={`absolute inset-y-0 left-0 flex flex-col overflow-hidden border-r border-white/10 bg-slate-950/90 text-slate-300 backdrop-blur-md transition-[width,box-shadow] duration-300 ease-out motion-reduce:transition-none ${isExpanded ? "w-72 shadow-2xl shadow-black/70" : "w-22"
          }`}
      >
        {/* Header Brand */}
        <div
          className={`group flex h-16 shrink-0 items-center border-b border-white/5 transition-all duration-300 ${isExpanded ? "justify-start px-5 gap-3.5" : "justify-center px-0"
            }`}
        >
          {/* Logo Icon (Centered in collapsed mode) */}
          <span className="relative shrink-0 flex items-center justify-center">
            {/* Hover glow */}
            <span className="absolute inset-0 rounded-xl bg-emerald-400/40 opacity-0 blur-lg transition-opacity duration-500 group-hover:opacity-100" />
            <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-emerald-400 to-teal-500 text-sm font-extrabold leading-none text-slate-950 shadow-lg shadow-emerald-500/20 ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-105">
              IT
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
        </div>

        {/* Scrollable Navigation Area with Hidden Scrollbars */}
        <nav
          aria-label="Main navigation"
          className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {navGroups.map((group, groupIndex) => (
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
                      href={item.href}
                      title={!isExpanded ? item.label : undefined}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setIsExpanded(false)}
                      className={`relative flex items-center rounded-xl border text-sm transition-all duration-200 ${isExpanded
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
                        className={`h-4.5 w-4.5 shrink-0 transition-colors ${isActive ? "text-emerald-300" : "text-slate-400"
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

        {/* Footer Branding */}
        <div className="relative shrink-0 py-3.5 border-t border-white/5 transition-all duration-300">
          <div
            className={`group flex cursor-default items-center transition-all duration-300 ${isExpanded ? "justify-start px-5 gap-3" : "justify-center px-0"
              }`}
          >
            {/* Logo mark (Centered in collapsed mode) */}
            <span className="relative shrink-0 flex items-center justify-center">
              <span className="absolute inset-0 rounded-lg bg-emerald-400/40 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-400 to-teal-500 text-xs font-extrabold leading-none text-slate-950 shadow-md shadow-emerald-500/20 ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-105">
                AL
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
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
