import { PackageFormData } from "@/app/addpackage/types/package.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface PackageListItem {
  id: string;
  slug: string;
  title: string;
}

export const packageService = {
  async createPackage(formData: PackageFormData, images: File[]) {
    const data = new FormData();

    data.append("type", formData.type);
    data.append("category", formData.category);
    data.append("origin", formData.origin);
    data.append("duration", formData.duration);
    if (formData.badge) {
      data.append("badge", formData.badge);
    }
    data.append("slug", formData.slug);
    data.append("titleEmphasis", formData.titleEmphasis);
    data.append("title", formData.title);
    data.append("price", formData.price);
    data.append("discount", formData.discount || "0");
    data.append("provider", formData.provider);
    data.append("leadTitle", formData.leadTitle);
    data.append("leadDescription", formData.leadDescription);
    data.append("description", formData.description);

    data.append(
      "activityDetails",
      JSON.stringify(formData.activityDetails.filter((a) => a.title.trim() !== ""))
    );
    data.append(
      "highlights",
      JSON.stringify(formData.highlights.filter((h) => h.trim() !== ""))
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
    data.append(
      "includes",
      JSON.stringify(formData.includes.filter((i) => i.trim() !== ""))
    );
    data.append(
      "excludes",
      JSON.stringify(formData.excludes.filter((e) => e.trim() !== ""))
    );

    // ── localized scalar fields (optional — only append when present) ──
    // English (falls back to legacy fields on the server if omitted)
    if (formData.titleEn !== undefined && formData.titleEn !== null) {
      data.append("titleEn", formData.titleEn);
    }
    if (formData.titleEmphasisEn !== undefined && formData.titleEmphasisEn !== null) {
      data.append("titleEmphasisEn", formData.titleEmphasisEn);
    }
    if (formData.leadTitleEn !== undefined && formData.leadTitleEn !== null) {
      data.append("leadTitleEn", formData.leadTitleEn);
    }
    if (formData.leadDescriptionEn !== undefined && formData.leadDescriptionEn !== null) {
      data.append("leadDescriptionEn", formData.leadDescriptionEn);
    }
    if (formData.descriptionEn !== undefined && formData.descriptionEn !== null) {
      data.append("descriptionEn", formData.descriptionEn);
    }
    if (formData.highlightsEn !== undefined && formData.highlightsEn !== null) {
      data.append(
        "highlightsEn",
        JSON.stringify(formData.highlightsEn.filter((h) => h.trim() !== ""))
      );
    }
    if (formData.includesEn !== undefined && formData.includesEn !== null) {
      data.append(
        "includesEn",
        JSON.stringify(formData.includesEn.filter((i) => i.trim() !== ""))
      );
    }
    if (formData.excludesEn !== undefined && formData.excludesEn !== null) {
      data.append(
        "excludesEn",
        JSON.stringify(formData.excludesEn.filter((e) => e.trim() !== ""))
      );
    }

    // Japanese (optional — absence means read-time falls back to English)
    if (formData.titleJa !== undefined && formData.titleJa !== null) {
      data.append("titleJa", formData.titleJa);
    }
    if (formData.titleEmphasisJa !== undefined && formData.titleEmphasisJa !== null) {
      data.append("titleEmphasisJa", formData.titleEmphasisJa);
    }
    if (formData.leadTitleJa !== undefined && formData.leadTitleJa !== null) {
      data.append("leadTitleJa", formData.leadTitleJa);
    }
    if (formData.leadDescriptionJa !== undefined && formData.leadDescriptionJa !== null) {
      data.append("leadDescriptionJa", formData.leadDescriptionJa);
    }
    if (formData.descriptionJa !== undefined && formData.descriptionJa !== null) {
      data.append("descriptionJa", formData.descriptionJa);
    }
    if (formData.highlightsJa !== undefined && formData.highlightsJa !== null) {
      data.append(
        "highlightsJa",
        JSON.stringify(formData.highlightsJa.filter((h) => h.trim() !== ""))
      );
    }
    if (formData.includesJa !== undefined && formData.includesJa !== null) {
      data.append(
        "includesJa",
        JSON.stringify(formData.includesJa.filter((i) => i.trim() !== ""))
      );
    }
    if (formData.excludesJa !== undefined && formData.excludesJa !== null) {
      data.append(
        "excludesJa",
        JSON.stringify(formData.excludesJa.filter((e) => e.trim() !== ""))
      );
    }

    images.forEach((file) => {
      data.append("images", file);
    });

    const response = await fetch(`${API_URL}/addpackages`, {
      method: "POST",
      body: data,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create package");
    }

    return await response.json();
  },

  async getAllPackages(): Promise<PackageListItem[]> {
    const response = await fetch(`${API_URL}/addpackages`);
    if (!response.ok) {
      throw new Error("Failed to fetch packages");
    }
    return await response.json();
  },

  async getPackageBySlug(slug: string): Promise<PackageFormData> {
    const response = await fetch(`${API_URL}/addpackages/${slug}`);
    if (!response.ok) {
      throw new Error("Failed to fetch package details");
    }
    return await response.json();
  },

  async updatePackageTextOnly(slug: string, formData: PackageFormData) {
    // Spread carries the localized `_en` / `_ja` keys through to the
    // backend automatically — no explicit mapping needed here, because
    // `updatePackageTextOnly` sends a plain JSON body (not FormData),
    // and the backend DTO already accepts the new optional fields.
    //
    // `price` / `discount` are coerced to Number *after* the spread,
    // so the localized arrays/strings are untouched.
    const payload = {
      ...formData,
      price: Number(formData.price),
      discount: Number(formData.discount || 0),
    };

    const response = await fetch(`${API_URL}/addpackages/${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to update package");
    }

    return await response.json();
  },

  async deletePackage(slug: string) {
    const response = await fetch(`${API_URL}/addpackages/${slug}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to delete package");
    }

    return await response.json();
  },
};