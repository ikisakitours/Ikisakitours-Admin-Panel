// ─────────────────────────────────────────────────────────────────────────────
// Availability Constants & Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
] as const;

export const YEARS = [2026, 2027, 2028, 2029] as const;

export const TOUR_TYPES = [
  {
    value: "all",
    label: "All Tours & Services (Full Day Closed)",
    color: "rose",
    hex: "#f43f5e",
    badgeColor: "bg-rose-50 text-rose-800 border-rose-200",
    dotColor: "bg-rose-500",
  },
  {
    value: "multiday tours",
    label: "Multiday Tours",
    color: "emerald",
    hex: "#10b981",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dotColor: "bg-emerald-500",
  },
  {
    value: "one day tours",
    label: "One Day Tours",
    color: "blue",
    hex: "#2563eb",
    badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    dotColor: "bg-blue-600",
  },
  {
    value: "custom made tours",
    label: "Custom Made Tours",
    color: "purple",
    hex: "#9333ea",
    badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    dotColor: "bg-purple-600",
  },
  {
    value: "private charter",
    label: "Private Charter",
    color: "gold",
    hex: "#eab308",
    badgeColor: "bg-yellow-50 text-yellow-800 border-yellow-300",
    dotColor: "bg-yellow-400",
  },
  {
    value: "transfer",
    label: "Transfer",
    color: "orange",
    hex: "#f97316",
    badgeColor: "bg-orange-50 text-orange-800 border-orange-200",
    dotColor: "bg-orange-500",
  },
] as const;

export interface DateConfig {
  tourType?: string;
  tourTypes?: string[];
  color?: string;
  colors?: string[];
  hex?: string;
  hexes?: string[];
  note?: string;
  notes?: Record<string, string>;
}

/** Helper to extract closed tour type keys array for a given date config */
export function getTourTypesForDate(config?: DateConfig): string[] {
  if (Array.isArray(config?.tourTypes) && config.tourTypes.length > 0) {
    return config.tourTypes;
  }
  if (config?.tourType) {
    return config.tourType.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return ["all"];
}
