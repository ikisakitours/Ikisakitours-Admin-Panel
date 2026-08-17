"use client";

import { useState } from "react";
import { User, Mail, Shield, Eye, EyeOff, Key } from "lucide-react";

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  passwordHash?: string;
  createdAt: string;
}

interface UserCardProps {
  user: UserData;
}

export default function UserCard({ user }: UserCardProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow">
      {/* Header Profile Info */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-slate-900 truncate">{user.name}</h3>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <Shield className="w-3 h-3 text-indigo-500" /> {user.role}
          </span>
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

        {/* Password / Hash Field */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <Key className="w-3.5 h-3.5" />
            <span>Password</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono">
            <span className="text-slate-800 font-semibold">
              {showPassword ? user.passwordHash || "••••••••" : "••••••••"}
            </span>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
        <span>ID: {user.id}</span>
        <span>Joined: {user.createdAt}</span>
      </div>
    </div>
  );
}