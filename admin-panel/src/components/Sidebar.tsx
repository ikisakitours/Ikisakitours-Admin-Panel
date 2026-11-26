"use client";
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { authService, AdminUser } from "@/services/auth.service";
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
  BookMarked,
  type LucideIcon,
  FileText,
  FilePlus2,
  MessageSquarePlus,
  MapPinPlus,
  LogOut,
  ShieldCheck,
  Loader2,
  UserCheck,
} from "lucide-react";
import { AdminSecurityModal } from "@/components/AdminSecurityModal";
import { getRoleMeta } from "@/app/staff/data/staffRoles";

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
      { href: "/itinerary-editor", label: "PDF Itinerary Studio", icon: FileText },
    ],
  },
  {
    title: "User Management",
    items: [
      { href: "/users", label: "Registered Users", icon: Users },
      { href: "/staff", label: "Staff & Team (RBAC)", icon: UserCheck },
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
      { href: "/servicepricing", label: "Services Price Note", icon: BadgeDollarSign },
      { href: "/servicenotes", label: "Add Services price ", icon: ClipboardList },
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
  {
    title: "Help & Guide",
    items: [
      { href: "/manual", label: "Admin Manual Guide", icon: BookMarked },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const navRef = useRef<HTMLElement | null>(null);
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);

  // Smoothly bring active item into view with natural breathing room (no over-scrolling or massive empty gaps)
  const scrollToActiveItem = useCallback(() => {
    if (!navRef.current || !activeItemRef.current) return;
    const nav = navRef.current;
    const item = activeItemRef.current;

    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    const currentScrollTop = nav.scrollTop;
    const itemRelativeTop = itemRect.top - navRect.top + currentScrollTop;
    const itemRelativeBottom = itemRelativeTop + item.offsetHeight;

    const visibleTop = currentScrollTop;
    const visibleBottom = currentScrollTop + nav.clientHeight;

    // Only scroll if item is partially outside visible bounds
    if (itemRelativeBottom > visibleBottom - 16) {
      // Modestly scroll down just enough to reveal the item with ~16px breathing room above the bottom card
      const targetScrollTop = itemRelativeBottom - nav.clientHeight + 16;
      nav.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: "smooth",
      });
    } else if (itemRelativeTop < visibleTop + 16) {
      // Modestly scroll up just enough to reveal the item with ~16px breathing room below the top header
      const targetScrollTop = itemRelativeTop - 16;
      nav.scrollTo({
        top: Math.max(0, targetScrollTop),
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("admin_user");
        if (saved) {
          try {
            setAdminUser(JSON.parse(saved));
          } catch {
            // ignore
          }
        }
      }
    });

    authService
      .getMe()
      .then((user) => {
        if (user) {
          setAdminUser(user);
          if (typeof window !== "undefined") {
            localStorage.setItem("admin_user", JSON.stringify(user));
          }
        }
        setUserLoading(false);
      })
      .catch(() => {
        setUserLoading(false);
      });
  }, []);

  // Ensure active navigation item stays in comfortable upper view upon route change or sidebar collapse/expand
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToActiveItem();
    }, 180);
    return () => clearTimeout(timer);
  }, [pathname, isExpanded, scrollToActiveItem]);

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
    router.refresh();
  };

  const activeStyles =
    "bg-emerald-500/15 text-emerald-300 font-semibold border-emerald-500/30 shadow-xs shadow-emerald-500/10";
  const inactiveStyles =
    "text-slate-400 hover:text-slate-100 hover:bg-white/5 hover:border-white/10 border-transparent";

  // Root ("/") Dashboard auto select
  const isRouteActive = (href: string) => {
    if (href === "/dashboard" && (pathname === "/" || pathname === "")) return true;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  // Role-based navigation filtering using centralized role permissions
  const visibleNavGroups = useMemo(() => {
    // Prevent SSR hydration mismatch: on initial SSR pre-render keep static navGroups consistent
    if (!mounted || !adminUser) return navGroups;

    const role = adminUser.role;
    if (role === "SUPER_ADMIN") return navGroups;

    const roleMeta = getRoleMeta(role);
    if (!roleMeta || roleMeta.allowedRoutes.includes("*")) return navGroups;

    return navGroups
      .map((group) => {
        const allowedItems = group.items.filter((item) =>
          roleMeta.allowedRoutes.includes(item.href)
        );
        if (allowedItems.length === 0) return null;
        return {
          ...group,
          items: allowedItems,
        };
      })
      .filter(Boolean) as NavGroup[];
  }, [mounted, adminUser]);

  const handleOpenSecurityModal = () => {
    setIsExpanded(false);
    setIsSecurityModalOpen(true);
  };

  return (
    <aside
      className="sticky top-0 z-50 h-screen w-22 shrink-0 select-none"
      onMouseEnter={() => {
        if (!isSecurityModalOpen) {
          setIsExpanded(true);
          setTimeout(() => {
            scrollToActiveItem();
          }, 160);
        }
      }}
      onMouseLeave={() => {
        if (!isSecurityModalOpen) setIsExpanded(false);
      }}
      onFocus={(e) => {
        if (!isSecurityModalOpen && e.target.matches(":focus-visible")) setIsExpanded(true);
      }}
      onBlur={(e) => {
        if (!isSecurityModalOpen && !e.currentTarget.contains(e.relatedTarget as Node | null)) setIsExpanded(false);
      }}
    >
      <div
        className={`absolute inset-y-0 left-0 flex flex-col overflow-hidden border-r border-white/10 bg-slate-950/90 text-slate-300 backdrop-blur-md transition-[width,box-shadow] duration-300 ease-out motion-reduce:transition-none ${isExpanded ? "w-72 shadow-2xl shadow-black/70" : "w-22"
          }`}
      >
        {/* Header Brand (Clickable link to /dashboard) */}
        <Link
          href="/dashboard"
          title="Go to Dashboard"
          className={`group flex h-16 shrink-0 items-center border-b border-white/5 transition-all duration-300 cursor-pointer ${isExpanded ? "justify-start px-5 gap-3.5" : "justify-center px-0"
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
        </Link>

        {/* Scrollable Navigation Area with Hidden Scrollbars */}
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
                      onClick={() => {
                        setIsExpanded(false);
                        setTimeout(() => {
                          scrollToActiveItem();
                        }, 140);
                      }}
                      className={`relative flex items-center rounded-xl border text-sm transition-all duration-200 scroll-my-8 ${isExpanded
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

        {/* Executive Admin Session & Security Module */}
        <div className={`relative shrink-0 border-t border-white/5 transition-all duration-200 ${isExpanded ? "p-3" : "py-2 px-1"}`}>
          {isExpanded ? (
            /* Expanded Mode: Integrated Luxury Account Card (Clean, borderless, no flashing box) */
            <div className="flex items-center justify-between px-2 py-1.5 transition-colors group animate-in fade-in duration-150">
              {/* Profile details & click-to-open security */}
              <button
                type="button"
                onClick={handleOpenSecurityModal}
                className="flex items-center gap-2.5 min-w-0 flex-1 text-left cursor-pointer group/prof"
                aria-label="Admin Profile & Security Settings"
              >
                <div className="relative shrink-0 flex items-center justify-center w-8 h-8 rounded-xl overflow-hidden bg-slate-900 border border-white/10 text-slate-950 font-black text-xs shadow-xs">
                  {userLoading ? (
                    <div className="flex items-center justify-center w-full h-full bg-slate-900">
                      <Loader2 className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                    </div>
                  ) : adminUser?.avatarUrl ? (
                    <Image
                      src={adminUser.avatarUrl}
                      alt={adminUser.fullName || "Admin Avatar"}
                      width={32}
                      height={32}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-black text-slate-950">
                      IT
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-200 truncate leading-tight group-hover/prof:text-emerald-300 transition-colors">
                    {adminUser?.fullName || "Ikisaki Admin"}
                  </p>
                  <p className="text-[10px] font-mono text-slate-400 truncate leading-tight">
                    {adminUser?.role === "SUPER_ADMIN"
                      ? "Super Admin"
                      : adminUser?.role === "PACKAGE_MANAGER"
                        ? "Package Manager"
                        : adminUser?.role === "OPERATIONS_MANAGER"
                          ? "Ops Manager"
                          : "Staff"}
                  </p>
                </div>
              </button>

              {/* Action Controls */}
              <div className="flex items-center gap-1 shrink-0 pl-1.5">
                <button
                  type="button"
                  onClick={handleOpenSecurityModal}
                  aria-label="Security & 2FA Settings"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                >
                  <ShieldCheck className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Sign Out"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Collapsed Mode: Minimalist Luxury Icons (Clean, borderless, no flashing box) */
            <div className="flex flex-col items-center gap-2 py-0.5 animate-in fade-in duration-150">
              <button
                type="button"
                onClick={handleOpenSecurityModal}
                aria-label="Account Security & 2FA"
                className="relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-emerald-300 transition-colors cursor-pointer group overflow-hidden"
              >
                {userLoading ? (
                  <div className="flex items-center justify-center w-full h-full bg-slate-900/60 rounded-xl">
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  </div>
                ) : adminUser?.avatarUrl ? (
                  <Image
                    src={adminUser.avatarUrl}
                    alt={adminUser.fullName || "Admin Avatar"}
                    width={40}
                    height={40}
                    unoptimized
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <ShieldCheck className="h-4.5 w-4.5 group-hover:scale-105 transition-transform" />
                )}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                aria-label="Sign Out"
                className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer group"
              >
                <LogOut className="h-4.5 w-4.5 group-hover:scale-105 transition-transform" />
              </button>
            </div>
          )}
        </div>

        {/* Footer Branding */}
        <div className={`relative shrink-0 border-t border-white/5 transition-all duration-300 ${isExpanded ? "py-3.5" : "py-2"}`}>
          <div
            className={`group flex cursor-default items-center transition-all duration-300 ${isExpanded ? "justify-start px-5 gap-3" : "justify-center px-0"
              }`}
          >
            {/* Logo mark (Centered in collapsed mode) */}
            <span className="relative shrink-0 flex items-center justify-center">
              <span className="absolute inset-0 rounded-lg bg-emerald-400/40 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-emerald-400 to-teal-500 text-xs font-extrabold leading-none text-slate-950 shadow-md shadow-emerald-500/20 ring-1 ring-white/25 transition-transform duration-300 group-hover:scale-105">
                T2F
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
                    {/* <span className="text-[12px] font-light tracking-wide text-slate-400 transition-colors duration-300 group-hover:text-teal-300/80">
                      LABS
                    </span> */}
                  </span>
                </p>

                {/* Line 2: Engineer credit */}
                <p className="text-[10px] leading-none text-slate-600">
                  Engineered by <span className="text-slate-400">Shehan_W & Pramos_S</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Security & 2FA Modal */}
      <AdminSecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        onProfileUpdated={(user) => setAdminUser(user)}
      />
    </aside>
  );
}
