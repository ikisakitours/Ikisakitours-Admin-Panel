"use client";

import { useState } from "react";
import { Mail, Globe, Eye, EyeOff, Hash, CheckCircle2, Crown, ShieldAlert, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { User } from "@/services/users.service";

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  const [showId, setShowId] = useState(false);

  const fullName = `${user.firstname} ${user.lastname}`;
  const initial = user.firstname ? user.firstname.charAt(0).toUpperCase() : "U";

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        {/* Header Profile Info & Avatar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={fullName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {initial}
                </div>
              )}
              {/* VIP Indicator Badge */}
              {user.isVip && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full border border-white" title="VIP Member">
                  <Crown className="w-2.5 h-2.5 fill-current" />
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 truncate">{fullName}</h3>
                {user.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-50 flex-shrink-0"/>
                )}
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                <Globe className="w-3 h-3 text-indigo-500" /> {user.country}
              </span>
            </div>
          </div>

          {/* Badges Stack */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            {/* Access Status Badge */}
            {user.hasAccess ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" /> Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <ShieldAlert className="w-3 h-3" /> Blocked
              </span>
            )}

            {/* VIP Label Badge */}
            {user.isVip && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                VIP
              </span>
            )}
          </div>
        </div>

        {/* User Details Grid */}
        <div className="mt-4 space-y-3">
          {/* Email Field */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-500">
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </div>
            <span className="font-semibold text-slate-800 truncate max-w-[180px]">
              {user.email}
            </span>
          </div>

          {/* User ID Field with Toggle */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-500">
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
              >
                {showId ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
        <span>Country: {user.country}</span>
        <span>
          Joined: {new Date(user.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}