// ─────────────────────────────────────────────────────────────────────────────
// Legal Documents — Shared TypeScript Types (Multilingual Record Support)
// ─────────────────────────────────────────────────────────────────────────────

export type LocalizedText = Record<string, string>;

export type SectionType =
  | "paragraph"
  | "checklist"
  | "grid"
  | "icon-list"
  | "row-list"
  | "contact";

export interface SubItem {
  id: string;
  title?: LocalizedText;
  body?: LocalizedText;
  icon?: string;
}

export interface LegalSection {
  id: string;
  heading: LocalizedText;
  sectionIcon?: string;
  type: SectionType;
  /** Used by "paragraph" type */
  content?: LocalizedText;
  /** Used by all list / grid / contact types */
  subItems?: SubItem[];
  /** Whether the section is expanded in the editor */
  expanded?: boolean;
}

export interface LegalDocument {
  id: string;
  title: LocalizedText;
  /** Short category label displayed above the title, e.g. "Legal & Compliance" */
  eyebrow?: LocalizedText;
  /** Tailwind accent colour token fragment, e.g. "emerald" | "indigo" | "blue" */
  accent?: string;
  lastUpdated: string;
  sections: LegalSection[];
}

/** Resolve a localized string for display (sidebar, preview, headers). */
export function resolveLocalized(
  field: LocalizedText | undefined,
  locale: string,
  fallback = ""
): string {
  if (!field) return fallback;
  return field[locale] || field["en"] || Object.values(field).find(Boolean) || fallback;
}
