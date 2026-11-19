"use client";

import React, { useState } from "react";
import {
  UserPlus,
  X,
  Mail,
  Lock,
  Sparkles,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { CreateStaffDto, AdminRole } from "@/services/staff.service";
import { STAFF_ROLES } from "../data/staffRoles";

interface StaffAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: CreateStaffDto) => Promise<void>;
  loading: boolean;
}

export function StaffAddModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
}: StaffAddModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("PACKAGE_MANAGER");
  const [showPassword, setShowPassword] = useState(false);
  const [roleCategoryFilter, setRoleCategoryFilter] = useState<string>("ALL");

  if (!isOpen) return null;

  const generateStrongPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newPwd = `Ikisaki!${pwd}`;
    setPassword(newPwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      fullName: fullName.trim(),
      email: email.trim(),
      password: password.trim(),
      role,
    });
  };

  const categories = ["ALL", "Executive", "Operations", "Content", "Support & Compliance"];

  const filteredRoles = STAFF_ROLES.filter(
    (r) => roleCategoryFilter === "ALL" || r.category === roleCategoryFilter
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-white w-full max-w-3xl md:max-w-4xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-2xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                Onboard New Staff Member
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Assign initial credentials and role-based operational permissions.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* Identity & Credentials Fields */}
          <div className="space-y-4">
            {/* Input Fields Grid (2 Columns: Password stays in Column 1, avoiding overly wide stretching) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Full Name */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                  Staff Full Name *
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Kamal Perera"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium outline-none focus:bg-white focus:border-emerald-600 transition-all"
                />
              </div>

              {/* 2. Email Address */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                  Staff Email Address (Login ID) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kamal@ikisakitours.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium outline-none focus:bg-white focus:border-emerald-600 transition-all font-mono"
                  />
                </div>
              </div>

              {/* 3. Temporary Password (Column 1 - Perfectly balanced with Full Name above, NOT full width) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                    Temporary Initial Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Auto-Generate</span>
                  </button>
                </div>

                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter temporary password..."
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium outline-none focus:bg-white focus:border-emerald-600 font-mono shadow-2xs transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* First Sign-In Security Policy: Spans Full Width under Password */}
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl flex items-start gap-3 w-full shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 text-xs text-emerald-950 flex-1">
                <p className="font-extrabold text-[12px] text-emerald-900 flex items-center gap-2">
                  <span>First Sign-In Security Policy</span>
                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-emerald-200/80 text-emerald-900">
                    Mandatory
                  </span>
                </p>
                <p className="text-emerald-800 leading-relaxed text-[11px]">
                  Upon first login, the new staff member will be required to replace this temporary initial key with their private personal password and immediately enroll their Google Authenticator (TOTP 2FA) app before accessing operational dashboards.
                </p>
              </div>
            </div>
          </div>

          {/* 10 Role Types Selector Grid */}
          <div className="space-y-3 pt-1">
            {/* Section Heading & Category Filter Pills */}
            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                  Assign Access Role &amp; Privileges ({STAFF_ROLES.length} Specialized Roles) *
                </label>
                <p className="text-xs text-slate-500">
                  Select the tailored role defining this staff member&apos;s operational permissions.
                </p>
              </div>

              {/* Dedicated Category Pills Row */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {categories.map((cat) => {
                  const count =
                    cat === "ALL"
                      ? STAFF_ROLES.length
                      : STAFF_ROLES.filter((r) => r.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setRoleCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        roleCategoryFilter === cat
                          ? "bg-slate-900 text-white shadow-2xs"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2-Column Responsive Grid of Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredRoles.map((r) => {
                const IconComponent = r.icon;
                const isSelected = role === r.key;

                return (
                  <div
                    key={r.key}
                    onClick={() => setRole(r.key)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? "bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
                    }`}
                  >
                    {/* Role Icon Box */}
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5"
                      style={{
                        backgroundColor: `${r.colorHex}15`,
                        borderColor: `${r.colorHex}35`,
                        color: r.colorHex,
                      }}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-black text-slate-900 tracking-tight">
                          {r.title}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {r.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                        {r.description}
                      </p>
                    </div>

                    {/* Checkmark indicator */}
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all absolute right-3 top-3.5 ${
                        isSelected
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !fullName.trim() || !email.trim() || !password.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Provisioning Staff Account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Staff Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
