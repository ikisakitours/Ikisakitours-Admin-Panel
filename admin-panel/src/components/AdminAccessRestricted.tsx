"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowLeft, LogOut, ShieldCheck, Lock } from "lucide-react";
import { authService, type AdminUser } from "@/services/auth.service";
import { STAFF_ROLES, getRoleMeta, type RoleDefinition } from "@/app/staff/data/staffRoles";

interface AdminAccessRestrictedProps {
  pathname: string;
  user: AdminUser | null;
}

/**
 * Finds all roles that have permission to access the given path
 */
export function getPermittedRolesForRoute(pathname: string): RoleDefinition[] {
  return STAFF_ROLES.filter((role) => {
    if (role.allowedRoutes.includes("*")) return true;
    return role.allowedRoutes.some((route) => {
      if (route === pathname) return true;
      if (route !== "/" && pathname.startsWith(`${route}/`)) return true;
      return false;
    });
  });
}

/**
 * Converts path like "/staff" or "/managepackages" to a friendly module name
 */
function getModuleLabel(pathname: string): string {
  const clean = pathname.replace(/^\//, "").split("/")[0];
  switch (clean) {
    case "staff":
      return "Staff & Access Control (RBAC)";
    case "users":
      return "Registered Customers";
    case "managepackages":
    case "addpackage":
      return "Tour Packages";
    case "tours":
    case "tourservices":
    case "clientrequests":
      return "Bookings & Tour Operations";
    case "managedestinations":
    case "destinations":
      return "Destinations Catalog";
    case "manageblogs":
    case "blogs":
      return "Blog Stories & Articles";
    case "managefaqs":
    case "faqs":
      return "Frequently Asked Questions (FAQs)";
    case "comments":
      return "Reviews & Testimonials";
    case "contact":
      return "Contact Inquiries";
    case "servicepricing":
    case "servicenotes":
    case "newupdates":
      return "Availability & Pricing Rates";
    case "legaldocs":
    case "adminlogs":
      return "Legal Documentation & Audit Logs";
    default:
      return clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : "Administrative Module";
  }
}

export function AdminAccessRestricted({ pathname, user }: AdminAccessRestrictedProps) {
  const router = useRouter();
  const roleMeta = getRoleMeta(user?.role);
  const UserRoleIcon = roleMeta.icon;
  const moduleLabel = getModuleLabel(pathname);
  const permittedRoles = getPermittedRolesForRoute(pathname);

  const handleSignOut = async () => {
    await authService.logout();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 max-w-xl w-full text-center space-y-6 shadow-xl relative">
        {/* Top Centered Security Icon - Matching Ikisaki Theme */}
        <div className="text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 shadow-2xs">
            <ShieldAlert className="w-7 h-7 text-emerald-700" />
          </div>

          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Permission Denied</span>
            </span>

            <h2 className="text-xl font-black text-slate-900 tracking-tight pt-1">
              Restricted Module Access
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto pt-0.5">
              You do not have administrative clearance to access the{" "}
              <span className="font-bold text-slate-800">{moduleLabel}</span> module (
              <code className="px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px]">
                {pathname}
              </code>
              ).
            </p>
          </div>
        </div>

        {/* Current Active Role & User Container - Matching Ikisaki Theme */}
        <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4 text-left space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Your Active Role
            </span>
            <span className="text-[10px] font-bold text-slate-500">{roleMeta.category}</span>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border shadow-2xs"
              style={{
                backgroundColor: `${roleMeta.colorHex}15`,
                borderColor: `${roleMeta.colorHex}35`,
                color: roleMeta.colorHex,
              }}
            >
              <UserRoleIcon className="w-4.5 h-4.5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-slate-900 leading-tight">
                {roleMeta.title}
              </p>
              <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                {user?.email || "Authenticated Staff"}
              </p>
            </div>

            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border ${roleMeta.badgeClass}`}>
              Active
            </span>
          </div>
        </div>

        {/* Permitted Roles Preview */}
        {permittedRoles.length > 0 && (
          <div className="text-left space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Authorized Roles for this Module ({permittedRoles.length}):
            </p>
            <div className="flex items-center gap-1.5 flex-wrap">
              {permittedRoles.map((r) => (
                <span
                  key={r.key}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold border shadow-2xs ${r.badgeClass}`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>{r.shortLabel}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons - Matching Ikisaki Theme */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </button>
        </div>

        {/* Security Compliance Note */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-mono">
            Ikisaki Tours Security Engine • Least-Privilege Role-Based Access Control
          </p>
        </div>
      </div>
    </div>
  );
}
