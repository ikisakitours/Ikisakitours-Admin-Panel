"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import NextImage from "next/image";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Copy,
  Check,
  AlertCircle,
  CheckCircle2,
  X,
  Loader2,
  KeyRound,
  ShieldAlert,
  User,
  Camera,
  UploadCloud,
} from "lucide-react";
import { authService, AdminUser } from "@/services/auth.service";

interface AdminSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (user: AdminUser) => void;
}

interface ConvertedWebP {
  dataUrl: string;
  file: File;
}

/**
 * Client-side WebP image conversion and downscaling
 */
function convertImageToWebP(file: File, maxDim = 512, quality = 0.85): Promise<ConvertedWebP> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      // Use browser native window.Image / HTMLImageElement constructor
      const img = typeof window !== "undefined" ? new window.Image() : new (globalThis as any).Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context unavailable"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/webp", quality);
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create WebP blob"));
              return;
            }
            const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
            const webpFile = new File([blob], `${cleanName || "avatar"}-${Date.now()}.webp`, {
              type: "image/webp",
            });
            resolve({ dataUrl, file: webpFile });
          },
          "image/webp",
          quality
        );
      };
      img.onerror = () => reject(new Error("Failed to load image for WebP conversion"));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.readAsDataURL(file);
  });
}

export function AdminSecurityModal({ isOpen, onClose, onProfileUpdated }: AdminSecurityModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "2fa">("profile");

  // Profile state
  const [fullName, setFullName] = useState("Ikisaki Admin");
  const [email, setEmail] = useState("admin@ikisakitours.com");
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [avatarConverting, setAvatarConverting] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Clear password inputs and defeat browser autofill when opening password tab
  useEffect(() => {
    if (activeTab === "password") {
      const timer = setTimeout(() => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordMsg(null);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrLoading, setQrLoading] = useState(false);
  const [secret, setSecret] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorMsg, setTwoFactorMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Disable 2FA state
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setMounted(true);
    });
  }, []);

  // Load current admin details
  useEffect(() => {
    if (!isOpen) return;
    queueMicrotask(() => {
      setUserLoading(true);
    });
    authService.getMe().then((user) => {
      if (user) {
        if (user.fullName) setFullName(user.fullName);
        if (user.email) setEmail(user.email);
        if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
        if (typeof user.isTwoFactorEnabled === "boolean") {
          setIs2FAEnabled(user.isTwoFactorEnabled);
        }
      }
      setUserLoading(false);
    }).catch(() => {
      setUserLoading(false);
    });
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  // Handle avatar file selection & conversion to WebP
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setAvatarConverting(true);
      setProfileMsg(null);
      const converted = await convertImageToWebP(file, 512, 0.85);
      await new Promise((r) => setTimeout(r, 300));
      setAvatarPreview(converted.dataUrl);
      setPendingAvatarFile(converted.file);
      setProfileMsg({
        type: "success",
        text: `Image converted to WebP! Click 'Save Profile Changes' to upload to Cloudflare R2 storage.`,
      });
    } catch {
      setProfileMsg({
        type: "error",
        text: "Could not convert image to WebP. Please try another image file.",
      });
    } finally {
      setAvatarConverting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);

    if (!fullName.trim()) {
      setProfileMsg({ type: "error", text: "Please enter your administrator full name." });
      return;
    }

    try {
      setProfileLoading(true);
      let finalAvatarUrl = avatarUrl;

      // If a new WebP image was selected, upload to Cloudflare R2 bucket first
      if (pendingAvatarFile) {
        setUploadStatus("Uploading to Cloudflare R2 storage...");
        try {
          finalAvatarUrl = await authService.uploadAvatar(pendingAvatarFile, "admin");
        } catch (uploadErr: any) {
          setProfileMsg({
            type: "error",
            text: `R2 Upload Failed: ${uploadErr.message || "Could not upload image to Cloudflare storage."}`,
          });
          setProfileLoading(false);
          setUploadStatus("");
          return;
        }
      }

      const previousAvatarUrl = pendingAvatarFile ? (avatarUrl || undefined) : undefined;
      setUploadStatus("Saving administrator profile...");
      const res = await authService.updateProfile({
        fullName: fullName.trim(),
        avatarUrl: finalAvatarUrl,
        oldAvatarUrl: previousAvatarUrl,
      });

      if (res.success) {
        setAvatarUrl(finalAvatarUrl);
        setAvatarPreview("");
        setPendingAvatarFile(null);
        setProfileMsg({ type: "success", text: res.message || "Profile updated successfully!" });
        if (res.user && onProfileUpdated) {
          onProfileUpdated(res.user);
        }
      } else {
        setProfileMsg({ type: "error", text: res.message || "Failed to update profile." });
      }
    } catch {
      setProfileMsg({ type: "error", text: "Error communicating with server." });
    } finally {
      setProfileLoading(false);
      setUploadStatus("");
    }
  };

  // Password strength evaluation
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const strengthScore = [hasMinLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters long." });
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await authService.changePassword(currentPassword, newPassword);
      if (res.success) {
        setPasswordMsg({ type: "success", text: res.message });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setPasswordMsg({ type: "error", text: res.message });
      }
    } catch {
      setPasswordMsg({ type: "error", text: "An error occurred while updating your password." });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleGenerate2FA = async () => {
    setTwoFactorMsg(null);
    setQrLoading(true);
    try {
      const res = await authService.generate2FA();
      if (res.success && res.secret) {
        setSecret(res.secret);
        setQrCodeDataUrl(res.qrCodeDataUrl || null);
      } else {
        setTwoFactorMsg({ type: "error", text: res.message || "Failed to initialize 2FA setup." });
      }
    } catch {
      setTwoFactorMsg({ type: "error", text: "Failed to communicate with authentication server." });
    } finally {
      setQrLoading(false);
    }
  };

  const handleCopySecret = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorMsg(null);

    if (totpCode.trim().length !== 6) {
      setTwoFactorMsg({ type: "error", text: "Please enter a valid 6-digit verification code." });
      return;
    }

    try {
      setTwoFactorLoading(true);
      const res = await authService.enable2FA(totpCode.trim());
      if (res.success) {
        setIs2FAEnabled(true);
        setSecret(null);
        setQrCodeDataUrl(null);
        setTotpCode("");
        setTwoFactorMsg({ type: "success", text: res.message });
      } else {
        setTwoFactorMsg({ type: "error", text: res.message });
      }
    } catch {
      setTwoFactorMsg({ type: "error", text: "Verification failed. Please check your code." });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDisable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFactorMsg(null);

    if (!disablePassword.trim()) {
      setTwoFactorMsg({ type: "error", text: "Please enter your password to disable 2FA." });
      return;
    }

    try {
      setTwoFactorLoading(true);
      const res = await authService.disable2FA(disablePassword.trim());
      if (res.success) {
        setIs2FAEnabled(false);
        setShowDisableForm(false);
        setDisablePassword("");
        setTwoFactorMsg({ type: "success", text: "Two-Factor Authentication has been disabled." });
      } else {
        setTwoFactorMsg({ type: "error", text: res.message });
      }
    } catch {
      setTwoFactorMsg({ type: "error", text: "Failed to disable 2FA. Please try again." });
    } finally {
      setTwoFactorLoading(false);
    }
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-120 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="relative p-6 pr-14 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              Admin Profile &amp; Security
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Manage your name, WebP avatar, password, and 2FA protection
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 bg-slate-50/30 px-6 pt-3 gap-3 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-1.5 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === "profile"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
          >
            <User className="w-4 h-4" />
            <span>Profile &amp; Avatar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("password")}
            className={`flex items-center gap-1.5 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === "password"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
          >
            <Lock className="w-4 h-4" />
            <span>Change Password</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("2fa")}
            className={`flex items-center gap-1.5 pb-3 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === "2fa"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>2FA Authenticator</span>
            {is2FAEnabled && (
              <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Active
              </span>
            )}
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* TAB 1: ADMIN PROFILE & WEBP AVATAR */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileMsg && (
                <div
                  className={`p-3 rounded-2xl text-xs font-medium flex items-start gap-2.5 ${profileMsg.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                    }`}
                >
                  {profileMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{profileMsg.text}</span>
                </div>
              )}

              {/* Avatar Upload with automatic WebP conversion */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
                <div className="relative shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-xs flex items-center justify-center bg-slate-900">
                  {userLoading || avatarConverting ? (
                    <div className="flex items-center justify-center w-full h-full bg-slate-900">
                      <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                    </div>
                  ) : (avatarPreview || avatarUrl) ? (
                    <NextImage
                      src={avatarPreview || avatarUrl}
                      alt="Admin Avatar"
                      width={64}
                      height={64}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-emerald-400 to-teal-500 text-slate-950 font-black text-xl flex items-center justify-center shadow-xs">
                      {fullName.charAt(0).toUpperCase() || "IT"}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900">Administrator Avatar</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Upload any photo (JPG, PNG). The system automatically compresses &amp; converts it to optimized <strong>.webp</strong>.
                  </p>
                  <div className="flex items-center gap-2.5 pt-0.5">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={avatarConverting}
                      onClick={() => fileInputRef.current?.click()}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                        avatarConverting
                          ? "bg-emerald-50 border-emerald-300 text-emerald-700 cursor-wait"
                          : "bg-white border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-700"
                      }`}
                    >
                      {avatarConverting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                          <span>Converting...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5" />
                          <span>Choose Photo</span>
                        </>
                      )}
                    </button>

                    {avatarConverting && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 animate-pulse">
                        Converting to .webp...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                  Administrator Display Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Pramod Siriwardhana"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium outline-none focus:bg-white focus:border-emerald-600"
                />
              </div>

              {/* Email (Readonly) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                  Staff Email Address (Primary Identity)
                </label>
                <input
                  type="email"
                  disabled
                  value={email}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium outline-none cursor-not-allowed font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileLoading || avatarConverting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {profileLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{uploadStatus || "Saving Profile..."}</span>
                    </>
                  ) : (
                    <span>Save Profile Changes</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: CHANGE PASSWORD */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordSubmit} autoComplete="off" className="space-y-4">
              {passwordMsg && (
                <div
                  className={`p-3 rounded-2xl text-xs font-medium flex items-start gap-2.5 ${passwordMsg.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                    }`}
                >
                  {passwordMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{passwordMsg.text}</span>
                </div>
              )}

              {/* Current Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter existing password"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium outline-none focus:bg-white focus:border-emerald-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium outline-none focus:bg-white focus:border-emerald-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {newPassword.length > 0 && (
                  <div className="pt-1.5 space-y-1">
                    <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${strengthScore <= 2
                          ? "w-1/3 bg-rose-500"
                          : strengthScore <= 4
                            ? "w-2/3 bg-amber-500"
                            : "w-full bg-emerald-500"
                          }`}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                      <span>
                        Strength:{" "}
                        <strong
                          className={
                            strengthScore <= 2
                              ? "text-rose-600"
                              : strengthScore <= 4
                                ? "text-amber-600"
                                : "text-emerald-600"
                          }
                        >
                          {strengthScore <= 2 ? "Weak" : strengthScore <= 4 ? "Medium" : "Strong"}
                        </strong>
                      </span>
                      <span>8+ chars, upper, lower, number, symbol</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium outline-none focus:bg-white focus:border-emerald-600 font-mono"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Update Password</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: TWO-FACTOR AUTHENTICATION (2FA) */}
          {activeTab === "2fa" && (
            <div className="space-y-5">
              {twoFactorMsg && (
                <div
                  className={`p-3 rounded-2xl text-xs font-medium flex items-start gap-2.5 ${twoFactorMsg.type === "success"
                    ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                    }`}
                >
                  {twoFactorMsg.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <span>{twoFactorMsg.text}</span>
                </div>
              )}

              {/* Current Status Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${is2FAEnabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                      }`}
                  >
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">
                      Google Authenticator / TOTP
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      {is2FAEnabled
                        ? "Protected with 6-digit Time-based One-Time Passwords"
                        : "Two-factor authentication is currently disabled"}
                    </p>
                  </div>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${is2FAEnabled
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-slate-200 text-slate-700"
                    }`}
                >
                  {is2FAEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>

              {/* IF 2FA IS NOT ENABLED */}
              {!is2FAEnabled && !secret && (
                <div className="space-y-4 pt-1 text-center">
                  <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
                    Enhance your administrator account security with Google Authenticator or Microsoft Authenticator. Each login will require your password plus a live 6-digit verification code.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerate2FA}
                    disabled={qrLoading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {qrLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Secret...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4" />
                        <span>Set Up Two-Factor Authentication</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* IF SECRET IS GENERATED BUT NOT YET VERIFIED */}
              {!is2FAEnabled && secret && (
                <div className="space-y-4 pt-1">
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                    <p className="text-xs font-bold text-emerald-900">
                      Step 1: Scan QR Code or Copy Secret Key
                    </p>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Open Google Authenticator on your mobile device, tap <strong className="font-bold">+</strong>, and scan the QR code below or enter the setup key manually:
                    </p>

                    {/* QR Code Preview */}
                    <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-emerald-100 max-w-xs mx-auto">
                      {qrCodeDataUrl ? (
                        <NextImage
                          src={qrCodeDataUrl}
                          alt="2FA QR Code"
                          width={160}
                          height={160}
                          unoptimized
                          className="w-40 h-40"
                        />
                      ) : (
                        <div className="w-40 h-40 bg-slate-100 rounded-lg flex flex-col items-center justify-center text-center p-2 text-slate-400">
                          <Smartphone className="w-8 h-8 mb-1 text-slate-500" />
                          <span className="text-[10px] font-mono text-slate-600 break-all">{secret}</span>
                        </div>
                      )}
                    </div>

                    {/* Manual Secret Key */}
                    <div className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-emerald-200">
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-500 uppercase block">Manual Setup Key</span>
                        <code className="text-xs font-mono font-bold text-slate-900 tracking-wider truncate block">
                          {secret}
                        </code>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopySecret}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Step 2: Verification Form */}
                  <form onSubmit={handleVerify2FA} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 block">
                        Step 2: Enter 6-Digit App Code
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={totpCode}
                        onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ""))}
                        placeholder="123456"
                        className="w-full text-center text-lg tracking-widest font-mono font-bold px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 outline-none focus:bg-white focus:border-emerald-600"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          setSecret(null);
                          setQrCodeDataUrl(null);
                        }}
                        className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={twoFactorLoading || totpCode.length !== 6}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {twoFactorLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <span>Verify &amp; Activate 2FA</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* IF 2FA IS ALREADY ENABLED */}
              {is2FAEnabled && (
                <div className="space-y-4 pt-1">
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
                    <p className="text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Two-Factor Protection is Active
                    </p>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Your administrator account requires a 6-digit TOTP code generated by your authenticator app during every login session.
                    </p>
                  </div>

                  {!showDisableForm ? (
                    <button
                      type="button"
                      onClick={() => setShowDisableForm(true)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer flex items-center gap-1.5"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>Disable Two-Factor Authentication</span>
                    </button>
                  ) : (
                    <form onSubmit={handleDisable2FA} className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
                      <p className="text-xs font-bold text-rose-900">
                        Confirm Disabling 2FA
                      </p>
                      <p className="text-[11px] text-rose-800">
                        Enter your current administrator password to confirm turning off two-factor authentication:
                      </p>
                      <input
                        type="password"
                        required
                        value={disablePassword}
                        onChange={(e) => setDisablePassword(e.target.value)}
                        placeholder="Current password"
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-xs text-slate-900 outline-none focus:border-rose-500 font-mono"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowDisableForm(false)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={twoFactorLoading || !disablePassword}
                          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer disabled:opacity-50"
                        >
                          {twoFactorLoading ? "Disabling..." : "Confirm Disable"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
