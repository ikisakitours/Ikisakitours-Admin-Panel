"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Save,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import type { ContactInquiry } from "../types/contact.types";
import { contactService } from "@/services/contact.service";
import {
  CONTACT_STATUS_CONFIG,
  formatContactFullDateTime,
  getDisplayContactReference,
} from "../utils/contactFormatters";

interface ContactDetailsModalProps {
  inquiry: ContactInquiry | null;
  onClose: () => void;
  onUpdated: (updated: ContactInquiry) => void;
  onNotify: (message: string, variant: "success" | "error" | "info") => void;
}

export function ContactDetailsModal({
  inquiry,
  onClose,
  onUpdated,
  onNotify,
}: ContactDetailsModalProps) {
  const [detail, setDetail] = useState<ContactInquiry | null>(inquiry);
  const [status, setStatus] = useState<string>(inquiry?.status || "pending");
  const [saving, setSaving] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);

  // Background scroll lock
  useEffect(() => {
    if (!inquiry) return;

    const lockedScrollY = window.scrollY;
    const lockedScrollX = window.scrollX;

    const lockWindowScroll = () => {
      if (window.scrollY !== lockedScrollY || window.scrollX !== lockedScrollX) {
        window.scrollTo(lockedScrollX, lockedScrollY);
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const container = modalScrollRef.current;
      const target = e.target as Node | null;
      if (!container || !target || !container.contains(target)) {
        e.preventDefault();
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = container;
      const canScroll = scrollHeight > clientHeight + 1;
      if (!canScroll) {
        e.preventDefault();
        return;
      }

      const scrollingUp = e.deltaY < 0;
      const scrollingDown = e.deltaY > 0;
      if ((scrollingUp && scrollTop <= 0) || (scrollingDown && scrollTop + clientHeight >= scrollHeight - 1)) {
        e.preventDefault();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      const container = modalScrollRef.current;
      const target = e.target as Node | null;
      if (!container || !target || !container.contains(target)) {
        e.preventDefault();
      }
    };

    window.addEventListener("scroll", lockWindowScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("scroll", lockWindowScroll);
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [inquiry]);

  useEffect(() => {
    if (inquiry) {
      queueMicrotask(() => {
        setDetail(inquiry);
        setStatus(inquiry.status);
      });
    }
  }, [inquiry]);

  // Escape key close
  useEffect(() => {
    if (!inquiry) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inquiry, onClose]);

  if (!inquiry || !detail) return null;

  const refCode = getDisplayContactReference(detail);
  const statusKey = (status || "pending").toLowerCase();
  const statusCfg = CONTACT_STATUS_CONFIG[statusKey] || CONTACT_STATUS_CONFIG.pending;

  const handleCopyRef = async () => {
    try {
      await navigator.clipboard.writeText(refCode);
      setCopiedRef(true);
      onNotify(`Copied reference ${refCode}`, "info");
      setTimeout(() => setCopiedRef(false), 1800);
    } catch {
      // ignore
    }
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(detail.message || "");
      setCopiedMessage(true);
      onNotify("Copied message text to clipboard", "info");
      setTimeout(() => setCopiedMessage(false), 1800);
    } catch {
      // ignore
    }
  };

  const handleSaveStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await contactService.updateContactStatus(detail.id, status);
      const updated = { ...detail, status };
      setDetail(updated);
      onUpdated(updated);
      onNotify(`Inquiry ${refCode} updated to ${status.toUpperCase()}`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      onNotify(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150"
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Inquiry details for ${refCode}`}
        className="relative z-10 flex max-h-[95vh] w-[96vw] max-w-5xl flex-col bg-slate-50 rounded-3xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="bg-slate-950 text-white px-6 sm:px-7 py-5 border-b border-slate-800 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-lg bg-emerald-500/15 border border-emerald-400/35 px-2.5 py-1 font-mono text-xs font-extrabold tracking-wider text-emerald-300">
                {refCode}
              </span>
              <button
                type="button"
                onClick={handleCopyRef}
                className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-white/15 transition-colors cursor-pointer"
              >
                {copiedRef ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy
                  </>
                )}
              </button>
              <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border bg-indigo-500/15 text-indigo-200 border-indigo-400/30">
                <MessageSquare className="w-3 h-3" />
                <span>{detail.inquiryType || "General Inquiry"}</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-extrabold ${statusCfg.pillClass}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${statusCfg.dotClass}`} />
                {statusCfg.label}
              </span>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:bg-emerald-500 hover:border-emerald-500 hover:text-slate-950 transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          <h2 className="mt-3 text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
            {detail.subject || `Inquiry from ${detail.fullName}`}
          </h2>

          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-300">
            <span className="inline-flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-slate-400">Sender:</span>
              <strong className="text-white">{detail.fullName}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Received:</span>
              <span className="text-slate-200 font-medium">
                {formatContactFullDateTime(detail.createdAt)}
              </span>
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div
          ref={modalScrollRef}
          className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-4"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left Column (7 cols): Sender + Tour Interest + Full Message */}
            <div className="lg:col-span-7 space-y-4">
              {/* Sender & Tour Interest Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Sender Card */}
                <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-600" /> Sender Contact
                    </h3>
                    <a
                      href={`mailto:${detail.email}?subject=${encodeURIComponent(
                        `Ikisaki Tours: Re: ${detail.subject || "Your Inquiry"} (${refCode})`
                      )}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      <Mail className="w-3 h-3" /> Reply
                    </a>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="font-extrabold text-slate-900 text-sm">{detail.fullName}</p>
                    <p className="text-[11px] text-slate-600 truncate" title={detail.email}>
                      {detail.email}
                    </p>
                    <div className="pt-1">
                      <a
                        href={`tel:${detail.phone}`}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                      >
                        <Phone className="w-3 h-3" /> {detail.phone || "—"}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Inquiry Type & Tour Interest Card */}
                <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <Compass className="w-3.5 h-3.5 text-purple-600" /> Inquiry Classification
                  </h3>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="inline-block rounded-md px-2.5 py-1 text-[11px] font-bold border bg-indigo-50 text-indigo-700 border-indigo-200">
                        {detail.inquiryType || "General Inquiry"}
                      </span>
                    </div>
                    {detail.tourInterest && (
                      <div className="pt-1.5 border-t border-slate-100">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-0.5">
                          Tour Package Interest
                        </span>
                        <p className="text-xs text-purple-700 font-bold">
                          {detail.tourInterest}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Full Message Box */}
              <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Full Message Content
                  </h3>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-emerald-700 cursor-pointer"
                  >
                    {copiedMessage ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-500" /> Copied Text
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" /> Copy Message
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                  {detail.message}
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Operations Controls & Fast Reply Launcher */}
            <div className="lg:col-span-5 space-y-4">
              {/* Status Update Form */}
              <form
                onSubmit={handleSaveStatus}
                className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3.5"
              >
                <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    Follow-Up Status
                  </h3>
                  <span className="text-[10px] text-slate-400">Live operational sync</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Review Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="contacted">Contacted / Responded</option>
                    <option value="completed">Resolved / Closed</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Save Status</span>
                  </button>
                </div>
              </form>

              {/* Fast Email Launcher */}
              <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
                <div className="border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-emerald-600" />
                    Fast Email Reply
                  </h3>
                </div>

                <p className="text-xs text-slate-600">
                  Open your default mail client with a pre-filled reply addressing {detail.fullName} regarding this inquiry.
                </p>

                <a
                  href={`mailto:${detail.email}?subject=${encodeURIComponent(
                    `Ikisaki Tours: Re: ${detail.subject || "Your Inquiry"} (${refCode})`
                  )}&body=${encodeURIComponent(
                    `Dear ${detail.fullName},\n\nThank you for reaching out to Ikisaki Tours.\n\nRegarding your inquiry regarding "${detail.subject || "Travel with us"}":\n\n\n\nBest regards,\nIkisaki Tours Customer Operations\nwww.ikisakitours.com`
                  )}`}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 text-xs font-bold transition-colors shadow-xs"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Launch Email Client</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
