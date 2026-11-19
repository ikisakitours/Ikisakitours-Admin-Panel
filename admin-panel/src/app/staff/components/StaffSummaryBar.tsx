"use client";

import React from "react";
import { Users, Crown, Compass, BookOpen, ShieldCheck } from "lucide-react";
import type { AdminStaffUser } from "@/services/staff.service";

interface StaffSummaryBarProps {
  staffList: AdminStaffUser[];
}

export function StaffSummaryBar({ staffList }: StaffSummaryBarProps) {
  const total = staffList.length;
  const superAdmins = staffList.filter((s) => s.role === "SUPER_ADMIN").length;
  const opsStaff = staffList.filter((s) =>
    ["OPERATIONS_MANAGER", "BOOKING_AGENT", "TRANSPORT_COORDINATOR"].includes(s.role)
  ).length;
  const contentStaff = staffList.filter((s) =>
    ["PACKAGE_MANAGER", "DESTINATION_EXPERT", "CONTENT_EDITOR", "REVIEW_MODERATOR"].includes(s.role)
  ).length;
  const twoFaActive = staffList.filter((s) => s.isTwoFactorEnabled).length;
  const twoFaRate = total > 0 ? Math.round((twoFaActive / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
      {/* 1. Total Staff */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Staff</span>
          <Users className="w-4 h-4 text-slate-400" />
        </div>
        <p className="text-2xl font-black text-slate-900 mt-2">{total}</p>
        <span className="text-[10px] text-slate-400 font-medium">Provisioned accounts</span>
      </div>

      {/* 2. Super Admins */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Super Admins</span>
          <Crown className="w-4 h-4 text-emerald-600" />
        </div>
        <p className="text-2xl font-black text-slate-900 mt-2">{superAdmins}</p>
        <span className="text-[10px] text-emerald-600 font-semibold">Unrestricted root access</span>
      </div>

      {/* 3. Operations & Logistics */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">Operations &amp; Fleet</span>
          <Compass className="w-4 h-4 text-sky-600" />
        </div>
        <p className="text-2xl font-black text-slate-900 mt-2">{opsStaff}</p>
        <span className="text-[10px] text-sky-600 font-semibold">Bookings, Fleet &amp; Transfers</span>
      </div>

      {/* 4. Content & Catalog */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Content &amp; Catalog</span>
          <BookOpen className="w-4 h-4 text-amber-600" />
        </div>
        <p className="text-2xl font-black text-slate-900 mt-2">{contentStaff}</p>
        <span className="text-[10px] text-amber-600 font-semibold">Packages, Blogs &amp; Destinations</span>
      </div>

      {/* 5. 2FA Security Rate */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700">2FA Compliance</span>
          <ShieldCheck className="w-4 h-4 text-teal-600" />
        </div>
        <p className="text-2xl font-black text-slate-900 mt-2">{twoFaRate}%</p>
        <span className="text-[10px] text-teal-600 font-semibold">
          {twoFaActive} of {total} protected
        </span>
      </div>
    </div>
  );
}
