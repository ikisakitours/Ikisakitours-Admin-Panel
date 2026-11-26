"use client";

import Image from "next/image";
import { ShieldCheck, LogOut, Loader2 } from "lucide-react";
import { AdminUser } from "@/services/auth.service";

interface SidebarUserProfileProps {
  isExpanded: boolean;
  adminUser: AdminUser | null;
  userLoading: boolean;
  onOpenSecurityModal: () => void;
  onLogout: () => void;
}

export default function SidebarUserProfile({
  isExpanded,
  adminUser,
  userLoading,
  onOpenSecurityModal,
  onLogout,
}: SidebarUserProfileProps) {
  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "PACKAGE_MANAGER":
        return "Package Manager";
      case "OPERATIONS_MANAGER":
        return "Ops Manager";
      default:
        return "Staff";
    }
  };

  return (
    <div
      className={`relative shrink-0 border-t border-white/5 transition-all duration-200 ${
        isExpanded ? "p-3" : "py-2 px-1"
      }`}
    >
      {isExpanded ? (
        /* Expanded Mode: Integrated Luxury Account Card (Clean, borderless, no flashing box) */
        <div className="flex items-center justify-between px-2 py-1.5 transition-colors group animate-in fade-in duration-150">
          {/* Profile details & click-to-open security */}
          <button
            type="button"
            onClick={onOpenSecurityModal}
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
                {getRoleDisplayName(adminUser?.role)}
              </p>
            </div>
          </button>

          {/* Action Controls */}
          <div className="flex items-center gap-1 shrink-0 pl-1.5">
            <button
              type="button"
              onClick={onOpenSecurityModal}
              aria-label="Security & 2FA Settings"
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
            >
              <ShieldCheck className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onLogout}
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
            onClick={onOpenSecurityModal}
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
            onClick={onLogout}
            aria-label="Sign Out"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer group"
          >
            <LogOut className="h-4.5 w-4.5 group-hover:scale-105 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
}
