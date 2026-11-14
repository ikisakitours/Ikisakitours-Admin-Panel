import {
  ActivePricingTab,
  ServicePricingConfig,
  CharterRatesConfig,
  CustomTourConfig,
  TransferPricingConfig,
  EMPTY_SERVICE_PRICING_CONFIG,
} from "@/app/servicepricing/types/ServicePricing.types";

export interface ServicePricingAllData {
  charter: ServicePricingConfig;
  custom: ServicePricingConfig;
  transfer: ServicePricingConfig;
}

export type CharterPricingAllData = ServicePricingAllData;
export type PricingConfig = ServicePricingConfig;

export interface ServicePricingPayload {
  serviceType: ActivePricingTab; // "charter" | "custom" | "transfer"
  titleBase: Record<string, string>;
  titleAccent: Record<string, string>;
  subtitleStrong: Record<string, string>;
  subtitle: Record<string, string>;
  popularBadge: Record<string, string>;
  popularTitle: Record<string, string>;
  popularDesc: Record<string, string>;
  notes: Record<string, string[]>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

class ServicePricingService {
  private getHeaders(): HeadersInit {
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (adminKey) {
      headers["x-admin-key"] = adminKey;
    }
    return headers;
  }

  // ── 1. Fetch All Pricing Configurations ───────────────────────────────────────
  async getAllPricing(): Promise<ServicePricingAllData> {
    const endpoints = [`${API_URL}/service-pricing`, `${API_URL}/charter-pricing`];

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: this.getHeaders(),
          cache: "no-store",
        });

        if (response.ok) {
          const result = await response.json();
          const data = result.data || result;
          if (data && (data.charter || data.custom || data.transfer)) {
            return {
              charter: data.charter || { ...EMPTY_SERVICE_PRICING_CONFIG },
              custom: data.custom || { ...EMPTY_SERVICE_PRICING_CONFIG },
              transfer: data.transfer || { ...EMPTY_SERVICE_PRICING_CONFIG },
            };
          }
        }
      } catch (err) {
        // try next endpoint
      }
    }

    // Default fallback when DB is empty or first initialized
    return {
      charter: { ...EMPTY_SERVICE_PRICING_CONFIG },
      custom: { ...EMPTY_SERVICE_PRICING_CONFIG },
      transfer: { ...EMPTY_SERVICE_PRICING_CONFIG },
    };
  }

  // ── 2. Fetch Specific Pricing by Service Type ─────────────────────────────────
  async getPricingByServiceType(serviceType: ActivePricingTab): Promise<ServicePricingConfig> {
    const endpoints = [
      `${API_URL}/service-pricing/${serviceType}`,
      `${API_URL}/charter-pricing/${serviceType}`,
    ];

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: this.getHeaders(),
          cache: "no-store",
        });

        if (response.ok) {
          const result = await response.json();
          return (result.data || result) as ServicePricingConfig;
        }
      } catch (err) {
        // try next endpoint
      }
    }

    return { ...EMPTY_SERVICE_PRICING_CONFIG };
  }

  // ── 3. Insert / Create New Pricing Record in DB ───────────────────────────────
  async insertPricing(serviceType: ActivePricingTab, config: ServicePricingConfig) {
    const payload = {
      serviceType, // "charter" | "custom" | "transfer"
      ...config,
    };

    const response = await fetch(`${API_URL}/service-pricing`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to insert ${serviceType} pricing into database`);
    }

    return await response.json();
  }

  // ── 4. Update Existing Pricing Record in DB ───────────────────────────────────
  async updatePricing(serviceType: ActivePricingTab, config: ServicePricingConfig) {
    const payload = {
      serviceType, // "charter" | "custom" | "transfer"
      ...config,
    };

    const response = await fetch(`${API_URL}/service-pricing/${serviceType}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to update ${serviceType} pricing in database`);
    }

    return await response.json();
  }

  // ── 5. Save (Full Upsert: Update if exists, Insert if not in DB) ──────────────
  async savePricing(serviceType: ActivePricingTab, config: ServicePricingConfig) {
    const payload = {
      serviceType, // "charter" | "custom" | "transfer"
      ...config,
    };

    // Step A: Attempt PATCH to update existing record by serviceType
    const patchRes = await fetch(`${API_URL}/service-pricing/${serviceType}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (patchRes.ok) {
      return await patchRes.json();
    }

    // Step B: If record doesn't exist yet (404), insert new record via POST
    if (patchRes.status === 404) {
      const postRes = await fetch(`${API_URL}/service-pricing`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (postRes.ok) {
        return await postRes.json();
      }

      // If backend uses /charter-pricing route instead
      const fallbackPost = await fetch(`${API_URL}/charter-pricing`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (fallbackPost.ok) {
        return await fallbackPost.json();
      }

      const errorData = await postRes.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to insert new ${serviceType} pricing record`);
    }

    const errorData = await patchRes.json().catch(() => ({}));
    throw new Error(errorData.message || `Failed to save ${serviceType} pricing`);
  }
}

export const servicePricingService = new ServicePricingService();
export const charterPricingService = servicePricingService;
