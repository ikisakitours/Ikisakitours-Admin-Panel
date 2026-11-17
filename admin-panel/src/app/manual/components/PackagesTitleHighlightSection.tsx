"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CheckCircle2,
  FileJson,
  Globe,
  Package,
  Sparkles,
  XCircle,
} from "lucide-react";
import { SectionCard } from "./SectionCard";

export function PackagesTitleHighlightSection() {
  return (
    <SectionCard
      id="packages"
      number="04"
      title="Tour Packages — Multilingual Workflow, JSON Import & Title Highlighting"
      subtitle="Master EN/JA switching, 1-click JSON bulk prefill, Gold Title Highlighting, URL slugs, and safe live editing."
      icon="packagePlus"
      actionHref="/addpackage"
      actionLabel="Add Tour Package"
    >
      <div className="space-y-5">
        {/* Multilingual + JSON */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" /> Multilingual Switcher (EN / JA / +)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Always complete <strong>English (EN)</strong> first (required validation), then switch to the{" "}
              <strong>JA</strong> tab to enter Japanese translations for every localized field. Click{" "}
              <strong>+</strong> to add any additional 2-letter ISO language code (e.g. <code>fr</code>,{" "}
              <code>de</code>, <code>zh</code>).
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-emerald-600" /> Fast JSON Bulk Uploader
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Use the <strong>JSON Uploader</strong> at the top of <code>/addpackage</code> to prefill EN/JA text,
              badges, pricing tiers, add-ons, and itineraries instantly. After uploading JSON, attach your{" "}
              <strong>Gallery Images</strong> manually and click Save Package.
            </p>
          </div>
        </div>

        {/* Critical Title 1 vs Title 2 Gold Highlight Rule */}
        <div className="rounded-2xl border border-amber-300/80 bg-amber-50/70 p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-900">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider">
              Critical Rule: Package Title vs. Highlighted Words (Gold Text) &amp; URL Slug
            </h4>
          </div>
          <p className="text-xs text-amber-950/85 leading-relaxed">
            The website finds <strong>Highlighted Words in Title (Title 2)</strong> inside{" "}
            <strong>Package Title (Title 1)</strong> character-for-character and styles it in luxury{" "}
            <strong>Gold Italic</strong>. Meanwhile, the <strong>URL Slug</strong> auto-generates strictly from{" "}
            <strong>Package Title (EN)</strong> only — editing Title 2 will never alter the slug.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl bg-white border border-emerald-200 p-3.5 space-y-1.5">
              <p className="text-[11px] font-extrabold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> CORRECT (Highlights in Gold!)
              </p>
              <div className="text-[11px] text-slate-700 space-y-1">
                <p>
                  <strong>EN Title:</strong> The{" "}
                  <span className="text-amber-600 font-bold italic">Ultimate Sri Lanka</span> Grand Explorer
                </p>
                <p>
                  <strong>EN Highlight:</strong> <code>Ultimate Sri Lanka</code>
                </p>
                <p className="text-[10px] text-slate-500">
                  Auto Slug: <code>the-ultimate-sri-lanka-grand-explorer</code>
                </p>
                <hr className="my-1.5 border-slate-100" />
                <p>
                  <strong>JA Title:</strong>{" "}
                  <span className="text-amber-600 font-bold italic">究極のスリランカ</span>
                  ・グランドエクスプローラー
                </p>
                <p>
                  <strong>JA Highlight:</strong>
                  {" "}
                  <code>究極のスリランカ</code>
                  {" (Exact same Kanji!)"}
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-white border border-rose-200 p-3.5 space-y-1.5">
              <p className="text-[11px] font-extrabold text-rose-700 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" /> INCORRECT (Will NOT Highlight!)
              </p>
              <div className="text-[11px] text-slate-700 space-y-1">
                <p>
                  <strong>JA Title:</strong> 究極のスリランカ・グランドエクスプローラー
                </p>
                <p>
                  <strong>JA Highlight:</strong> <code>アルティメット・スリランカ</code>
                </p>
                <p className="text-[10px] text-rose-600 pt-1 leading-relaxed">
                  {"Why it fails: "}
                  <code>究極</code>
                  {" (Kanji) and "}
                  <code>アルティメット</code>
                  {' (Katakana) are completely different characters even though both mean "Ultimate". Always copy the exact substring directly from Title 1!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Badges + Manage Packages */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" /> Editing Live Packages Safely (`/managepackages`)
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              Click <strong>Edit</strong> on any package to update text, any of the 18 conversion badges, pricing tiers,
              add-ons, or itineraries via text-only <code>PATCH</code> — existing gallery photos remain intact.
            </p>
          </div>
          <Link
            href="/managepackages"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-colors"
          >
            Manage Packages <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </SectionCard>
  );
}
