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
          href="/" 
          className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${
            pathname === "/" ? activeStyles : inactiveStyles
          }`}
        >
          Dashboard
        </Link>
        
        
        <Link 
          href="/users" 
          className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${
            pathname === "/users" ? activeStyles : inactiveStyles
          }`}
        >
          Tours
        </Link>
        
        
        <Link 
          href="/settings"
          className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${
            pathname === "/settings" ? activeStyles : inactiveStyles
          }`}
        >
          Client Requests
        </Link>

        
        <Link 
          href="/comments" 
          className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${
            pathname === "/comments" ? activeStyles : inactiveStyles
          }`}
        >
          Comments
        </Link>

        
        <Link 
          href="/audit-logs" 
          className={`flex items-center px-4 py-3 rounded-xl border transition-all duration-200 ${
            pathname === "/audit-logs" ? activeStyles : inactiveStyles
          }`}
        >
          Audit logs
        </Link>
        
      </nav>

      
      <div className="p-4 border-t border-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-center">
        Powered by Next.js
      </div>
    </aside>
  );
}