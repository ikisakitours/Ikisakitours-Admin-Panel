// ─────────────────────────────────────────────────────────────────────────────
// Charter Rates & Custom-made Tour Pricing — Shared TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────

export type LocalizedText = Record<string, string>;
export type LocalizedList = Record<string, string[]>;

export interface CharterRatesConfig {
  titleBase: LocalizedText;
  titleAccent: LocalizedText;
  subtitleStrong: LocalizedText;
  subtitle: LocalizedText;
  popularBadge: LocalizedText;
  popularTitle: LocalizedText;
  popularDesc: LocalizedText;
  ctaButton: LocalizedText;
  ctaDesc: LocalizedText;
  notes: LocalizedList;
}

export interface CustomTourConfig {
  titleBase: LocalizedText;
  titleAccent: LocalizedText;
  badgeText: LocalizedText;
  subtitle: LocalizedText;
  description: LocalizedText;
  ctaButton: LocalizedText;
  ctaNote: LocalizedText;
  inclusions: LocalizedList;
  exclusions: LocalizedList;
  pricingNotes: LocalizedList;
}

export interface TransferPricingConfig {
  titleBase: LocalizedText;
  titleAccent: LocalizedText;
  subtitleStrong: LocalizedText;
  subtitle: LocalizedText;
  popularBadge: LocalizedText;
  popularTitle: LocalizedText;
  popularDesc: LocalizedText;
  notes: LocalizedList;
}

export type ActivePricingTab = "charter" | "custom" | "transfer";

export function resolveText(
  field: LocalizedText | undefined,
  locale: string,
  fallback = ""
): string {
  if (!field) return fallback;
  return field[locale] || field["en"] || Object.values(field).find(Boolean) || fallback;
}

export function resolveList(
  field: LocalizedList | undefined,
  locale: string
): string[] {
  if (!field) return [];
  const current = field[locale];
  if (current && current.length > 0) return current;
  return field["en"] || Object.values(field)[0] || [];
}

