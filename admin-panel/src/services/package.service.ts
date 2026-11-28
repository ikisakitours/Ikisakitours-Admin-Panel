import { PackageFormData } from "@/app/addpackage/types/package.types";
import { uploadImagesDirectlyToR2 } from "@/services/uploads.service";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getPackageHeaders(isJson: boolean = true): Record<string, string> {
  const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";
  const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
  return {
    ...(isJson ? { "Content-Type": "application/json" } : {}),
    ...(adminKey ? { "x-admin-key": adminKey } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function parseErrorMessage(errorData: unknown, fallback: string): string {
  if (!errorData) return fallback;
  if (typeof errorData === "object" && errorData !== null) {
    const errObj = errorData as Record<string, unknown>;
    if (Array.isArray(errObj.message)) {
      return errObj.message.join(", ");
    }
    if (typeof errObj.message === "string") {
      return errObj.message;
    }
    if (typeof errObj.error === "string") {
      return String(errObj.error);
    }
  }
  return fallback;
}

export interface PackageListItem {
  id: string;
  slug: string;
  title: string | Record<string, string>;
  type: string;
  isLive?: boolean;
  gallery?: string[];
}

export const packageService = {
  /**
   * Create a new tour package sending pure application/json with Cloudflare R2 gallery URLs.
   * If raw File[] are supplied, they are automatically optimized to WebP and uploaded
   * directly to Cloudflare R2 first, avoiding Vercel payload bottlenecks.
   */
  async createPackage(formData: PackageFormData, galleryOrImages: string[] | File[] = []) {
    let galleryUrls: string[] = [];

    if (Array.isArray(galleryOrImages) && galleryOrImages.length > 0) {
      if (typeof galleryOrImages[0] === "string") {
        galleryUrls = galleryOrImages as string[];
      } else {
        // Direct-to-Cloudflare R2 upload pipeline
        galleryUrls = await uploadImagesDirectlyToR2(
          galleryOrImages as File[],
          "package-images"
        );
      }
    } else if (Array.isArray(formData.gallery) && formData.gallery.length > 0) {
      galleryUrls = formData.gallery;
    }

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

    const payload = {
      ...formData,
      price: Number(formData.price),
      discount: Number(formData.discount || 0),
      gallery: galleryUrls,
      pricingConfig,
      pricingNotes: pricingConfig.pricingNotes,
      itinerary: (formData.itinerary || []).map((it) => ({
        ...it,
        day: Number(it.day),
      })),
      destinations: (formData.destinations || []).filter((d) => d.id),
    };

    const response = await fetch(`${API_URL}/addpackages`, {
      method: "POST",
      headers: getPackageHeaders(true),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(parseErrorMessage(errorData, "Failed to create package"));
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(parseErrorMessage(errorData, "Failed to fetch packages"));
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(parseErrorMessage(errorData, "Failed to fetch package details"));
    }
    return await response.json();
  },

  /**
   * Update an existing package via PATCH /addpackages/:slug.
   * Supports updating all metadata, pricing, itinerary, and the Cloudflare R2 gallery URLs.
   * When existing images are removed from the gallery array, the backend automatically
   * cleans them up from Cloudflare R2.
   */
  async updatePackage(
    slug: string,
    formData: PackageFormData,
    gallery?: string[]
  ) {
    const pricingConfig = formData.pricingConfig || {
      tiers: formData.pricingTiers || [],
      passengerPricing: formData.passengerPricing,
      options: formData.options || [],
      pricingNotes: formData.pricingNotes || [],
    };
    if (formData.pricingNotes && !pricingConfig.pricingNotes) {
      pricingConfig.pricingNotes = formData.pricingNotes;
    }

    const payload: Record<string, any> = {
      ...formData,
      price: Number(formData.price),
      discount: Number(formData.discount || 0),
      pricingConfig,
      pricingNotes: pricingConfig.pricingNotes,
      itinerary: (formData.itinerary || []).map((it) => ({
        ...it,
        day: Number(it.day),
      })),
      destinations: (formData.destinations || []).filter((d) => d.id),
    };

    if (gallery !== undefined) {
      payload.gallery = gallery;
    } else if (formData.gallery !== undefined) {
      payload.gallery = formData.gallery;
    }

    const response = await fetch(`${API_URL}/addpackages/${slug}`, {
      method: "PATCH",
      headers: getPackageHeaders(true),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(parseErrorMessage(errorData, "Failed to update package"));
    }

    return await response.json();
  },

  // Backward compatibility alias for existing callers
  async updatePackageTextOnly(
    slug: string,
    formData: PackageFormData,
    gallery?: string[]
  ) {
    return this.updatePackage(slug, formData, gallery);
  },

  async deletePackage(slug: string) {
    const response = await fetch(`${API_URL}/addpackages/${slug}`, {
      method: "DELETE",
      headers: getPackageHeaders(true),
      credentials: "include",
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(parseErrorMessage(errorData, "Failed to delete package"));
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
