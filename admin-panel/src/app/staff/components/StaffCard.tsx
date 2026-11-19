"use client";

import React from "react";
import NextImage from "next/image";
import {
  ShieldCheck,
  Smartphone,
  Power,
  KeyRound,
  Trash2,
  Calendar,
  Globe,
} from "lucide-react";
import type { AdminStaffUser, AdminRole } from "@/services/staff.service";
import { STAFF_ROLES, getRoleMeta } from "../data/staffRoles";
import { StaffRoleDropdown } from "./StaffRoleDropdown";

interface StaffCardProps {
  staff: AdminStaffUser;
  currentAdminId?: string;
  currentAdminEmail?: string;
  onRoleChange: (staff: AdminStaffUser, newRole: AdminRole) => void;
  onRequestToggleStatus: (staff: AdminStaffUser) => void;
  onRequestResetPassword: (staff: AdminStaffUser) => void;
  onRequestDelete: (staff: AdminStaffUser) => void;
}

export function StaffCard({
  staff,
  currentAdminId,
  currentAdminEmail,
  onRoleChange,
  onRequestToggleStatus,
  onRequestResetPassword,
  onRequestDelete,
}: StaffCardProps) {
  const roleMeta = getRoleMeta(staff.role);
  const IconComponent = roleMeta.icon;
  const isSelf =
    (currentAdminId && staff.id === currentAdminId) ||
    (currentAdminEmail && staff.email.toLowerCase() === currentAdminEmail.toLowerCase());

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4">
      {/* Top Section: Avatar, Status, 2FA */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              {staff.avatarUrl ? (
                <NextImage
                  src={staff.avatarUrl}
                  alt={staff.fullName}
                  width={48}
                  height={48}
                  unoptimized
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black">
                  {staff.fullName.charAt(0).toUpperCase() || "S"}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="font-extrabold text-slate-900 text-sm truncate">{staff.fullName}</h3>
                {isSelf && (
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                    You
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">{staff.email}</p>
            </div>
          </div>

          {/* Active status pulse */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
              staff.isActive
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                staff.isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
              }`}
            />
            <span>{staff.isActive ? "Active" : "Suspended"}</span>
          </span>
        </div>

        {/* Role Selector Card */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Role &amp; Privileges
            </span>
            <span className="text-[10px] font-bold text-slate-400">{roleMeta.category}</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border"
              style={{
                backgroundColor: `${roleMeta.colorHex}15`,
                borderColor: `${roleMeta.colorHex}35`,
                color: roleMeta.colorHex,
              }}
            >
              <IconComponent className="w-4 h-4" />
            </div>

            <StaffRoleDropdown
              role={staff.role}
              onRoleChange={(newRole) => onRoleChange(staff, newRole)}
            />
          </div>

          <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">{roleMeta.description}</p>
        </div>

        {/* Meta badges: 2FA & Last Activity */}
        <div className="space-y-1.5 text-[11px] text-slate-500 font-medium pt-1">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>2FA Security</span>
            </span>
            {staff.isTwoFactorEnabled ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Active
              </span>
            ) : (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                Not Enforced
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Last Signed IP</span>
            </span>
            <span className="font-mono text-[11px] text-slate-700 font-semibold">
              {staff.lastLoginIp || "None"}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Action Buttons */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onRequestToggleStatus(staff)}
          title={
            isSelf
              ? "Cannot suspend your own account"
              : staff.role === "SUPER_ADMIN" && staff.isActive
              ? "Super Admin accounts cannot be suspended"
              : staff.isActive
              ? "Suspend staff account"
              : "Re-activate staff account"
          }
          className={`flex-1 py-1.5 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
            isSelf
              ? "opacity-40 cursor-not-allowed text-slate-400 border-slate-200"
              : staff.isActive
              ? "text-slate-600 hover:text-amber-700 hover:bg-amber-50 border-slate-200"
              : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border-slate-200"
          }`}
        >
          <Power className="w-3.5 h-3.5" />
          <span>{staff.isActive ? "Suspend" : "Activate"}</span>
        </button>

        <button
          type="button"
          onClick={() => onRequestResetPassword(staff)}
          title="Reset Password"
          className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
        >
          <KeyRound className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onRequestDelete(staff)}
          title={
            isSelf
              ? "Cannot delete your own account"
              : staff.role === "SUPER_ADMIN"
              ? "Super Admin accounts cannot be deleted directly"
              : "Delete staff member"
          }
          className={`p-2 rounded-xl border transition-colors cursor-pointer ${
            isSelf
              ? "opacity-30 cursor-not-allowed text-slate-300 border-slate-200"
              : "border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
          }`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
