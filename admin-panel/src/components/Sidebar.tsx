"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ClipboardList
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const activeStyles = "bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/20";
  const inactiveStyles = "text-slate-400 hover:text-slate-100 hover:bg-white/5 hover:border-white/5 border-transparent";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/users", label: "Registed Users", icon: Users },
    { href: "/tours", label: "Package Bookings", icon: CalendarCheck },
    { href: "/tourservices", label: "Tour Services", icon: Briefcase },
    { href: "/servicenotes", label: "Service Notes", icon: ClipboardList },
    { href: "/comments", label: "Comments & Reviews", icon: MessageSquareText },
    { href: "/contact", label: "Contact", icon: Mail },
    { href: "/adminlogs", label: "Audit Logs", icon: FileCode },
    { href: "/imageupload", label: "Image Uploads", icon: ImageIcon },
    { href: "/addpackage", label: "Add New Package", icon: PlusCircle },
    { href: "/managepackages", label: "Manage Packages", icon: ListOrdered },
    { href: "/blogs", label: "Blogs", icon: FileText },
    { href: "/destinations", label: "Destinations", icon: MapPin },
    { href: "/newupdates", label: "Update Availability", icon: RefreshCw },
    { href: "/faqs", label: "FAQS", icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-slate-950/85 backdrop-blur-md text-slate-300 flex flex-col border-r border-white/10 sticky top-0 h-screen select-none">

      {/* Header Brand */}
      <div className="h-16 flex items-center justify-center px-6 border-b border-white/5 flex-shrink-0">
        <span className="text-xl font-black tracking-wider bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent truncate">
          TOUR ADMIN
        </span>
      </div>

      {/* Scrollable Navigation Area with Hidden Scrollbars */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border text-sm transition-all duration-200 ${
                isActive ? activeStyles : inactiveStyles
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Branding */}
      <div className="shrink-0 border-t border-white/5 px-4 py-3">
        <div className="group flex cursor-default items-center gap-2.5">
          {/* Logo mark */}
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-emerald-400 to-teal-500 text-[11px] font-black leading-none text-slate-950 shadow-sm shadow-emerald-500/30 transition-transform duration-300 group-hover:scale-110">
            A
          </span>

          {/* Text */}
          <div className="min-w-0 leading-[1.2]">
            <p className="truncate text-[10px] font-medium text-slate-500">
              Powered by{" "}
              <span className="font-bold tracking-wide text-slate-300 transition-colors duration-300 group-hover:text-emerald-300">
                Aetheria Labs
              </span>
            </p>
            <p className="truncate text-[10px] text-slate-600">
              with <span className="text-slate-400">Shehan_W</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
