"use client";

import React from "react";
import NextImage from "next/image";
import {
  ShieldCheck,
  Smartphone,
  Power,
  KeyRound,
  Trash2,
  RefreshCw,
} from "lucide-react";
import type { AdminStaffUser, AdminRole } from "@/services/staff.service";
import { STAFF_ROLES, getRoleMeta } from "../data/staffRoles";
import { StaffRoleDropdown } from "./StaffRoleDropdown";

interface StaffTableProps {
  staffList: AdminStaffUser[];
  loading: boolean;
  currentAdminId?: string;
  currentAdminEmail?: string;
  onRoleChange: (staff: AdminStaffUser, newRole: AdminRole) => void;
  onRequestToggleStatus: (staff: AdminStaffUser) => void;
  onRequestResetPassword: (staff: AdminStaffUser) => void;
  onRequestDelete: (staff: AdminStaffUser) => void;
}

export function StaffTable({
  staffList,
  loading,
  currentAdminId,
  currentAdminEmail,
  onRoleChange,
  onRequestToggleStatus,
  onRequestResetPassword,
  onRequestDelete,
}: StaffTableProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs">
      <div className="overflow-x-auto min-h-[380px] pb-12">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4">Staff Member</th>
              <th className="py-3 px-4">Assigned Role (RBAC)</th>
              <th className="py-3 px-4">2FA Protection</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4">Last Login</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                  <span>Loading staff directory...</span>
                </td>
              </tr>
            ) : staffList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-500 font-medium">
                  No staff members found matching the selected filters.
                </td>
              </tr>
            ) : (
              staffList.map((staff) => {
                const roleMeta = getRoleMeta(staff.role);
                const IconComponent = roleMeta.icon;
                const isSelf =
                  (currentAdminId && staff.id === currentAdminId) ||
                  (currentAdminEmail && staff.email.toLowerCase() === currentAdminEmail.toLowerCase());

                return (
                  <tr key={staff.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* User Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 shrink-0 flex items-center justify-center text-white font-bold text-xs shadow-2xs">
                          {staff.avatarUrl ? (
                            <NextImage
                              src={staff.avatarUrl}
                              alt={staff.fullName}
                              width={40}
                              height={40}
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
                            <p className="font-bold text-slate-900 truncate leading-snug">{staff.fullName}</p>
                            {isSelf && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                You
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-mono truncate">{staff.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role Dropdown */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: `${roleMeta.colorHex}15`,
                            borderColor: `${roleMeta.colorHex}35`,
                            color: roleMeta.colorHex,
                          }}
                        >
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>

                        <StaffRoleDropdown
                          role={staff.role}
                          onRoleChange={(newRole) => onRoleChange(staff, newRole)}
                        />
                      </div>
                    </td>

                    {/* 2FA Status */}
                    <td className="py-3.5 px-4">
                      {staff.isTwoFactorEnabled ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>2FA Enforced</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                          <Smartphone className="w-3 h-3 text-slate-400" />
                          <span>Not Enforced</span>
                        </span>
                      )}
                    </td>

                    {/* Account Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
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
                    </td>

                    {/* Last Activity */}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px] font-mono">
                      {staff.lastLoginIp ? (
                        <div>
                          <p className="font-semibold text-slate-700">{staff.lastLoginIp}</p>
                          <p className="text-[10px] text-slate-400">
                            {staff.lastLoginAt ? new Date(staff.lastLoginAt).toLocaleDateString() : ""}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-sans">Never signed in</span>
                      )}
                    </td>

                    {/* Action Controls */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        {/* Suspend / Activate Button */}
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
                          className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                            isSelf
                              ? "opacity-40 cursor-not-allowed text-slate-400 border-slate-200"
                              : staff.isActive
                              ? "text-slate-500 hover:text-amber-600 hover:bg-amber-50 border-slate-200"
                              : "text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 border-slate-200"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {/* Reset Password Button */}
                        <button
                          type="button"
                          onClick={() => onRequestResetPassword(staff)}
                          title="Assign temporary password"
                          className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
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
                          className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                            isSelf
                              ? "opacity-30 cursor-not-allowed text-slate-300 border-slate-200"
                              : "border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          }`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
