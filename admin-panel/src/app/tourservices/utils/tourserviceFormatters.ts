import type {
  TourServiceCategory,
  TourServiceRequest,
  TourServiceStatus,
  TourServiceTravelers,
} from "../types/tourservice.types";

export function toNumber(val: string | number | null | undefined, fallback = 0): number {
  if (typeof val === "number" && !Number.isNaN(val)) return val;
  if (typeof val === "string" && val.trim() !== "") {
    const parsed = Number(val);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

export function formatServiceMoney(amount: string | number | null | undefined, currency = "USD"): string {
  const numeric = toNumber(amount, 0);
  if (numeric <= 0) return "—";
  const code = (currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numeric);
  } catch {
    return `$${numeric.toFixed(2)}`;
  }
}

export function formatServicePricingLabel(item: TourServiceRequest): { primary: string; secondary: string } {
  const basePrice = item.startingPrice || item.price;
  const numBase = toNumber(basePrice);

  if (item.category === "transfer") {
    if (numBase > 0) {
      return {
        primary: formatServiceMoney(numBase),
        secondary: "Base Rate + Distance Quote",
      };
    }
    return {
      primary: "Awaiting Quote",
      secondary: "Distance Based Fare",
    };
  }

  if (item.selectedPrice && toNumber(item.selectedPrice) > 0) {
    const tier = item.tourPackageType ? item.tourPackageType.replace(/^with\s+/i, "With ") : "Selected Tier";
    return {
      primary: formatServiceMoney(item.selectedPrice),
      secondary: tier,
    };
  }

  if (numBase > 0) {
    return {
      primary: formatServiceMoney(numBase),
      secondary: "Base Charter Rate",
    };
  }

  return {
    primary: "Custom Quote",
    secondary: "To be determined",
  };
}

export function getDisplayServiceReference(item: TourServiceRequest): string {
  if (item.referenceId && item.referenceId.trim()) return item.referenceId.trim();
  if (!item.id) return "REQ-IK";
  return `SRV-${item.id.slice(0, 8).toUpperCase()}`;
}

export function getTotalServicePax(travelers?: TourServiceTravelers): number {
  if (!travelers) return 1;
  const adults = Number(travelers.adults) || 0;
  const couples = Number(travelers.couples) || 0;
  const children = Number(travelers.children) || 0;
  const infants = Number(travelers.infants) || 0;
  const calculated = adults + couples * 2 + children + infants;
  return calculated > 0 ? calculated : 1;
}

export function formatServiceRelativeTime(isoDate?: string): string {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatServiceFullDateTime(isoDate?: string): string {
  if (!isoDate) return "—";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isNewServiceRequest(createdAt?: string, hoursThreshold = 24): boolean {
  if (!createdAt) return false;
  const createdMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdMs)) return false;
  const diffMs = Date.now() - createdMs;
  return diffMs >= -5 * 60 * 1000 && diffMs <= hoursThreshold * 60 * 60 * 1000;
}

export function toLocalDateKey(dateInput?: string | null): string | null {
  if (!dateInput) return null;
  const trimmed = dateInput.trim();
  const exactMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})$/);
  if (exactMatch) return exactMatch[1];

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export const SERVICE_STATUS_CONFIG: Record<
  string,
  { label: string; pillClass: string; dotClass: string; borderClass: string }
> = {
  pending: {
    label: "Pending",
    pillClass: "bg-amber-50 text-amber-700 border-amber-200",
    dotClass: "bg-amber-400",
    borderClass: "border-l-amber-400",
  },
  approved: {
    label: "Approved",
    pillClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dotClass: "bg-emerald-500",
    borderClass: "border-l-emerald-500",
  },
  active: {
    label: "Active",
    pillClass: "bg-teal-50 text-teal-700 border-teal-200",
    dotClass: "bg-teal-500",
    borderClass: "border-l-teal-500",
  },
  completed: {
    label: "Completed",
    pillClass: "bg-blue-50 text-blue-700 border-blue-200",
    dotClass: "bg-blue-500",
    borderClass: "border-l-blue-500",
  },
  rejected: {
    label: "Rejected",
    pillClass: "bg-rose-50 text-rose-700 border-rose-200",
    dotClass: "bg-rose-400",
    borderClass: "border-l-rose-400",
  },
};

export const SERVICE_CATEGORY_CONFIG: Record<
  TourServiceCategory,
  { label: string; pillClass: string; iconName: string }
> = {
  custom: {
    label: "Custom Made Tour",
    pillClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
    iconName: "Compass",
  },
  chauffeur: {
    label: "Private Chauffeur",
    pillClass: "bg-purple-50 text-purple-700 border-purple-200",
    iconName: "Car",
  },
  transfer: {
    label: "Transfer",
    pillClass: "bg-teal-50 text-teal-700 border-teal-200",
    iconName: "Plane",
  },
};
