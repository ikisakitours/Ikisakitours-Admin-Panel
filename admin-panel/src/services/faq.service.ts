export interface FaqPayload {
  category: Record<string, string>;
  question: Record<string, string>;
  answer: Record<string, string>;
}

export interface FaqItem extends FaqPayload {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

class FaqService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // PUBLIC: Fetch all FAQs (client-side)
  async getFaqs() {
    const res = await fetch(`${this.API_URL}/faqs`);

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch FAQs");
    }

    return res.json();
  }

  // ADMIN: Fetch all raw multilingual FAQs for the admin panel table
  async getAdminFaqs(): Promise<FaqItem[]> {
    const res = await fetch(`${this.API_URL}/faqs/admin`);

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch admin FAQs");
    }

    return res.json();
  }

  // ADMIN: Fetch a single FAQ by ID to pre-fill the edit form
  async getAdminFaqById(id: string): Promise<FaqItem> {
    const res = await fetch(`${this.API_URL}/faqs/admin/${id}`);

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch FAQ details");
    }

    return res.json();
  }

  // Create a new FAQ with multilingual records
  async createFaq(payload: FaqPayload, _adminApiKey?: string) {
    const res = await fetch(`${this.API_URL}/faqs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create FAQ");
    }

    return res.json();
  }

  // ADMIN: Update an existing FAQ by ID
  async updateFaq(id: string, payload: Partial<FaqPayload>) {
    const res = await fetch(`${this.API_URL}/faqs/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to update FAQ");
    }

    return res.json();
  }

  // Delete FAQ by ID
  async deleteFaq(id: string) {
    const res = await fetch(`${this.API_URL}/faqs/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete FAQ");
    }

    return res.json();
  }
}

export const faqService = new FaqService();