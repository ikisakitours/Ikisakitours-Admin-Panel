export interface DestinationPayload {
  title: string;
  slug?: string;
  summary: string;
  description: string;
  highlights: string[];
  images?: string[];
  bestTimeToVisit: string;
  climate: string;
  primaryLanguage: string;
  localCurrency: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

class DestinationService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Step 1: Upload raw image files to Cloudflare R2 batch endpoint (same pattern as blogService)
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
  async getPreviews() {
    const res = await fetch(`${this.API_URL}/destinations/previews`);

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || "Failed to fetch destination previews");
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