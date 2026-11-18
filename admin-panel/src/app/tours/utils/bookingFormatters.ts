import type {
  BookingSelectedOption,
  BookingStatus,
  PackageBooking,
  PaymentStatus,
} from "@/app/tours/types/package-booking.types";

export function toNumber(val: string | number | null | undefined, fallback = 0): number {
  if (typeof val === "number" && !Number.isNaN(val)) return val;
  if (typeof val === "string" && val.trim() !== "") {
    const parsed = Number(val);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return fallback;
}

export function formatMoney(amount: string | number | null | undefined, currency = "USD"): string {
  const numeric = toNumber(amount, 0);
  const code = (currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: code === "JPY" ? 0 : 2,
      maximumFractionDigits: code === "JPY" ? 0 : 2,
    }).format(numeric);
  } catch {
    return `${code} ${numeric.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}

export function getDisplayReference(booking: PackageBooking): string {
  if (booking.bookingReference && booking.bookingReference.trim()) {
    return booking.bookingReference.trim();
  }
  return `REF-${booking.id.slice(0, 8).toUpperCase()}`;
}

export function getTotalPax(booking: PackageBooking): number {
  const t = booking.travelers || { adults: 0, couples: 0, children: 0, infants: 0 };
  const calculated =
    (Number(t.adults) || 0) +
    (Number(t.couples) || 0) * 2 +
    (Number(t.children) || 0) +
    (Number(t.infants) || 0);
  if (calculated > 0) {
    return calculated;
  }
  if (typeof booking.totalPax === "number" && booking.totalPax > 0) {
    return booking.totalPax;
  }
  return 0;
}

export function formatTravelerSubtext(booking: PackageBooking): string {
  const t = booking.travelers || { adults: 0, couples: 0, children: 0, infants: 0 };
  const parts: string[] = [
    `${t.adults || 0} Adult${(t.adults || 0) === 1 ? "" : "s"}`,
    `${t.couples || 0} Couple${(t.couples || 0) === 1 ? "" : "s"}`,
    `${t.children || 0} Child${(t.children || 0) === 1 ? "" : "ren"}`,
  ];
  if ((t.infants || 0) > 0) {
    parts.push(`${t.infants} Infant${t.infants === 1 ? "" : "s"}`);
  }
  return parts.join(", ");
}

export function resolveOptionName(name: BookingSelectedOption["name"], locale = "en"): string {
  if (typeof name === "string") return name;
  if (name && typeof name === "object") {
    return name[locale] || name.en || Object.values(name).find(Boolean) || "Unnamed Option";
  }
  return "Unnamed Option";
}

export function formatOptionCalcType(calcType: string): string {
  switch (calcType) {
    case "per_person":
      return "Per Person";
    case "per_room":
      return "Per Room";
    case "per_booking":
      return "Per Booking";
    default:
      return calcType || "Flat";
  }
}

export function formatRelativeTime(isoDate?: string): string {
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

export function formatFullDateTime(isoDate?: string): string {
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

export function isNewBooking(createdAt?: string, hoursThreshold = 24): boolean {
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

export const BOOKING_STATUS_CONFIG: Record<BookingStatus, { label: string; pillClass: string; dotClass: string }> = {
  pending: {
    label: "Pending",
    pillClass: "bg-amber-50 text-amber-800 border-amber-200",
    dotClass: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    pillClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dotClass: "bg-emerald-500",
  },
  completed: {
    label: "Completed",
    pillClass: "bg-blue-50 text-blue-800 border-blue-200",
    dotClass: "bg-blue-500",
  },
  cancelled: {
    label: "Cancelled",
    pillClass: "bg-rose-50 text-rose-800 border-rose-200",
    dotClass: "bg-rose-500",
  },
};

export const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; pillClass: string }> = {
  unpaid: {
    label: "Unpaid",
    pillClass: "bg-zinc-100 text-zinc-700 border-zinc-200",
  },
  pending: {
    label: "Payment Pending",
    pillClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  paid: {
    label: "Paid",
    pillClass: "bg-green-50 text-green-700 border-green-200",
  },
  failed: {
    label: "Failed",
    pillClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  refunded: {
    label: "Refunded",
    pillClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
};
