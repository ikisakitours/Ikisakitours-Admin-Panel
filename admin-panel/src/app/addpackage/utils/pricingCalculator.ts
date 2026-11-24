// admin-panel/src/app/addpackage/utils/pricingCalculator.ts
// Pure pricing calculation & simulation engine for One-Day & Multi-Day Tour Packages.
// Industry Standard: Group Discount Tiers are determined by ADULT travelers (effectiveAdults).
// Children and infants pay their configured category rates and do not downgrade the adult group tier.

import {
  GroupPricingTier,
  PassengerCategoryPricing,
  PackageOptionItem,
} from "../types/package.types";

export interface PriceSimulationParams {
  tiers: GroupPricingTier[];
  passengerPricing: PassengerCategoryPricing;
  options: PackageOptionItem[];
  fallbackBasePrice?: number;
  testAdults: number;
  testCouples: number;
  testChildren: number;
  testInfants: number;
  selectedOptionIds: string[];
}

export interface PriceSimulationResult {
  effectiveAdults: number;
  totalTravelers: number;
  adultPaxCount: number;
  matchedTier: GroupPricingTier;
  adultRate: number;
  twoPaxTier?: GroupPricingTier;
  twoPaxRate: number;
  twoPaxTotal: number;
  coupleRate: number;
  coupleTotal: number;
  singleAdultTotal: number;
  baseAdultTotal: number;
  childRate: number;
  baseChildTotal: number;
  baseInfantTotal: number;
  baseTotal: number;
  optionsTotal: number;
  grandTotal: number;
  breakdownSummary: string;
}

/**
 * Calculates live simulation pricing for Tour Packages (One-Day and Multi-Day).
 * 
 * Rules:
 * 1. 1 Couple = 2 Adults (effectiveAdults = testAdults + testCouples * 2).
 * 2. Adult Tier is determined STRICTLY by adult pax count (`adultPaxCount`), so child/infant increments
 *    do not dilute or alter the adult group discount tier (Industry Standard for multi-day tours).
 * 3. Children (age 2-12) pay either a percentage of the active adult tier or a flat fee.
 * 4. Infants (<2) are free ($0) or flat fee.
 * 5. Add-ons can be per_person (charged per adult + child), per_room, or per_booking.
 */
export function calculateLivePackagePrice(
  params: PriceSimulationParams
): PriceSimulationResult {
  const {
    tiers,
    passengerPricing,
    options,
    fallbackBasePrice = 0,
    testAdults,
    testCouples,
    testChildren,
    testInfants,
    selectedOptionIds,
  } = params;

  // 1 Couple represents 2 Adults
  const effectiveAdults = testAdults + testCouples * 2;
  const totalTravelers = effectiveAdults + testChildren + testInfants;

  // In Multi-day & One-day tours, Group Discount Tiers are matched based on ADULT travelers.
  // When 0 adults are selected, lookup falls back to 1 for starting tier preview.
  const adultPaxCount = effectiveAdults > 0 ? effectiveAdults : 1;

  const matchedTier: GroupPricingTier =
    tiers.find((t) => adultPaxCount >= t.minPax && adultPaxCount <= t.maxPax) ||
    tiers[0] ||
    tiers[tiers.length - 1] || {
      minPax: 1,
      maxPax: 1,
      pricePerPerson: fallbackBasePrice,
      label: "Standard Rate",
    };

  const adultRate = matchedTier.pricePerPerson;

  // 2-Person Tier Rate helper for dynamic couple calculation & preview notes
  const twoPaxTier =
    tiers.find((t) => t.minPax <= 2 && t.maxPax >= 2) || tiers[1] || tiers[0];
  const twoPaxRate = twoPaxTier ? twoPaxTier.pricePerPerson : 65;
  const twoPaxTotal = twoPaxRate * 2;

  // Couple calculation: custom fixed couple rate OR 2 x active adultRate
  const coupleRate =
    passengerPricing.couplePricingType === "fixed" &&
    typeof passengerPricing.coupleFixedPrice === "number" &&
    passengerPricing.coupleFixedPrice > 0
      ? passengerPricing.coupleFixedPrice
      : 2 * adultRate;

  const coupleTotal = testCouples * coupleRate;
  const singleAdultTotal = testAdults * adultRate;
  const baseAdultTotal = singleAdultTotal + coupleTotal;

  // Child calculation: percentage of active adult rate OR flat fee
  const childRate =
    passengerPricing.childRateType === "percentage"
      ? (adultRate * (passengerPricing.childRateValue || 0)) / 100
      : passengerPricing.childRateValue || 0;

  const baseChildTotal = testChildren * childRate;
  const baseInfantTotal = testInfants * (passengerPricing.infantPrice || 0);
  const baseTotal = baseAdultTotal + baseChildTotal + baseInfantTotal;

  // Add-ons calculation
  const optionsTotal = options
    .filter((opt) => selectedOptionIds.includes(opt.id))
    .reduce((sum, opt) => {
      if (opt.calculationType === "per_person") {
        return sum + opt.price * (effectiveAdults + testChildren);
      }
      return sum + opt.price; // per_room or per_booking flat rate
    }, 0);

  const grandTotal = baseTotal + optionsTotal;

  // Human-readable breakdown summary
  const breakdownParts: string[] = [];
  if (testCouples > 0) breakdownParts.push(`${testCouples} Couple @ $${coupleRate}`);
  if (testAdults > 0) breakdownParts.push(`${testAdults} Adult @ $${adultRate}`);
  if (testChildren > 0) breakdownParts.push(`${testChildren} Child @ $${childRate.toFixed(2)}`);
  if (testInfants > 0) breakdownParts.push(`${testInfants} Infant @ $${passengerPricing.infantPrice || 0}`);

  const breakdownSummary =
    totalTravelers === 0 ? "0 Travelers" : breakdownParts.join(", ");

  return {
    effectiveAdults,
    totalTravelers,
    adultPaxCount,
    matchedTier,
    adultRate,
    twoPaxTier,
    twoPaxRate,
    twoPaxTotal,
    coupleRate,
    coupleTotal,
    singleAdultTotal,
    baseAdultTotal,
    childRate,
    baseChildTotal,
    baseInfantTotal,
    baseTotal,
    optionsTotal,
    grandTotal,
    breakdownSummary,
  };
}
