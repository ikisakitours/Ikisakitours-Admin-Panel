// ─────────────────────────────────────────────────────────────────────────────
// Service Pricing (Charter, Custom-made, Transfer) — Unified TypeScript Types
// ─────────────────────────────────────────────────────────────────────────────

export type LocalizedText = Record<string, string>;
export type LocalizedList = Record<string, string[]>;

export interface ServicePricingConfig {
  titleBase: LocalizedText;
  titleAccent: LocalizedText;
  subtitleStrong: LocalizedText;
  subtitle: LocalizedText;
  popularBadge: LocalizedText;
  popularTitle: LocalizedText;
  popularDesc: LocalizedText;
  notes: LocalizedList;
}

// All three service types share the identical unified configuration structure
export type CharterRatesConfig = ServicePricingConfig;
export type CustomTourConfig = ServicePricingConfig;
export type TransferPricingConfig = ServicePricingConfig;

export type ActivePricingTab = "charter" | "custom" | "transfer";

export const EMPTY_SERVICE_PRICING_CONFIG: ServicePricingConfig = {
  titleBase: { en: "", ja: "" },
  titleAccent: { en: "", ja: "" },
  subtitleStrong: { en: "", ja: "" },
  subtitle: { en: "", ja: "" },
  popularBadge: { en: "", ja: "" },
  popularTitle: { en: "", ja: "" },
  popularDesc: { en: "", ja: "" },
  notes: { en: [""], ja: [""] },
};

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
