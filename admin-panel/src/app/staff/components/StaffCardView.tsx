"use client";

import React from "react";
import { RefreshCw } from "lucide-react";
import type { AdminStaffUser, AdminRole } from "@/services/staff.service";
import { StaffCard } from "./StaffCard";

interface StaffCardViewProps {
  staffList: AdminStaffUser[];
  loading: boolean;
  onRoleChange: (staff: AdminStaffUser, newRole: AdminRole) => void;
  onRequestToggleStatus: (staff: AdminStaffUser) => void;
  onRequestResetPassword: (staff: AdminStaffUser) => void;
  onRequestDelete: (staff: AdminStaffUser) => void;
}

export function StaffCardView({
  staffList,
  loading,
  onRoleChange,
  onRequestToggleStatus,
  onRequestResetPassword,
  onRequestDelete,
}: StaffCardViewProps) {
  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 bg-white rounded-3xl border border-slate-200">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-600" />
        <span className="text-xs font-semibold">Loading staff directory...</span>
      </div>
    );
  }

  if (staffList.length === 0) {
    return (
      <div className="py-20 text-center text-slate-500 bg-white rounded-3xl border border-slate-200">
        <p className="text-sm font-bold text-slate-700">No staff members found</p>
        <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {staffList.map((staff) => (
        <StaffCard
          key={staff.id}
          staff={staff}
          onRoleChange={onRoleChange}
          onRequestToggleStatus={onRequestToggleStatus}
          onRequestResetPassword={onRequestResetPassword}
          onRequestDelete={onRequestDelete}
        />
      ))}
    </div>
  );
}
