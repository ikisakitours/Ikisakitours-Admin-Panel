import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-950/80 backdrop-blur-md text-slate-300 flex flex-col border-r border-white/10 sticky top-0 h-screen">
      
      {/* Sidebar Header / Logo area */}
      <div className="h-16 flex items-center justify-center px-6 border-b border-white/5">
        {/* Primary color accent gradient on the text */}
        <span className="text-xl font-black tracking-wider bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
          TOUR ADMIN
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        
        {/* Active Item: Uses the Emerald/Teal primary color with a glowing active state */}
        <Link 
          href="/" 
          className="flex items-center px-4 py-3 rounded-xl bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-600"
        >
          Dashboard
        </Link>
        
        {/* Non-Active Items: Blends smoothly into the background, shifts into a glass-highlight on hover */}
        <Link 
          href="/users" 
          className="flex items-center px-4 py-3 rounded-xl border border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5 hover:border-white/5 transition-all duration-200"
        >
          tours
        </Link>
        
        <Link 
          href="/settings" 
          className="flex items-center px-4 py-3 rounded-xl border border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5 hover:border-white/5 transition-all duration-200"
        >
          Client Requests
        </Link>

        <Link 
          href="/settings" 
          className="flex items-center px-4 py-3 rounded-xl border border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5 hover:border-white/5 transition-all duration-200"
        >
          Comments
        </Link>

        <Link 
          href="/settings" 
          className="flex items-center px-4 py-3 rounded-xl border border-transparent text-slate-400 hover:text-slate-100 hover:bg-white/5 hover:border-white/5 transition-all duration-200"
        >
          Audit logs
        </Link>
        
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-center">
        Powered by NECTURN
      </div>
    </aside>
  );
}