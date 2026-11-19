"use client";

import React from "react";
import { ShieldCheck, Crown, ShieldAlert, CheckCircle2 } from "lucide-react";
import type { User } from "@/services/users.service";

interface UsersSummaryBarProps {
  users: User[];
}

export function UsersSummaryBar({ users }: UsersSummaryBarProps) {
  const totalCount = users.length;

  let activeCount = 0;
  let vipCount = 0;
  let verifiedCount = 0;
  let blockedCount = 0;

  for (const u of users) {
    if (u.hasAccess) activeCount++;
    else blockedCount++;

    if (u.isVip) vipCount++;
    if (u.isVerified) verifiedCount++;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5 mb-6">
      {/* 1. Total Registered Users (Hero Card) */}
      <div className="col-span-2 sm:col-span-1 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 p-4 text-white shadow-md relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
            Total Customers
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <p className="mt-2 text-2xl font-black tracking-tight">{totalCount}</p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Global registered accounts
        </p>
      </div>

      {/* 2. Active Access */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Active Accounts
          </span>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        </div>
        <p className="mt-2 text-2xl font-black text-slate-900">{activeCount}</p>
        <p className="mt-0.5 text-[11px] text-emerald-600 font-medium">
          Authorized platform access
        </p>
      </div>

      {/* 3. VIP Members */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            VIP Members
          </span>
          <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
        </div>
        <p className="mt-2 text-2xl font-black text-slate-900">{vipCount}</p>
        <p className="mt-0.5 text-[11px] text-amber-600 font-medium">
          Priority tour privileges
        </p>
      </div>

      {/* 4. Verified Profiles */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Verified
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
        </div>
        <p className="mt-2 text-2xl font-black text-slate-900">{verifiedCount}</p>
        <p className="mt-0.5 text-[11px] text-blue-600 font-medium">
          Email &amp; identity confirmed
        </p>
      </div>

      {/* 5. Suspended / Blocked */}
      <div className="col-span-2 md:col-span-4 lg:col-span-1 rounded-2xl bg-white border border-slate-200/90 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Suspended
          </span>
          <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
        </div>
        <p className="mt-2 text-2xl font-black text-slate-900">{blockedCount}</p>
        <p className="mt-0.5 text-[11px] text-rose-600 font-medium">
          {blockedCount > 0 ? "Requires review" : "Zero restrictions"}
        </p>
      </div>
    </div>
  );
}
