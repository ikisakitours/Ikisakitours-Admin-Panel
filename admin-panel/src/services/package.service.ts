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