"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
export default function Sidebar() {
  const pathname = usePathname();
  const activeStyles = "bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/20";
  const inactiveStyles = "text-slate-400 hover:text-slate-100 hover:bg-white/5 hover:border-white/5 border-transparent";

  return (
    <aside className="w-64 bg-slate-950/80 backdrop-blur-md text-slate-300 flex flex-col border-r border-white/10 sticky top-0 h-screen">

      <div className="h-16 flex items-center justify-center px-6 border-b border-white/5">
        <span className="text-xl font-black tracking-wider bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          TOUR ADMIN
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">

        <Link
          href="/dashboard"
          className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${pathname === "/dashboard" ? activeStyles : inactiveStyles
            }`}
        >
          Dashboard
        </Link>

        <Link
          href="/users"
          className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${pathname === "/users" ? activeStyles : inactiveStyles
            }`}
        >
          Registed Users
        </Link>

        <Link
          href="/tours"
          className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${pathname === "/tours" ? activeStyles : inactiveStyles
            }`}
        >
          Tours
        </Link>

        <Link
          href="/clientrequests"
          className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${pathname === "/clientrequests" ? activeStyles : inactiveStyles
            }`}
        >
          Services
        </Link>

        <Link
          href="/comments"
          className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${pathname === "/comments" ? activeStyles : inactiveStyles
            }`}
        >
          Comments
        </Link>

        <Link
          href="/contact"
          className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${pathname === "/contact" ? activeStyles : inactiveStyles
            }`}
        >
          Contact
        </Link>

        <Link
          href="/adminlogs"
          className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${pathname === "/adminlogs" ? activeStyles : inactiveStyles
            }`}
        >
          Audit logs
        </Link>

        <Link
          href="/imageupload"
          className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${pathname === "/imageupload" ? activeStyles : inactiveStyles
            }`}
        >
          Image Uploads
        </Link>

        <Link
          href="/addpackage"
          className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${pathname === "/addpackage" ? activeStyles : inactiveStyles
            }`}
        >
          Add New Package
        </Link>

        <Link
          href="/newupdates"
          className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${pathname === "/newupdates" ? activeStyles : inactiveStyles
            }`}
        >
          New Updates
        </Link>

      </nav>

      <div className="p-4 border-t border-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-center">
        Powered by Shehan_W
      </div>
    </aside>
  );
}