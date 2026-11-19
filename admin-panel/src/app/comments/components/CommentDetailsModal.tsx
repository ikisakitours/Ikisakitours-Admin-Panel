"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Globe,
  ImageIcon,
  Loader2,
  MessageSquare,
  PackageCheck,
  Send,
  Sparkles,
  Star,
  User,
  X,
} from "lucide-react";
import type { FeedbackItem } from "../types/comment.types";
import { CommentsService } from "@/services/comments.service";
import { PackageReviewsService } from "@/services/package-reviews.service";
import {
  formatCommentFullDateTime,
  getDisplayCommentReference,
} from "../utils/commentFormatters";

interface CommentDetailsModalProps {
  item: FeedbackItem | null;
  onClose: () => void;
  onUpdated: (updated: FeedbackItem) => void;
  onNotify: (message: string, variant: "success" | "error" | "info") => void;
}

interface ReplyTemplate {
  id: string;
  title: string;
  badge: string;
  shortLabel: string;
  text: string;
}

const INDUSTRY_REPLY_TEMPLATES: ReplyTemplate[] = [
  {
    id: "5star-appreciation",
    title: "5-Star Trip Appreciation",
    badge: "5 Stars",
    shortLabel: "⭐ 5-Star Tour",
    text: "Thank you so much for your wonderful review! We are delighted to hear that your journey through Sri Lanka with Ikisaki Tours was unforgettable. Knowing you enjoyed every moment means the world to our team. It was a true pleasure hosting you, and we look forward to welcoming you back soon!",
  },
  {
    id: "chauffeur-excellence",
    title: "Chauffeur & Safe Driving Commendation",
    badge: "Chauffeur",
    shortLabel: "🚗 Driver & Chauffeur",
    text: "Thank you for taking the time to share your review! Our chauffeurs take immense pride in ensuring safe, punctual, and comfortable journeys across the island. We will personally pass your warm compliments to your driver. Safe travels wherever you venture next!",
  },
  {
    id: "guide-heritage",
    title: "Licensed Guide & Heritage Hospitality",
    badge: "Guide",
    shortLabel: "🏛️ Tour Guide",
    text: "Thank you for your fantastic feedback! Our licensed tour guides are deeply passionate about sharing Sri Lanka's vibrant history, hidden gems, and living culture. We are thrilled that their hospitality enriched your holiday. Warm regards from the Ikisaki Tours family!",
  },
  {
    id: "scenic-wildlife",
    title: "Scenic Route, Wildlife & Boutique Hotels",
    badge: "Itinerary",
    shortLabel: "🌿 Nature & Hotels",
    text: "Thank you for traveling with Ikisaki Tours! We are thrilled that the itinerary highlights, boutique hotel selections, and scenic wildlife safaris met your expectations. Curating immersive island adventures is our passion, and we hope to craft your next escape soon!",
  },
  {
    id: "repeat-traveler",
    title: "Returning Guest & Continued Hospitality",
    badge: "Loyalty",
    shortLabel: "🤝 Returning Guest",
    text: "It was an absolute pleasure hosting you once again! Welcoming repeat travelers to Sri Lanka is our greatest joy. Thank you for your continued trust in Ikisaki Tours, and we cannot wait to craft your next unforgettable island escape!",
  },
  {
    id: "constructive-improvement",
    title: "Constructive Service Recovery & Care",
    badge: "Quality Care",
    shortLabel: "💬 Service Care",
    text: "Thank you for your candid feedback and for traveling with Ikisaki Tours. We hold our guest journeys to the highest standards, and your insights have already been shared with our operations team to ensure continuous improvement. We would love the opportunity to welcome you back for a flawless experience.",
  },
  {
    id: "warm-concise",
    title: "Warm, Short & Professional Gratitude",
    badge: "Concise",
    shortLabel: "✨ Short & Warm",
    text: "Thank you so much for your kind words! We are thrilled you had a memorable journey with Ikisaki Tours. Wishing you wonderful future travels and hope to see you in Sri Lanka again soon!",
  },
  {
    id: "japanese-omotenashi",
    title: "Japanese Hospitality (おもてなし返信)",
    badge: "日本語",
    shortLabel: "🇯🇵 日本語 (Japanese)",
    text: "この度はイキサキツアーズをご利用いただき、また心温まるレビューをお寄せいただき誠にありがとうございます。スリランカでのご滞在が素晴らしい思い出となりましたことを、スタッフ一同心より嬉しく思っております。またのお越しを心よりお待ち申し上げております。(Thank you for traveling with Ikisaki Tours. We look forward to welcoming you back!)",
  },
];

export function CommentDetailsModal({
  item,
  onClose,
  onUpdated,
  onNotify,
}: CommentDetailsModalProps) {
  const [detail, setDetail] = useState<FeedbackItem | null>(item);
  const [replyText, setReplyText] = useState<string>(item?.adminReply || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [togglingVisibility, setTogglingVisibility] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const modalScrollRef = useRef<HTMLDivElement | null>(null);

  // Background scroll lock
  useEffect(() => {
    if (!item) return;

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
  }, [item]);

  useEffect(() => {
    if (item) {
      queueMicrotask(() => {
        setDetail(item);
        setReplyText(item.adminReply || "");
        setSelectedTemplateId(null);
      });
    }
  }, [item]);

  // Escape key close
  useEffect(() => {
    if (!item) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (zoomedImage) setZoomedImage(null);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [item, zoomedImage, onClose]);

  if (!item || !detail) return null;

  const refCode = getDisplayCommentReference(detail);
  const isPackageReview = detail.itemType === "package-review";

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

  const handleToggleVisibility = async () => {
    const nextVal = !detail.isPubliclyVisible;
    try {
      setTogglingVisibility(true);
      if (isPackageReview) {
        await PackageReviewsService.updateVisibility(detail.id, { isPubliclyVisible: nextVal });
      } else {
        await CommentsService.toggleVisibility(detail.id, { isPubliclyVisible: nextVal });
      }
      const updated = { ...detail, isPubliclyVisible: nextVal };
      setDetail(updated);
      onUpdated(updated);
      onNotify(`Visibility updated to ${nextVal ? "PUBLIC" : "HIDDEN"}`, "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to toggle visibility";
      onNotify(msg, "error");
    } finally {
      setTogglingVisibility(false);
    }
  };

  const handleApplyTemplate = (tpl: ReplyTemplate) => {
    setReplyText(tpl.text);
    setSelectedTemplateId(tpl.id);
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !isPackageReview) return;

    try {
      setSubmittingReply(true);
      await PackageReviewsService.reply(detail.id, { adminReply: replyText.trim() });
      const updated = { ...detail, adminReply: replyText.trim() };
      setDetail(updated);
      onUpdated(updated);
      onNotify("Official staff reply saved and published successfully!", "success");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to post reply";
      onNotify(msg, "error");
    } finally {
      setSubmittingReply(false);
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
        aria-label={`Review details for ${refCode}`}
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
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border ${
                  isPackageReview
                    ? "bg-purple-500/15 text-purple-200 border-purple-400/30"
                    : "bg-indigo-500/15 text-indigo-200 border-indigo-400/30"
                }`}
              >
                {isPackageReview ? <PackageCheck className="w-3 h-3" /> : <MessageSquare className="w-3 h-3" />}
                <span>{isPackageReview ? "Tour Package Review" : "Website Feedback"}</span>
              </span>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-extrabold ${
                  detail.isPubliclyVisible
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                    : "bg-slate-800 text-slate-300 border-slate-700"
                }`}
              >
                <Globe className="w-3 h-3" />
                {detail.isPubliclyVisible ? "Public on Website" : "Hidden"}
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
            {detail.authorName} {detail.source ? `— ${detail.source}` : "— General Feedback"}
          </h2>

          <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-300">
            {typeof detail.rating === "number" && detail.rating > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-400" />
                <span>{detail.rating}.0 / 5.0 Rating</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Submitted:</span>
              <span className="text-slate-200 font-medium">
                {formatCommentFullDateTime(detail.createdAt)}
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
            {/* Left Column (7 cols): Guest Info + Full Review + Attached Photos */}
            <div className="lg:col-span-7 space-y-4">
              {/* Author & Tour Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Author Card */}
                <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <User className="w-3.5 h-3.5 text-emerald-600" /> Guest Details
                  </h3>
                  <div className="space-y-1 text-xs">
                    <p className="font-extrabold text-slate-900 text-sm">{detail.authorName}</p>
                    {detail.email && (
                      <p className="text-[11px] text-slate-600 truncate">{detail.email}</p>
                    )}
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                      {detail.country && <span>Country: {detail.country}</span>}
                      {detail.isVerified && (
                        <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 text-[9px] font-extrabold uppercase">
                          Verified Guest
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tour Info Card */}
                <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <PackageCheck className="w-3.5 h-3.5 text-purple-600" /> Review Context
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    <p className="font-extrabold text-slate-900">{detail.source || "Website Feedback"}</p>
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold border ${
                        isPackageReview
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-indigo-50 text-indigo-700 border-indigo-200"
                      }`}
                    >
                      {isPackageReview ? "Tour Package Experience" : "Website Testimonial"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Review Text */}
              <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                    Guest Feedback
                  </h3>
                  {typeof detail.rating === "number" && detail.rating > 0 && (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < (detail.rating || 0)
                              ? "fill-amber-400 text-amber-500"
                              : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 text-xs text-slate-800 leading-relaxed italic whitespace-pre-wrap">
                  &quot;{detail.content}&quot;
                </div>
              </div>

              {/* Attached Photos Gallery */}
              {detail.imageUrls && detail.imageUrls.length > 0 && (
                <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-2.5">
                  <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                    Attached Guest Photos ({detail.imageUrls.length})
                  </h3>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {detail.imageUrls.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setZoomedImage(url)}
                        className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer hover:border-emerald-400 transition-colors"
                      >
                        <Image
                          src={url}
                          alt={`Guest upload ${idx + 1}`}
                          fill
                          sizes="(max-width: 640px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                          Zoom
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column (5 cols): Visibility Toggle + Staff Reply Editor (Only for Package Reviews) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Visibility Controls */}
              <div className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    Public Visibility
                  </h3>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                      detail.isPubliclyVisible
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                  >
                    {detail.isPubliclyVisible ? "Public" : "Hidden"}
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  {isPackageReview
                    ? "Control whether this tour review and star rating appear on the package details page."
                    : "Control whether this feedback is displayed on the public website testimonials section."}
                </p>

                <button
                  type="button"
                  disabled={togglingVisibility}
                  onClick={handleToggleVisibility}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 border ${
                    detail.isPubliclyVisible
                      ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                      : "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {togglingVisibility && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{detail.isPubliclyVisible ? "Hide From Public Site" : "Publish to Website"}</span>
                </button>
              </div>

              {/* Staff Reply Form — ONLY FOR PACKAGE REVIEWS */}
              {isPackageReview ? (
                <form
                  onSubmit={handleSubmitReply}
                  className="rounded-2xl bg-white border border-slate-200 p-4 space-y-3.5"
                >
                  <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      Official Staff Reply
                    </h3>
                    {detail.adminReply && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" /> Published
                      </span>
                    )}
                  </div>

                  {/* Fast 1-Click Industry Standard Reply Templates (No Internal Scrolling) */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        Quick Hospitality Templates
                      </span>
                      {selectedTemplateId && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTemplateId(null);
                            setReplyText("");
                          }}
                          className="text-[10px] text-rose-600 hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {/* Quick Dropdown Picker */}
                    <select
                      value={selectedTemplateId || ""}
                      onChange={(e) => {
                        const tpl = INDUSTRY_REPLY_TEMPLATES.find((t) => t.id === e.target.value);
                        if (tpl) handleApplyTemplate(tpl);
                      }}
                      className="w-full text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-800 outline-none focus:border-emerald-500 focus:bg-white cursor-pointer"
                    >
                      <option value="" disabled>⚡ Choose standard reply template...</option>
                      {INDUSTRY_REPLY_TEMPLATES.map((tpl) => (
                        <option key={tpl.id} value={tpl.id}>
                          [{tpl.badge}] {tpl.title}
                        </option>
                      ))}
                    </select>

                    {/* Fast 1-Click Pill Buttons */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {INDUSTRY_REPLY_TEMPLATES.map((tpl) => {
                        const isSelected = selectedTemplateId === tpl.id;
                        return (
                          <button
                            key={tpl.id}
                            type="button"
                            onClick={() => handleApplyTemplate(tpl)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300"
                            }`}
                          >
                            {tpl.shortLabel}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reply Textarea */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                      <span>Official Response</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {replyText.length} characters
                      </span>
                    </label>
                    <textarea
                      rows={5}
                      value={replyText}
                      onChange={(e) => {
                        setReplyText(e.target.value);
                        setSelectedTemplateId(null);
                      }}
                      placeholder="Write or customize an official reply from Ikisaki Tours management..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-800 outline-none focus:border-emerald-500 focus:bg-white resize-y"
                    />
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
                      disabled={submittingReply || !replyText.trim()}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer shadow-xs"
                    >
                      {submittingReply ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                      <span>{detail.adminReply ? "Update Reply" : "Post Reply"}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="rounded-2xl bg-slate-100/70 border border-slate-200 p-4 text-xs text-slate-600 space-y-1.5">
                  <p className="font-bold text-slate-700">Website Testimonial</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    General website comments do not support public replies. Use the toggle above to publish or hide this testimonial on the public website.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-[110] bg-black/85 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="relative max-w-3xl max-h-[90vh] w-full h-[80vh] flex items-center justify-center">
            <Image
              src={zoomedImage}
              alt="Zoomed guest upload"
              fill
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => setZoomedImage(null)}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/20 text-white hover:bg-white/40 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
