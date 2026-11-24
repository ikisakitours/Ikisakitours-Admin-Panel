import type { PackageBooking } from "@/app/tours/types/package-booking.types";
import type { PackageFormData, ItineraryItem } from "@/app/addpackage/types/package.types";
import {
  DEFAULT_COMPANY_INFO,
  type ItineraryDay,
  type ItineraryDayMeals,
  type ItineraryDocument,
  type ItineraryFlight,
  type ItineraryGuest,
} from "../types/itinerary.types";

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "TH";
  switch (day % 10) {
    case 1:
      return "ST";
    case 2:
      return "ND";
    case 3:
      return "RD";
    default:
      return "TH";
  }
}

const MONTH_NAMES_EN = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

const DAY_NAMES_EN = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const DAY_NAMES_JA = ["日", "月", "火", "水", "木", "金", "土"];

export function formatDayDateEn(date: Date): string {
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  const month = MONTH_NAMES_EN[date.getMonth()];
  const weekday = DAY_NAMES_EN[date.getDay()];
  return `${day}${suffix} ${month} (${weekday})`;
}

export function formatDayDateJa(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = DAY_NAMES_JA[date.getDay()];
  return `${month}月${day}日 (${weekday})`;
}

export function formatDateShortEn(date: Date): string {
  const day = date.getDate();
  const month = MONTH_NAMES_EN[date.getMonth()];
  return `${day}-${month}`;
}

export function formatDateShortJa(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}月${day}日`;
}

export function parseBookingStartDate(booking: PackageBooking): Date {
  const dateStr = booking.journeyDate || (booking as any).travelDate;
  if (dateStr) {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date(); // fallback to today
}

function resolveLangString(val: any, lang: "en" | "ja", fallback = ""): string {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "object") {
    return val[lang] || val["en"] || Object.values(val)[0] || fallback;
  }
  return fallback;
}

function resolveLangArray(val: any, lang: "en" | "ja"): string[] {
  if (!val) return [];
  if (Array.isArray(val)) {
    return val.map((item) => (typeof item === "string" ? item : String(item)));
  }
  if (typeof val === "object") {
    const arr = val[lang] || val["en"] || Object.values(val)[0];
    if (Array.isArray(arr)) {
      return arr.map((item) => (typeof item === "string" ? item : String(item)));
    }
  }
  return [];
}

function resolveMealString(val: any, fallback = "NONE"): string {
  if (!val) return fallback;
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.join(", ") || fallback;
  return fallback;
}

export function generateItineraryFromBooking(
  booking: PackageBooking,
  packageDetails?: PackageFormData | null
): ItineraryDocument {
  const startDate = parseBookingStartDate(booking);
  const isOneDay = booking.type === "oneday";

  // Check duration from packageDetails or booking
  let durationDays = isOneDay ? 1 : 7;
  if (packageDetails?.itinerary && packageDetails.itinerary.length > 0) {
    durationDays = packageDetails.itinerary.length;
  } else if ((booking as any).durationDays) {
    durationDays = Number((booking as any).durationDays);
  }

  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + Math.max(1, durationDays - 1));

  const refCode =
    booking.bookingReference ||
    (booking.id ? `IK-${booking.id.slice(0, 8).toUpperCase()}` : "IK-1314AW4F");

  // Tour Package Name (English & Japanese)
  let tourNameEn = booking.packageName || "Classic Sri Lanka Tour";
  let tourNameJa = booking.packageName || "スリランカ周遊ハイライトツアー";

  if (packageDetails?.title) {
    tourNameEn = resolveLangString(packageDetails.title, "en", tourNameEn);
    tourNameJa = resolveLangString(packageDetails.title, "ja", tourNameJa);
  }

  // Build Guest list
  const travelers = booking.travelers || { adults: 1, children: 0 };
  const totalAdults = Number(travelers.adults) || 1;
  const couples = Number((travelers as any).couples) || 0;
  const totalPax = totalAdults + (travelers.children || 0);

  const customerFullName = `${booking.firstname || ""} ${booking.lastname || ""}`.trim();
  const mainGuestName = customerFullName || "VALUED GUEST";
  const guests: ItineraryGuest[] = [];

  const defaultRoomType = couples > 0 ? "1DBL" : totalPax >= 2 ? "1TWN" : "1SGL";

  guests.push({
    id: "guest-1",
    name: mainGuestName.toUpperCase(),
    roomType: defaultRoomType,
  });

  if (totalPax > 1) {
    guests.push({
      id: "guest-2",
      name: `${mainGuestName.toUpperCase()} PARTY (PAX: ${totalPax})`,
      roomType: defaultRoomType,
    });
  }

  // Flights: initialize empty - real flight details to be provided by admin/client
  const flights: ItineraryFlight[] = [];

  // Build Schedule Days strictly from ACTUAL package details if available
  const schedule: ItineraryDay[] = [];
  const actualItinerary: ItineraryItem[] = packageDetails?.itinerary || [];
  const totalDays = actualItinerary.length > 0 ? actualItinerary.length : durationDays;

  for (let i = 0; i < totalDays; i++) {
    const dayDate = new Date(startDate);
    dayDate.setDate(startDate.getDate() + i);

    const isFirstDay = i === 0;
    const isLastDay = i === totalDays - 1;

    let dayTitleEn = `Day ${i + 1}`;
    let dayTitleJa = `${i + 1}日目`;
    let actsEn: string[] = [];
    let actsJa: string[] = [];
    let scenicEn: string[] = [];
    let scenicJa: string[] = [];
    let bulletsEn: string[] = [];
    let bulletsJa: string[] = [];
    let hotelEn = "";
    let hotelJa = "";
    let breakfast = isFirstDay ? "NONE" : "HOTEL";
    let lunch = "CLIENT";
    let dinner = isLastDay ? "AIRPORT" : "HOTEL";

    if (actualItinerary[i]) {
      const itItem = actualItinerary[i];
      dayTitleEn = resolveLangString(itItem.title, "en", `Day ${i + 1}`);
      dayTitleJa = resolveLangString(itItem.title, "ja", `${i + 1}日目`);

      actsEn = resolveLangArray(itItem.activities, "en");
      actsJa = resolveLangArray(itItem.activities, "ja");
      scenicEn = resolveLangArray(itItem.scenicStops, "en");
      scenicJa = resolveLangArray(itItem.scenicStops, "ja");
      bulletsEn = resolveLangArray(itItem.details, "en");
      bulletsJa = resolveLangArray(itItem.details, "ja");

      if (itItem.accommodation) {
        hotelEn = resolveLangString(itItem.accommodation, "en", "");
        hotelJa = resolveLangString(itItem.accommodation, "ja", "");
      }

      if (itItem.meals) {
        breakfast = resolveMealString(itItem.meals.breakfast, breakfast);
        lunch = resolveMealString(itItem.meals.lunch, lunch);
        dinner = resolveMealString(itItem.meals.dinner, dinner);
      }
    }

    schedule.push({
      id: `day-${i + 1}`,
      dayNumber: i + 1,
      dateStr: formatDayDateEn(dayDate),
      title: dayTitleEn,
      activities: actsEn,
      scenicStops: scenicEn,
      bullets: bulletsEn,
      hotelCheckIn: hotelEn || undefined,
      meals: { breakfast, lunch, dinner },
      rawEn: {
        dateStr: formatDayDateEn(dayDate),
        title: dayTitleEn,
        activities: actsEn,
        scenicStops: scenicEn,
        bullets: bulletsEn,
        hotelCheckIn: hotelEn || undefined,
      },
      rawJa: {
        dateStr: formatDayDateJa(dayDate),
        title: dayTitleJa,
        activities: actsJa,
        scenicStops: scenicJa,
        bullets: bulletsJa,
        hotelCheckIn: hotelJa || undefined,
      },
    });
  }

  const remarksEn = [
    "Lunches by client unless specified under special package inclusions.",
    "Modest dress code is strictly required at all Buddhist and Hindu sacred temples (knees and shoulders covered; shoes and hats must be removed).",
    "Chauffeur-guide service includes fuel, expressway tolls, parking charges, and chauffeur accommodation/meals.",
    "Standard check-in time at hotels is 14:00 hrs & check-out time is 12:00 noon.",
    "In the event of unforeseen weather or road closures, reasonable alternate routing will be provided with client consent.",
  ];

  const remarksJa = [
    "昼食はお客様実費負担となります（特記プランを除く）。",
    "仏教・ヒンドゥー教寺院への入場時は、肩や膝が隠れる服装が必要です（靴および帽子は脱帽）。",
    "専用車ドライバーガイド費用には、燃料代、高速道路料金、駐車料金、ドライバーの宿泊・食事代が含まれます。",
    "ホテルの標準チェックインは14:00、チェックアウトは12:00（正午）となります。",
    "悪天候や道路規制等により安全運行上必要な場合、お客様のご了承を得た上で行程を調整する場合がございます。",
  ];

  const notesStr = (booking as any).specialRequests || (booking as any).notes || "";
  if (notesStr && notesStr.trim()) {
    remarksEn.unshift(`Special Note / Client Request: ${notesStr.trim()}`);
    remarksJa.unshift(`特別ご要望事項: ${notesStr.trim()}`);
  }

  return {
    id: `itin-${Date.now()}`,
    title: `${mainGuestName} - ${refCode}`,
    referenceNo: refCode,
    bookingId: booking.id,
    packageSlug: booking.packageSlug,
    language: "en",
    tourName: tourNameEn.toUpperCase(),
    tourNameJa: tourNameJa,
    tourDates: `${formatDateShortEn(startDate)} to ${formatDateShortEn(endDate)}`,
    tourDatesJa: `${formatDateShortJa(startDate)} 〜 ${formatDateShortJa(endDate)}`,
    guests,
    flights,
    schedule,
    remarks: remarksEn,
    remarksJa,
    companyInfo: { ...DEFAULT_COMPANY_INFO },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function generateItineraryFromPackage(pkg: PackageFormData): ItineraryDocument {
  const now = new Date();
  const nextMonth = new Date(now);
  nextMonth.setDate(now.getDate() + 14);

  const durationDays = pkg.itinerary && pkg.itinerary.length > 0 ? pkg.itinerary.length : 1;
  const endDate = new Date(nextMonth);
  endDate.setDate(nextMonth.getDate() + Math.max(1, durationDays - 1));

  const tourNameEn = resolveLangString(pkg.title, "en", "Tour Package");
  const tourNameJa = resolveLangString(pkg.title, "ja", "ツアーパッケージ");

  const schedule: ItineraryDay[] = (pkg.itinerary || []).map((itItem, i) => {
    const dayNumber = i + 1;
    const dayDate = new Date(nextMonth);
    dayDate.setDate(nextMonth.getDate() + i);

    const dateStrEn = formatDayDateEn(dayDate);
    const dateStrJa = formatDayDateJa(dayDate);

    const titleEn = resolveLangString(itItem.title, "en", `Day ${dayNumber}`);
    const titleJa = resolveLangString(itItem.title, "ja", `${dayNumber}日目`);

    const actsEn = resolveLangArray(itItem.activities, "en");
    const actsJa = resolveLangArray(itItem.activities, "ja");
    const scenicEn = resolveLangArray(itItem.scenicStops, "en");
    const scenicJa = resolveLangArray(itItem.scenicStops, "ja");
    const detailsEn = resolveLangArray(itItem.details, "en");
    const detailsJa = resolveLangArray(itItem.details, "ja");

    const hotelEn = itItem.accommodation ? resolveLangString(itItem.accommodation, "en", "") : "";
    const hotelJa = itItem.accommodation ? resolveLangString(itItem.accommodation, "ja", "") : "";

    const meals: ItineraryDayMeals = {
      breakfast: resolveMealString(itItem.meals?.breakfast, i === 0 ? "NONE" : "HOTEL"),
      lunch: resolveMealString(itItem.meals?.lunch, "CLIENT"),
      dinner: resolveMealString(itItem.meals?.dinner, i === durationDays - 1 ? "AIRPORT" : "HOTEL"),
    };

    return {
      id: `day-${dayNumber}-${Date.now()}`,
      dayNumber,
      dateStr: dateStrEn,
      title: titleEn,
      activities: actsEn,
      scenicStops: scenicEn,
      bullets: detailsEn,
      hotelCheckIn: hotelEn || undefined,
      meals,
      rawEn: {
        dateStr: dateStrEn,
        title: titleEn,
        activities: actsEn,
        scenicStops: scenicEn,
        bullets: detailsEn,
        hotelCheckIn: hotelEn || undefined,
      },
      rawJa: {
        dateStr: dateStrJa,
        title: titleJa,
        activities: actsJa,
        scenicStops: scenicJa,
        bullets: detailsJa,
        hotelCheckIn: hotelJa || undefined,
      },
    };
  });

  return {
    id: `itin-pkg-${Date.now()}`,
    title: tourNameEn,
    referenceNo: `IK-${Math.floor(1000 + Math.random() * 9000)}PKG`,
    packageSlug: pkg.slug,
    language: "en",
    tourName: tourNameEn.toUpperCase(),
    tourNameJa,
    tourDates: `${formatDateShortEn(nextMonth)} to ${formatDateShortEn(endDate)}`,
    tourDatesJa: `${formatDateShortJa(nextMonth)} 〜 ${formatDateShortJa(endDate)}`,
    guests: [],
    flights: [],
    schedule,
    remarks: [
      "Lunches by client unless specified under special package inclusions.",
      "Modest dress code is strictly required at all Buddhist and Hindu sacred temples.",
      "Chauffeur-guide service includes fuel, expressway tolls, parking charges, and chauffeur accommodation/meals.",
      "Standard check-in time at hotels is 14:00 hrs & check-out time is 12:00 noon.",
    ],
    remarksJa: [
      "昼食はお客様実費負担となります（特記プランを除く）。",
      "寺院参拝時は肩と膝が隠れる服装が必要です。",
      "専用車ドライバーガイド費用には燃料代、高速代、駐車代、宿泊食費が含まれます。",
      "チェックインは14:00、チェックアウトは12:00です。",
    ],
    companyInfo: { ...DEFAULT_COMPANY_INFO },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
