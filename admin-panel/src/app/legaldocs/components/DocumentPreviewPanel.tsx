"use client";

import React from "react";
import { FileText } from "lucide-react";
import {
  LegalDocument,
  LegalSection,
  SubItem,
  resolveLocalized,
} from "../types/legal.types";
import { LegalIcon } from "./LegalIcon";

// ─────────────────────────────────────────────────────────────────────────────
// DocumentPreviewPanel – read-only preview of how the legal document
// would look on the actual website in the selected language.
// ─────────────────────────────────────────────────────────────────────────────

const ACCENT_CLASSES: Record<string, { badge: string; border: string; dot: string }> = {
  emerald: {
    badge:  "bg-emerald-50 text-emerald-700 border-emerald-200",
    border: "border-l-emerald-400",
    dot:    "bg-emerald-400",
  },
  indigo: {
    badge:  "bg-indigo-50 text-indigo-700 border-indigo-200",
    border: "border-l-indigo-400",
    dot:    "bg-indigo-400",
  },
  blue: {
    badge:  "bg-blue-50 text-blue-700 border-blue-200",
    border: "border-l-blue-400",
    dot:    "bg-blue-400",
  },
  amber: {
    badge:  "bg-amber-50 text-amber-700 border-amber-200",
    border: "border-l-amber-400",
    dot:    "bg-amber-400",
  },
  rose: {
    badge:  "bg-rose-50 text-rose-700 border-rose-200",
    border: "border-l-rose-400",
    dot:    "bg-rose-400",
  },
  violet: {
    badge:  "bg-violet-50 text-violet-700 border-violet-200",
    border: "border-l-violet-400",
    dot:    "bg-violet-400",
  },
  sky: {
    badge:  "bg-sky-50 text-sky-700 border-sky-200",
    border: "border-l-sky-400",
    dot:    "bg-sky-400",
  },
  orange: {
    badge:  "bg-orange-50 text-orange-700 border-orange-200",
    border: "border-l-orange-400",
    dot:    "bg-orange-400",
  },
};

function getAccent(accent?: string) {
  return ACCENT_CLASSES[accent ?? "indigo"] ?? ACCENT_CLASSES.indigo;
}

// ── Individual Section Preview ───────────────────────────────────────────────

function SectionPreview({
  section,
  accent,
  locale,
}: {
  section: LegalSection;
  accent?: string;
  locale: string;
}) {
  const ac = getAccent(accent);
  const heading = resolveLocalized(section.heading, locale, "Untitled Section");
  const content = resolveLocalized(section.content, locale);

  return (
    <div className={`border-l-2 pl-4 ${ac.border}`}>
      <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
        {section.sectionIcon && (
          <LegalIcon name={section.sectionIcon} className="w-4 h-4 text-slate-600 shrink-0" />
        )}
        {heading}
      </h3>

      {section.type === "paragraph" && (
        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{content}</p>
      )}

      {section.type === "checklist" && (
        <ul className="space-y-1.5">
          {(section.subItems ?? []).map((item: SubItem) => (
            <li key={item.id} className="flex items-start gap-2 text-xs text-slate-600">
              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${ac.dot}`} />
              {resolveLocalized(item.body, locale)}
            </li>
          ))}
        </ul>
      )}

      {section.type === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {(section.subItems ?? []).map((item: SubItem) => {
            const title = resolveLocalized(item.title, locale);
            return (
              <div
                key={item.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {title && (
                  <p className="text-[10px] font-bold text-slate-700 uppercase tracking-wide mb-1">
                    {title}
                  </p>
                )}
                <p className="text-xs text-slate-500 leading-relaxed">
                  {resolveLocalized(item.body, locale)}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {section.type === "icon-list" && (
        <div className="space-y-2">
          {(section.subItems ?? []).map((item: SubItem) => {
            const title = resolveLocalized(item.title, locale);
            return (
              <div key={item.id} className="flex items-start gap-2.5">
                {item.icon && (
                  <LegalIcon name={item.icon} className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                )}
                <div>
                  {title && (
                    <p className="text-xs font-semibold text-slate-800">{title}</p>
                  )}
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {resolveLocalized(item.body, locale)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {section.type === "row-list" && (
        <div className="space-y-2">
          {(section.subItems ?? []).map((item: SubItem, idx: number) => {
            const title = resolveLocalized(item.title, locale);
            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2.5 bg-slate-50 border border-slate-100 rounded-lg"
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase pt-0.5 shrink-0 w-5 text-right">
                  {idx + 1}
                </span>
                <div>
                  {title && (
                    <p className="text-xs font-bold text-slate-800">{title}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    {resolveLocalized(item.body, locale)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {section.type === "contact" && (
        <div className="space-y-2">
          {(section.subItems ?? []).map((item: SubItem) => {
            const title = resolveLocalized(item.title, locale);
            return (
              <div key={item.id} className="flex items-center gap-2.5 text-xs text-slate-700">
                {item.icon && (
                  <LegalIcon name={item.icon} className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                )}
                {title && (
                  <span className="font-semibold text-slate-900">{title}:</span>
                )}
                <span className="text-slate-600">{resolveLocalized(item.body, locale)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Main Preview Panel ───────────────────────────────────────────────────────

interface Props {
  doc: LegalDocument;
  locale: string;
}

export default function DocumentPreviewPanel({ doc, locale }: Props) {
  const ac = getAccent(doc.accent);
  const title = resolveLocalized(doc.title, locale, "Untitled Document");
  const eyebrow = resolveLocalized(doc.eyebrow, locale);

  if (doc.sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
        <FileText className="w-10 h-10 mb-3 text-slate-300" />
        <p className="text-sm font-semibold">No sections yet</p>
        <p className="text-xs mt-1">Add sections in the Editor tab to preview them here.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Doc Header */}
      <div className="space-y-1 pb-4 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {eyebrow && (
            <span
              className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${ac.badge}`}
            >
              {eyebrow}
            </span>
          )}
          <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500">
            Preview: {locale.toUpperCase()}
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
        <p className="text-xs text-slate-400">
          Last updated: <span className="font-medium text-slate-600">{doc.lastUpdated}</span>
        </p>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {doc.sections.map((section: LegalSection) => (
          <SectionPreview
            key={section.id}
            section={section}
            accent={doc.accent}
            locale={locale}
          />
        ))}
      </div>
    </div>
  );
}
