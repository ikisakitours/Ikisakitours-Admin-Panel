"use client";

import React, { useState } from "react";
import { KeyRound, X, Sparkles, Loader2 } from "lucide-react";
import type { AdminStaffUser } from "@/services/staff.service";

interface StaffResetPasswordModalProps {
  staff: AdminStaffUser | null;
  onClose: () => void;
  onSubmit: (newPassword: string) => Promise<void>;
  loading: boolean;
}

export function StaffResetPasswordModal({
  staff,
  onClose,
  onSubmit,
  loading,
}: StaffResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState("");

  if (!staff) return null;

  const generateStrongPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let pwd = "";
    for (let i = 0; i < 12; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(`Ikisaki!${pwd}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    await onSubmit(newPassword.trim());
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-white w-full max-w-md rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 shadow-2xs">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Reset Staff Password
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[240px]">
                For: <strong>{staff.fullName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
            <p className="font-bold text-slate-700">Account: {staff.email}</p>
            <p className="text-slate-500 text-[11px]">
              The staff member will be required to change this temporary password upon their next sign-in.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                New Temporary Password *
              </label>
              <button
                type="button"
                onClick={generateStrongPassword}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Generate</span>
              </button>
            </div>

            <input
              type="text"
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="e.g. Ikisaki!9xK@82Lm"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium outline-none focus:bg-white focus:border-emerald-600 font-mono shadow-2xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={loading}
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !newPassword.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save New Password</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
