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

// ─────────────────────────────────────────────────────────────────────────────
// Accent Colour Palette & Configurations
// ─────────────────────────────────────────────────────────────────────────────

export const ACCENT_OPTIONS = [
  { value: "gold", label: "Gold (Luxury & Premium)" },
  { value: "indigo", label: "Indigo (Classic Royal)" },
  { value: "blue", label: "Blue (Ocean & Trust)" },
  { value: "sky", label: "Sky (Clear & Modern)" },
  { value: "cyan", label: "Cyan (Turquoise Tropical)" },
  { value: "teal", label: "Teal (Lagoon Coastal)" },
  { value: "emerald", label: "Emerald (Nature & Safety)" },
  { value: "lime", label: "Lime (Fresh & Eco)" },
  { value: "amber", label: "Amber (Warm Gold Tone)" },
  { value: "orange", label: "Orange (Vibrant Travel)" },
  { value: "rose", label: "Rose (Elegant Soft)" },
  { value: "red", label: "Red (Important & Urgent)" },
  { value: "pink", label: "Pink (Playful & Warm)" },
  { value: "fuchsia", label: "Fuchsia (Vibrant Accent)" },
  { value: "purple", label: "Purple (Regal Elegance)" },
  { value: "violet", label: "Violet (Deep Creative)" },
  { value: "slate", label: "Slate (Minimalist Neutral)" },
];

export const ACCENT_BADGE: Record<string, string> = {
  gold: "bg-amber-50 text-amber-800 border-amber-300",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  lime: "bg-lime-50 text-lime-700 border-lime-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  red: "bg-red-50 text-red-700 border-red-200",
  pink: "bg-pink-50 text-pink-700 border-pink-200",
  fuchsia: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  slate: "bg-slate-100 text-slate-700 border-slate-300",
};

export const ACCENT_DOT: Record<string, string> = {
  gold: "bg-amber-400",
  indigo: "bg-indigo-500",
  blue: "bg-blue-500",
  sky: "bg-sky-500",
  cyan: "bg-cyan-500",
  teal: "bg-teal-500",
  emerald: "bg-emerald-500",
  lime: "bg-lime-500",
  amber: "bg-amber-500",
  orange: "bg-orange-500",
  rose: "bg-rose-500",
  red: "bg-red-500",
  pink: "bg-pink-500",
  fuchsia: "bg-fuchsia-500",
  purple: "bg-purple-500",
  violet: "bg-violet-500",
  slate: "bg-slate-500",
};

export const ACCENT_CLASSES: Record<
  string,
  { badge: string; border: string; dot: string }
> = {
  gold: {
    badge: "bg-amber-50 text-amber-800 border-amber-300",
    border: "border-l-amber-500",
    dot: "bg-amber-400",
  },
  indigo: {
    badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
    border: "border-l-indigo-500",
    dot: "bg-indigo-500",
  },
  blue: {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    border: "border-l-blue-500",
    dot: "bg-blue-500",
  },
  sky: {
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    border: "border-l-sky-500",
    dot: "bg-sky-500",
  },
  cyan: {
    badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
    border: "border-l-cyan-500",
    dot: "bg-cyan-500",
  },
  teal: {
    badge: "bg-teal-50 text-teal-700 border-teal-200",
    border: "border-l-teal-500",
    dot: "bg-teal-500",
  },
  emerald: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    border: "border-l-emerald-500",
    dot: "bg-emerald-500",
  },
  lime: {
    badge: "bg-lime-50 text-lime-700 border-lime-200",
    border: "border-l-lime-500",
    dot: "bg-lime-500",
  },
  amber: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    border: "border-l-amber-500",
    dot: "bg-amber-500",
  },
  orange: {
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    border: "border-l-orange-500",
    dot: "bg-orange-500",
  },
  rose: {
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    border: "border-l-rose-500",
    dot: "bg-rose-500",
  },
  red: {
    badge: "bg-red-50 text-red-700 border-red-200",
    border: "border-l-red-500",
    dot: "bg-red-500",
  },
  pink: {
    badge: "bg-pink-50 text-pink-700 border-pink-200",
    border: "border-l-pink-500",
    dot: "bg-pink-500",
  },
  fuchsia: {
    badge: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
    border: "border-l-fuchsia-500",
    dot: "bg-fuchsia-500",
  },
  purple: {
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    border: "border-l-purple-500",
    dot: "bg-purple-500",
  },
  violet: {
    badge: "bg-violet-50 text-violet-700 border-violet-200",
    border: "border-l-violet-500",
    dot: "bg-violet-500",
  },
  slate: {
    badge: "bg-slate-100 text-slate-700 border-slate-300",
    border: "border-l-slate-500",
    dot: "bg-slate-500",
  },
};
