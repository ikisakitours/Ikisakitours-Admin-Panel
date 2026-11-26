import { PackageFormData } from "@/app/addpackage/types/package.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getPackageHeaders(isJson: boolean = true): Record<string, string> {
  const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return {
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...(adminKey ? { "x-admin-key": adminKey } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface PackageListItem {
  id: string;
  slug: string;
  title: string | Record<string, string>;
  type: string;
  isLive?: boolean;
}

export const packageService = {
  async createPackage(formData: PackageFormData, images: File[]) {
    const data = new FormData();

    data.append("type", formData.type);
    // Translatable dictionary objects sent as JSON strings via FormData
    data.append("category", JSON.stringify(formData.category));
    data.append("origin", JSON.stringify(formData.origin));
    data.append("duration", JSON.stringify(formData.duration));

    if (formData.badge) {
      data.append("badge", formData.badge);
    }
    data.append("slug", formData.slug);
    data.append("price", formData.price);
    data.append("discount", formData.discount || "0");
    data.append("provider", formData.provider);

    // ── Multilingual JSONB Text Fields (Records) ──
    data.append("title", JSON.stringify(formData.title));
    data.append("titleEmphasis", JSON.stringify(formData.titleEmphasis));
    data.append("leadTitle", JSON.stringify(formData.leadTitle));
    data.append("leadDescription", JSON.stringify(formData.leadDescription));
    data.append("description", JSON.stringify(formData.description));

    // ── Multilingual JSONB Arrays (Records of string arrays) ──
    data.append("highlights", JSON.stringify(formData.highlights));
    data.append("includes", JSON.stringify(formData.includes));
    data.append("excludes", JSON.stringify(formData.excludes));

    // ── JSONB Fields ──
    data.append(
      "activityDetails",
      JSON.stringify(formData.activityDetails)
    );
    data.append(
      "itinerary",
      JSON.stringify(
        formData.itinerary.map((it) => ({ ...it, day: Number(it.day) }))
      )
    );
    data.append(
      "destinations",
      JSON.stringify(formData.destinations.filter((d) => d.id))
    );

    // ── Unified Dynamic Group Pricing & Custom Add-ons (Single JSONB Object) ──
    const pricingConfig = formData.pricingConfig || {
      tiers: formData.pricingTiers || [],
      passengerPricing: formData.passengerPricing || {
        couplePricingType: "auto_tier",
        coupleFixedPrice: 0,
        childRateType: "percentage",
        childRateValue: 50,
        infantPrice: 0,
      },
      options: formData.options || [],
      pricingNotes: formData.pricingNotes || [],
    };
    if (formData.pricingNotes && !pricingConfig.pricingNotes) {
      pricingConfig.pricingNotes = formData.pricingNotes;
    }
    data.append("pricingConfig", JSON.stringify(pricingConfig));
    if (pricingConfig.pricingNotes) {
      data.append("pricingNotes", JSON.stringify(pricingConfig.pricingNotes));
    }

    images.forEach((file) => {
      data.append("images", file);
    });

    const response = await fetch(`${API_URL}/addpackages`, {
      method: "POST",
      headers: getPackageHeaders(false),
      credentials: "include",
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create package");
    }

    return await response.json();
  },

  async getAllPackages(): Promise<PackageListItem[]> {
    const response = await fetch(`${API_URL}/addpackages`, {
      headers: getPackageHeaders(true),
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch packages");
    }
    return await response.json();
  },

  async getPackageBySlug(slug: string): Promise<PackageFormData> {
    const response = await fetch(`${API_URL}/addpackages/${slug}`, {
      headers: getPackageHeaders(true),
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch package details");
    }
    return await response.json();
  },

  async updatePackageTextOnly(slug: string, formData: PackageFormData) {
    const pricingConfig = formData.pricingConfig || {
      tiers: formData.pricingTiers || [],
      passengerPricing: formData.passengerPricing,
      options: formData.options || [],
      pricingNotes: formData.pricingNotes || [],
    };
    if (formData.pricingNotes && !pricingConfig.pricingNotes) {
      pricingConfig.pricingNotes = formData.pricingNotes;
    }

    const payload = {
      ...formData,
      price: Number(formData.price),
      discount: Number(formData.discount || 0),
      pricingConfig,
      pricingNotes: pricingConfig.pricingNotes,
    };

    const response = await fetch(`${API_URL}/addpackages/${slug}`, {
      method: "PATCH",
      headers: getPackageHeaders(true),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update package");
    }

    return await response.json();
  },

  async deletePackage(slug: string) {
    const response = await fetch(`${API_URL}/addpackages/${slug}`, {
      method: "DELETE",
      headers: getPackageHeaders(true),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to delete package");
    }

    return await response.json();
  },

  async toggleVisibility(slug: string, isLive: boolean) {
    try {
      const response = await fetch(`${API_URL}/packages/${slug}/visibility`, {
        method: "PATCH",
        headers: getPackageHeaders(true),
        credentials: "include",
        body: JSON.stringify({ isLive }),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback if backend route pending
    }
    return { success: true, isLive };
  },
};
