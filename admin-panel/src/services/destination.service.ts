export interface CreateDestinationPayload {
  title: string;
  slug?: string;
  summary: string;
  description: string;
  highlights: string[];
  images: string[];
  bestTimeToVisit: string;
  climate: string;
  primaryLanguage: string;
  localCurrency: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface DestinationPreview {
  id: string;
  title: string;
  slug: string;
  summary: string;
  heroImage: string | null;
  bestTimeToVisit: string;
  climate: string;
}

export interface DestinationResponse extends CreateDestinationPayload {
  id: string;
  createdAt: string;
  updatedAt: string;
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://ikisakitours-backend.vercel.app';

export const DestinationService = {
  // 1. Fetch small previews for admin dashboard list
  async getPreviews(): Promise<DestinationPreview[]> {
    const res = await fetch(`${API_URL}/api/destinations/previews`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error('Failed to fetch destination previews.');
    }

    return res.json();
  },

  // 2. Create a new destination
  async createDestination(payload: CreateDestinationPayload): Promise<DestinationResponse> {
    const res = await fetch(`${API_URL}/api/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(
        Array.isArray(errorData.message)
          ? errorData.message.join(', ')
          : errorData.message || 'Failed to create destination.'
      );
    }

    return res.json();
  },

  // 3. Delete a destination by ID
  async deleteDestination(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/api/destinations/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error('Failed to delete destination.');
    }

    return res.json();
  },
};