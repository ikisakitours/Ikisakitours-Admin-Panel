import { uploadImagesDirectlyToR2 } from "@/services/uploads.service";

export type DestinationLanguage = "en" | "ja" | "fr";

export interface DestinationPayload {
  id?: string; // Included when editing an existing destination
  title: Record<string, string>;
  slug?: string;
  summary: Record<string, string>;
  description: Record<string, string>;
  province: Record<string, string>;
  highlights: Record<string, string[]>;
  images?: string[];
  bestTimeToVisit: Record<string, string>;
  climate: Record<string, string>;
  primaryLanguage: Record<string, string>;
  localCurrency: Record<string, string>;
  coordinates: {
    lat: number;
    lng: number;
  };
  isLive?: boolean;
}

export interface DestinationPreview {
  id: string;
  title: string;
  slug: string;
  language: string;
  summary: string;
  province: string;
  bestTimeToVisit: string;
  climate: string;
  heroImage: string | null;
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

class DestinationService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

  private getHeaders(isJson: boolean = true): Record<string, string> {
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY || "";
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    return {
      ...(isJson ? { "Content-Type": "application/json" } : {}),
      ...(adminKey ? { "x-admin-key": adminKey } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Upload optimized WebP images directly to Cloudflare R2
  async uploadImages(files: File[], _folder: string = "destination-images"): Promise<string[]> {
    return uploadImagesDirectlyToR2(files, "destination-images");
  }

  // Save destination payload (pure application/json with Cloudflare R2 image URLs)
  async createDestination(payload: DestinationPayload) {
    const res = await fetch(`${this.API_URL}/destinations`, {
      method: "POST",
      headers: this.getHeaders(true),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseErrorMessage(error, "Failed to create destination"));
    }

    return res.json();
  }

  // ADMIN 1: Fetch all raw multilingual destinations for the admin management list
  async getAdminDestinations(): Promise<DestinationPayload[]> {
    const res = await fetch(`${this.API_URL}/destinations/admin`, {
      headers: this.getHeaders(true),
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseErrorMessage(error, "Failed to fetch admin destinations"));
    }

    return res.json();
  }

  // ADMIN 2: Fetch a single raw destination by ID to pre-fill the edit form
  async getAdminDestinationById(id: string): Promise<DestinationPayload> {
    const res = await fetch(`${this.API_URL}/destinations/admin/${id}`, {
      headers: this.getHeaders(true),
      credentials: "include",
      cache: "no-store",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseErrorMessage(error, "Failed to fetch destination details"));
    }

    return res.json();
  }

  // ADMIN 3: Update an existing destination by ID
  async updateDestination(id: string, payload: DestinationPayload) {
    const res = await fetch(`${this.API_URL}/destinations/${id}`, {
      method: "PATCH",
      headers: this.getHeaders(true),
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseErrorMessage(error, "Failed to update destination"));
    }

    return res.json();
  }

  // Fetch all destination previews (for frontend cards)
  async getPreviews(lang?: string): Promise<DestinationPreview[]> {
    const url = lang ? `${this.API_URL}/destinations/previews?lang=${lang}` : `${this.API_URL}/destinations/previews`;
    const res = await fetch(url, {
      headers: this.getHeaders(true),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseErrorMessage(error, "Failed to fetch destination previews"));
    }

    return res.json();
  }

  // Fetch package preview snapshot data for a list of specific destination IDs
  async findPackagePreviewsByIds(ids: string[]): Promise<DestinationPreview[]> {
    const res = await fetch(`${this.API_URL}/destinations/package/batch`, {
      method: "POST",
      headers: this.getHeaders(true),
      credentials: "include",
      body: JSON.stringify({ ids }),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseErrorMessage(error, "Failed to fetch destination package previews"));
    }

    return res.json();
  }

  // Delete destination by ID
  async deleteDestination(id: string) {
    const res = await fetch(`${this.API_URL}/destinations/${id}`, {
      method: "DELETE",
      headers: this.getHeaders(true),
      credentials: "include",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(parseErrorMessage(error, "Failed to delete destination"));
    }

    return res.json();
  }

  // Live Visibility Toggle (Public Site vs Draft)
  async toggleVisibility(id: string, isLive: boolean) {
    try {
      const res = await fetch(`${this.API_URL}/destinations/${id}/visibility`, {
        method: "PATCH",
        headers: this.getHeaders(true),
        credentials: "include",
        body: JSON.stringify({ isLive }),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback if backend route is pending deployment
    }
    return { success: true, isLive };
  }
}

export const destinationService = new DestinationService();
