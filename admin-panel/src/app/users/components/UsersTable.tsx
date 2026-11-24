"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Check,
  CheckCircle2,
  Copy,
  Crown,
  Eye,
  EyeOff,
  Globe,
  Loader2,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Users as UsersIcon,
} from "lucide-react";
import type { User } from "@/services/users.service";
import { HoverScrollText } from "@/components/HoverScrollText";

interface UsersTableProps {
  users: User[];
  loading: boolean;
  actionLoadingId: string | null;
  onToggleAccess: (user: User) => Promise<void>;
  onToggleVip: (user: User) => Promise<void>;
  onToggleVerified: (user: User) => Promise<void>;
}

export function UsersTable({
  users,
  loading,
  actionLoadingId,
  onToggleAccess,
  onToggleVip,
  onToggleVerified,
}: UsersTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});

  const handleCopy = async (userId: string) => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopiedId(userId);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // ignore
    }
  };

  const toggleReveal = (userId: string) => {
    setRevealedIds((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="h-4 w-48 rounded bg-slate-200 animate-pulse" />
        </div>
        <div className="divide-y divide-slate-200/70">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-4 w-36 rounded bg-slate-200 animate-pulse" />
                  <div className="h-3 w-48 rounded bg-slate-100 animate-pulse" />
                </div>
              </div>
              <div className="h-7 w-20 rounded-full bg-slate-200 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-dashed border-slate-300 py-14 px-6 text-center space-y-2">
        <UsersIcon className="w-8 h-8 text-slate-300 mx-auto" />
        <p className="text-sm font-bold text-slate-700">No registered users found</p>
        <p className="text-xs text-slate-500">
          Try adjusting your search criteria or filter options.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Top Meta Bar */}
      <div className="px-5 py-3 border-b border-slate-200/80 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
            Registered Customers ({users.length})
          </span>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-3 text-[10px] font-semibold text-slate-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Active Account
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-amber-400" /> VIP Member
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-400" /> Suspended
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <th className="py-3 pl-4 pr-3 w-[240px]">Ref &amp; Customer</th>
              <th className="py-3 px-3 min-w-[220px]">Email &amp; ID</th>
              <th className="py-3 px-3 w-[130px]">Country</th>
              <th className="py-3 px-3 w-[130px]">Access</th>
              <th className="py-3 px-3 w-[130px]">Tier</th>
              <th className="py-3 px-3 w-[120px]">Verified</th>
              <th className="py-3 pl-3 pr-4 text-right w-[140px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/80 text-xs">
            {users.map((user, rowIndex) => {
              const fullName = `${user.firstname || ""} ${user.lastname || ""}`.trim() || "Guest Customer";
              const initial = user.firstname ? user.firstname.charAt(0).toUpperCase() : "U";
              const isBusyAccess = actionLoadingId === `${user.id}-access`;
              const isBusyVip = actionLoadingId === `${user.id}-vip`;
              const isBusyVerified = actionLoadingId === `${user.id}-verified`;
              const isRevealed = Boolean(revealedIds[user.id]);

              return (
                <tr
                  key={user.id}
                  className={`border-l-[3px] ${
                    !user.hasAccess
                      ? "border-l-rose-500"
                      : user.isVip
                      ? "border-l-amber-400"
                      : "border-l-emerald-500"
                  } transition-colors odd:bg-white even:bg-slate-50/65 hover:bg-emerald-50/45`}
                >
                  {/* 1. Ref # + Avatar + Full Name */}
                  <td className="py-3.5 pl-3.5 pr-3 align-middle whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-400 w-5">
                        {String(rowIndex + 1).padStart(2, "0")}
                      </span>

                      {/* Avatar */}
                      <div className="relative shrink-0">
                        {user.avatarUrl ? (
                          <Image
                            src={user.avatarUrl}
                            alt={fullName}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-100 to-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-extrabold text-xs">
                            {initial}
                          </div>
                        )}
                        {user.isVip && (
                          <div
                            className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full border-2 border-white shadow-xs"
                            title="VIP Member"
                          >
                            <Crown className="w-2.5 h-2.5 fill-current" />
                          </div>
                        )}
                      </div>

                      {/* Name & Joined */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <HoverScrollText
                            text={fullName}
                            className="font-extrabold text-slate-900 text-xs max-w-[150px]"
                          />
                          {user.isVerified && (
                            <span title="Verified Profile">
                              <CheckCircle2
                                className="w-3.5 h-3.5 text-blue-500 fill-blue-50 shrink-0"
                              />
                            </span>
                          )}
                          {Boolean(user.isTwoFactorEnabled || (user as any).is_two_factor_enabled) && (
                            <span title="Two-Factor Authentication (2FA) Protected" className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-teal-50 text-teal-700 border border-teal-200">
                              <ShieldCheck className="w-2.5 h-2.5 text-teal-600 shrink-0" />
                              <span>2FA</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          Joined:{" "}
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString(undefined, {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* 2. Email & ID */}
                  <td className="py-3.5 px-3 align-middle max-w-[200px] whitespace-nowrap">
                    <HoverScrollText
                      text={user.email || "—"}
                      className="font-semibold text-slate-800 text-xs max-w-[200px]"
                    />
                    {/* 2. Email & ID */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {(user.referenceId || user.customerReferenceId) && (
                        <span className="inline-flex items-center px-1.5 py-0.2 rounded-md bg-amber-50 text-amber-800 border border-amber-200/80 font-mono text-[9px] font-extrabold tracking-tight" title="Ikisaki Customer Reference ID">
                          {user.referenceId || user.customerReferenceId}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 font-mono">
                        {isRevealed ? user.id : `${user.id.substring(0, 8)}...`}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleReveal(user.id)}
                        title={isRevealed ? "Hide full ID" : "Show full ID"}
                        className="text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {isRevealed ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(user.referenceId || user.customerReferenceId || user.id)}
                        title="Copy Customer ID"
                        className="text-slate-400 hover:text-emerald-700 cursor-pointer"
                      >
                        {copiedId === user.id ? (
                          <Check className="w-2.5 h-2.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* 3. Country */}
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700">
                      <Globe className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>{user.country || "—"}</span>
                    </span>
                  </td>

                  {/* 4. Access Toggle */}
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                    <button
                      type="button"
                      disabled={Boolean(actionLoadingId)}
                      onClick={() => onToggleAccess(user)}
                      className="group cursor-pointer focus:outline-none"
                      title="Click to toggle access permission"
                    >
                      {user.hasAccess ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:bg-emerald-100 transition-colors">
                          {isBusyAccess ? (
                            <Loader2 className="w-3 h-3 animate-spin text-emerald-600" />
                          ) : (
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          )}
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-50 text-rose-700 border border-rose-200 group-hover:bg-rose-100 transition-colors">
                          {isBusyAccess ? (
                            <Loader2 className="w-3 h-3 animate-spin text-rose-600" />
                          ) : (
                            <ShieldAlert className="w-3 h-3 text-rose-600" />
                          )}
                          <span>Blocked</span>
                        </span>
                      )}
                    </button>
                  </td>

                  {/* 5. VIP Tier Toggle */}
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                    <button
                      type="button"
                      disabled={Boolean(actionLoadingId)}
                      onClick={() => onToggleVip(user)}
                      className="group cursor-pointer focus:outline-none"
                      title="Click to toggle VIP status"
                    >
                      {user.isVip ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 group-hover:bg-amber-100 transition-colors">
                          {isBusyVip ? (
                            <Loader2 className="w-3 h-3 animate-spin text-amber-600" />
                          ) : (
                            <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                          )}
                          <span>VIP</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 group-hover:bg-slate-200 transition-colors">
                          {isBusyVip && <Loader2 className="w-3 h-3 animate-spin text-slate-500" />}
                          <span>Standard</span>
                        </span>
                      )}
                    </button>
                  </td>

                  {/* 6. Verification Toggle */}
                  <td className="py-3.5 px-3 align-middle whitespace-nowrap">
                    <button
                      type="button"
                      disabled={Boolean(actionLoadingId)}
                      onClick={() => onToggleVerified(user)}
                      className="group cursor-pointer focus:outline-none"
                      title="Click to toggle identity verification"
                    >
                      {user.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-100 transition-colors">
                          {isBusyVerified ? (
                            <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                          ) : (
                            <CheckCircle2 className="w-3 h-3 text-blue-600" />
                          )}
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 group-hover:bg-slate-200 transition-colors">
                          {isBusyVerified && <Loader2 className="w-3 h-3 animate-spin text-slate-500" />}
                          <span>Unverified</span>
                        </span>
                      )}
                    </button>
                  </td>

                  {/* 7. Actions */}
                  <td className="py-3.5 pl-3 pr-4 align-middle text-right whitespace-nowrap">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      <a
                        href={`mailto:${user.email}?subject=Ikisaki%20Tours%20Account%20Assistance`}
                        title="Send Direct Email"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
