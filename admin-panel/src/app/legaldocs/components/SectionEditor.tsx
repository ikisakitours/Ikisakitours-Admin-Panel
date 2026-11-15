"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Trash2,
  Plus,
  GripVertical,
  X,
} from "lucide-react";
import {
  LegalSection,
  SubItem,
  SectionType,
  resolveLocalized,
} from "../types/legal.types";
import { LegalIcon, LEGAL_ICON_OPTIONS, LEGAL_ICON_GROUPS } from "./LegalIcon";

// ── Helpers ─────────────────────────────────────────────────────────────────

const SECTION_TYPE_OPTIONS: { value: SectionType; label: string; description: string }[] = [
  {
    value: "paragraph",
    label: "Paragraph — Plain Text / Standard Prose",
    description: "Best for standard explanatory text, intro clauses, and continuous policy paragraphs.",
  },
  {
    value: "checklist",
    label: "Checklist — Bullet Points (Conditions & Rules)",
    description: "Best for simple bulleted points with colored dots (e.g. tour rules, prerequisites, inclusions).",
  },
  {
    value: "icon-list",
    label: "Icon List — Highlight Features with Custom Icons",
    description: "Best for key points needing strong visual attention with custom icons (e.g. security measures, payment guarantees).",
  },
  {
    value: "row-list",
    label: "Row List — Numbered Steps & Procedures (01, 02, 03)",
    description: "Best for sequential steps, booking procedures, or numbered legal articles inside individual cards.",
  },
  {
    value: "grid",
    label: "Card Grid — 2-Column Side-by-Side Cards",
    description: "Best for structured comparison cards, cancellation fee tiers, or categorized clauses.",
  },
  {
    value: "contact",
    label: "Contact Details — Email, Phone & Support Channels",
    description: "Best for support channels, emergency WhatsApp/phone numbers, and official communication addresses.",
  },
];

function uid(): string {
  return `si-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// ── Sub-Item Editor ──────────────────────────────────────────────────────────

interface SubItemEditorProps {
  item: SubItem;
  index: number;
  sectionType: SectionType;
  locale: string;
  onChange: (updated: SubItem) => void;
  onDelete: () => void;
}

function SubItemEditor({
  item,
  index,
  sectionType,
  locale,
  onChange,
  onDelete,
}: SubItemEditorProps) {
  const showTitle = sectionType !== "checklist";
  const showIcon = sectionType === "icon-list" || sectionType === "contact";
  const langLabel = locale.toUpperCase();

  const titleLower = (item.title?.en || item.title?.[locale] || "").toLowerCase();
  const defaultContactIcon =
    titleLower.includes("phone") || titleLower.includes("whatsapp")
      ? "Phone"
      : titleLower.includes("web")
      ? "Globe"
      : titleLower.includes("location")
      ? "MapPin"
      : titleLower.includes("time")
      ? "Clock"
      : titleLower.includes("support") || titleLower.includes("assist")
      ? "Headset"
      : titleLower.includes("company")
      ? "Building"
      : "Mail";

  const currentIcon = item.icon || (sectionType === "contact" ? defaultContactIcon : "CheckCircle2");

  const updateLocalized = (field: "title" | "body", val: string) => {
    onChange({
      ...item,
      ...(showIcon ? { icon: currentIcon } : {}),
      [field]: {
        ...(item[field] ?? {}),
        [locale]: val,
      },
    });
  };

  return (
    <div className="flex gap-2 items-start p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 group">
      <GripVertical className="w-3.5 h-3.5 text-slate-300 mt-2.5 shrink-0 cursor-grab" />

      <div className="flex-1 grid gap-2">
        {showIcon && (
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
              Item Icon
            </label>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 bg-white text-indigo-600 shrink-0">
                <LegalIcon
                  name={currentIcon}
                  className="w-3.5 h-3.5"
                />
              </span>
              <select
                value={currentIcon}
                onChange={(e) => onChange({ ...item, icon: e.target.value })}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all cursor-pointer font-medium text-left"
              >
                {LEGAL_ICON_GROUPS.map((group) => (
                  <optgroup
                    key={group.category}
                    label={group.category}
                    className="font-bold text-indigo-700 bg-slate-100 text-left"
                    style={{
                      fontWeight: 800,
                      color: "#4338ca",
                      backgroundColor: "#f1f5f9",
                      fontStyle: "normal",
                      textAlign: "left",
                    }}
                  >
                    {group.options.map((opt) => (
                      <option
                        key={opt.value}
                        value={opt.value}
                        className="font-normal text-slate-800 bg-white text-left"
                        style={{
                          fontWeight: 400,
                          color: "#1e293b",
                          backgroundColor: "#ffffff",
                          textAlign: "left",
                        }}
                      >
                        {opt.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          </div>
        )}

        {showTitle && (
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
              Title ({langLabel})
            </label>
            <input
              type="text"
              value={item.title?.[locale] ?? ""}
              onChange={(e) => updateLocalized("title", e.target.value)}
              placeholder={`Item ${index + 1} title (${langLabel})…`}
              className="w-full text-xs border border-slate-200 rounded-lg p-2 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
            />
          </div>
        )}

        <div>
          <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">
            {sectionType === "checklist"
              ? `Checklist Item (${langLabel})`
              : `Body / Description (${langLabel})`}
          </label>
          <input
            type="text"
            value={item.body?.[locale] ?? ""}
            onChange={(e) => updateLocalized("body", e.target.value)}
            placeholder={
              sectionType === "checklist"
                ? `Checklist statement (${langLabel})…`
                : `Short description (${langLabel})…`
            }
            className="w-full text-xs border border-slate-200 rounded-lg p-2 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="mt-1 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0 cursor-pointer"
        title="Remove sub-item"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Main Section Editor ──────────────────────────────────────────────────────

interface SectionEditorProps {
  section: LegalSection;
  index: number;
  locale: string;
  onUpdate: (updated: LegalSection) => void;
  onDelete: () => void;
}

export default function SectionEditor({
  section,
  index,
  locale,
  onUpdate,
  onDelete,
}: SectionEditorProps) {
  const [expanded, setExpanded] = useState(section.expanded ?? false);

  const toggle = () => setExpanded((v: boolean) => !v);
  const langLabel = locale.toUpperCase();

  const updateLocalized = (field: "heading" | "content", val: string) => {
    onUpdate({
      ...section,
      [field]: {
        ...(section[field] ?? {}),
        [locale]: val,
      },
    });
  };

  const addSubItem = () => {
    const blank: SubItem = {
      id: uid(),
      title: { [locale]: "" },
      body: { [locale]: "" },
      icon:
        section.type === "icon-list"
          ? "CheckCircle2"
          : section.type === "contact"
          ? "Mail"
          : undefined,
    };
    onUpdate({ ...section, subItems: [...(section.subItems ?? []), blank] });
  };

  const updateSubItem = (idx: number, updated: SubItem) => {
    const items = [...(section.subItems ?? [])];
    items[idx] = updated;
    onUpdate({ ...section, subItems: items });
  };

  const deleteSubItem = (idx: number) => {
    const items = (section.subItems ?? []).filter((_: SubItem, i: number) => i !== idx);
    onUpdate({ ...section, subItems: items });
  };

  const displayHeading = resolveLocalized(section.heading, locale);

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden transition-all">
      {/* ── Section Header Bar ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 bg-white cursor-pointer select-none hover:bg-slate-50/70 transition-colors"
        onClick={toggle}
      >
        <GripVertical className="w-3.5 h-3.5 text-slate-300 shrink-0" />

        <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
          <LegalIcon name={section.sectionIcon} className="w-3.5 h-3.5" />
        </span>

        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-slate-800 truncate block">
            {displayHeading || (
              <span className="text-slate-400 italic">Untitled Section ({langLabel})</span>
            )}
          </span>
          <span className="text-[10px] text-slate-400 font-mono uppercase">
            #{index + 1} · {section.type}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Delete section"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {expanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* ── Expanded Body ── */}
      {expanded && (
        <div className="bg-slate-50/40 border-t border-slate-100 p-4 space-y-4">
          {/* Row 1 – Icon Selector + Heading */}
          <div className="grid grid-cols-1 sm:grid-cols-[210px_1fr] gap-3">
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                Section Icon
              </label>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 bg-white text-indigo-600 shrink-0">
                  <LegalIcon name={section.sectionIcon} className="w-4 h-4" />
                </span>
                <select
                  value={section.sectionIcon || "FileText"}
                  onChange={(e) => onUpdate({ ...section, sectionIcon: e.target.value })}
                  className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all cursor-pointer font-medium text-left"
                >
                  {LEGAL_ICON_GROUPS.map((group) => (
                    <optgroup
                      key={group.category}
                      label={group.category}
                      className="font-bold text-indigo-700 bg-slate-100 text-left"
                      style={{
                        fontWeight: 800,
                        color: "#4338ca",
                        backgroundColor: "#f1f5f9",
                        fontStyle: "normal",
                        textAlign: "left",
                      }}
                    >
                      {group.options.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                          className="font-normal text-slate-800 bg-white text-left"
                          style={{
                            fontWeight: 400,
                            color: "#1e293b",
                            backgroundColor: "#ffffff",
                            textAlign: "left",
                          }}
                        >
                          {opt.label}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                Section Heading ({langLabel}) *
              </label>
              <input
                type="text"
                value={section.heading?.[locale] ?? ""}
                onChange={(e) => updateLocalized("heading", e.target.value)}
                placeholder={`Section title (${langLabel})…`}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          {/* Row 2 – Section Type */}
          <div>
            <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
              Display Layout &amp; Purpose
            </label>
            <select
              value={section.type}
              onChange={(e) => onUpdate({ ...section, type: e.target.value as SectionType })}
              className="w-full text-xs font-medium border border-slate-200 rounded-lg p-2.5 outline-none bg-white focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all cursor-pointer"
            >
              {SECTION_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {/* Dynamic Purpose Explainer */}
            <div className="mt-1.5 px-3 py-1.5 bg-indigo-50/70 border border-indigo-100 rounded-lg flex items-start gap-2 text-[11px] text-indigo-700 leading-relaxed">
              <span className="font-bold shrink-0 uppercase text-[9px] px-1.5 py-0.5 bg-indigo-200/80 rounded text-indigo-900 mt-0.5">
                Purpose
              </span>
              <span>
                {SECTION_TYPE_OPTIONS.find((opt) => opt.value === section.type)?.description}
              </span>
            </div>
          </div>

          {/* Row 3 – Content (paragraph) or Sub-Items (all other types) */}
          {section.type === "paragraph" ? (
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">
                Paragraph Content ({langLabel}) *
              </label>
              <textarea
                rows={4}
                value={section.content?.[locale] ?? ""}
                onChange={(e) => updateLocalized("content", e.target.value)}
                placeholder={`Write the paragraph text in ${langLabel} here…`}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none bg-white resize-y focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all leading-relaxed"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-semibold text-slate-500 uppercase">
                  Sub-Items ({section.subItems?.length ?? 0}) · {langLabel}
                </label>
                <button
                  type="button"
                  onClick={addSubItem}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Item
                </button>
              </div>

              {(section.subItems ?? []).length === 0 && (
                <p className="text-xs text-slate-400 italic py-2">
                  No sub-items yet. Click &quot;Add Item&quot; to get started.
                </p>
              )}

              <div className="space-y-2">
                {(section.subItems ?? []).map((item: SubItem, idx: number) => (
                  <SubItemEditor
                    key={item.id}
                    item={item}
                    index={idx}
                    sectionType={section.type}
                    locale={locale}
                    onChange={(updated) => updateSubItem(idx, updated)}
                    onDelete={() => deleteSubItem(idx)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
