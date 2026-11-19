"use client";

import React, { useState } from "react";
import { Mail, Globe, Eye, EyeOff, Hash, CheckCircle2, ShieldAlert, ShieldCheck, Loader2, Crown, Copy, Check } from "lucide-react";
import Image from "next/image";
import type { User } from "@/services/users.service";

interface UserCardProps {
  user: User;
  actionLoadingId?: string | null;
  onToggleAccess?: (user: User) => Promise<void>;
  onToggleVip?: (user: User) => Promise<void>;
  onToggleVerified?: (user: User) => Promise<void>;
}

export default function UserCard({
  user,
  actionLoadingId,
  onToggleAccess,
  onToggleVip,
  onToggleVerified,
}: UserCardProps) {
  const [showId, setShowId] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Guest Customer";
  const initial = user.firstname ? user.firstname.charAt(0).toUpperCase() : "U";

  const isBusyAccess = actionLoadingId === `${user.id}-access`;
  const isBusyVip = actionLoadingId === `${user.id}-vip`;
  const isBusyVerified = actionLoadingId === `${user.id}-verified`;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(user.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 1800);
    } catch {
      // ignore
    }
  };

  return (
    <div className={`w-full bg-white rounded-2xl border p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between border-l-4 ${
      !user.hasAccess ? "border-l-rose-500 border-slate-200" : user.isVip ? "border-l-amber-400 border-slate-200" : "border-l-emerald-500 border-slate-200"
    }`}>
      <div>
        {/* Header Profile Info & Avatar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={fullName}
                  width={42}
                  height={42}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-extrabold text-sm">
                  {initial}
                </div>
              )}

              {/* VIP Indicator Badge (Crown) */}
              {user.isVip && (
                <div
                  className="absolute -top-1.5 -right-1.5 bg-gradient-to-tr from-amber-500 to-yellow-400 text-white p-1 rounded-full border-2 border-white shadow-xs flex items-center justify-center"
                  title="VIP Member"
                >
                  <Crown className="w-2.5 h-2.5 fill-current" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-slate-900 truncate">{fullName}</h3>
                {user.isVerified && (
                  <span title="Verified Customer">
                    <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50 shrink-0" />
                  </span>
                )}
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-0.5">
                <Globe className="w-3 h-3 text-indigo-500 shrink-0" />
                <span>{user.country || "International"}</span>
              </span>
            </div>
          </div>

          {/* Badges Stack (Interactive Toggles) */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {/* Access Status Toggle Button */}
            <button
              type="button"
              disabled={Boolean(actionLoadingId)}
              onClick={() => onToggleAccess?.(user)}
              className="group cursor-pointer focus:outline-none"
              title="Click to toggle access permission"
            >
              {user.hasAccess ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:bg-emerald-100 transition-colors">
                  {isBusyAccess ? (
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                  ) : (
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  )}
                  <span>Active</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 group-hover:bg-rose-100 transition-colors">
                  {isBusyAccess ? (
                    <Loader2 className="w-3 h-3 animate-spin text-rose-600" />
                  ) : (
                    <ShieldAlert className="w-3 h-3 text-rose-600" />
                  )}
                  <span>Blocked</span>
                </span>
              )}
            </button>

            {/* VIP Status Toggle Button */}
            <button
              type="button"
              disabled={Boolean(actionLoadingId)}
              onClick={() => onToggleVip?.(user)}
              className="group cursor-pointer focus:outline-none"
              title="Click to toggle VIP status"
            >
              {user.isVip ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 group-hover:bg-amber-100 transition-colors">
                  {isBusyVip ? (
                    <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                  ) : (
                    <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                  )}
                  <span>VIP</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 group-hover:bg-slate-200 transition-colors">
                  {isBusyVip && <Loader2 className="w-3 h-3 animate-spin text-slate-500" />}
                  <span>Standard</span>
                </span>
              )}
            </button>

            {/* Verified Status Toggle Button */}
            <button
              type="button"
              disabled={Boolean(actionLoadingId)}
              onClick={() => onToggleVerified?.(user)}
              className="group cursor-pointer focus:outline-none"
              title="Click to toggle verified status"
            >
              {user.isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-100 transition-colors">
                  {isBusyVerified ? (
                    <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-blue-600" />
                  )}
                  <span>Verified</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 group-hover:bg-slate-200 transition-colors">
                  {isBusyVerified && <Loader2 className="w-3 h-3 animate-spin text-slate-500" />}
                  <span>Unverified</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="mt-4 space-y-2.5">
          {/* Email Field */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </div>
            <a
              href={`mailto:${user.email}`}
              className="font-semibold text-slate-800 hover:text-emerald-700 truncate max-w-[200px]"
              title={user.email}
            >
              {user.email}
            </a>
          </div>

          {/* User ID Field with Toggle & Copy */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-400">
              <Hash className="w-3.5 h-3.5" />
              <span>User ID</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-slate-800 font-semibold text-[11px]">
                {showId ? user.id : `${user.id.substring(0, 8)}...`}
              </span>
              <button
                type="button"
                onClick={() => setShowId(!showId)}
                className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                title={showId ? "Hide ID" : "Show ID"}
              >
                {showId ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleCopyId}
                className="text-slate-400 hover:text-emerald-700 transition-colors cursor-pointer"
                title="Copy ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
        <span>Country: {user.country || "—"}</span>
        <span>
          Joined:{" "}
          {user.createdAt
            ? new Date(user.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "—"}
        </span>
      </div>
    </div>
  );
}
