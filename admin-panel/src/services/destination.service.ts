export type DestinationLanguage = "en" | "ja" | "fr";

export interface DestinationPayload {
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

class DestinationService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Step 1: Upload raw image files to Cloudflare R2 batch endpoint
  async uploadImages(files: File[], folder: string = "destinations"): Promise<string[]> {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    formData.append("folder", folder);

    const res = await fetch(`${this.API_URL}/uploads/batch`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to upload images to R2");
    }

    const data: { urls: string[] } = await res.json();
    return data.urls;
  }

  // Step 2: Save destination payload (with R2 URLs) to database
  async createDestination(payload: DestinationPayload) {
    const res = await fetch(`${this.API_URL}/destinations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to create destination");
    }

    return res.json();
  }

  // Fetch all destination previews (for admin list or preview cards)
  async getPreviews(lang?: string): Promise<DestinationPreview[]> {
    const url = lang ? `${this.API_URL}/destinations/previews?lang=${lang}` : `${this.API_URL}/destinations/previews`;
    const res = await fetch(url);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch destination previews");
    }

    return res.json();
  }

  // Fetch package preview snapshot data for a list of specific destination IDs
  async findPackagePreviewsByIds(ids: string[]): Promise<DestinationPreview[]> {
    const res = await fetch(`${this.API_URL}/destinations/package/batch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ids }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch destination package previews");
    }

    return res.json();
  }

  // Delete destination by ID
  async deleteDestination(id: string) {
    const res = await fetch(`${this.API_URL}/destinations/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to delete destination");
    }

    return res.json();
  }
}

export const destinationService = new DestinationService();