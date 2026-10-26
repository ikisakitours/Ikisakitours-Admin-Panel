export interface FaqPayload {
  category: string;
  question: string;
  answer: string;
}

class FaqService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Fetch all FAQs (public endpoint for client side)
  async getFaqs() {
    const res = await fetch(`${this.API_URL}/api/faqs`);

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch FAQs");
    }

    return res.json();
  }

  // Create a new FAQ (admin endpoint requiring API key)
  async createFaq(payload: FaqPayload, adminApiKey: string) {
    const res = await fetch(`${this.API_URL}/api/faqs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-api-key": adminApiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to create FAQ");
    }

    return res.json();
  }

  // Delete FAQ by ID (admin endpoint requiring API key)
  async deleteFaq(id: string, adminApiKey: string) {
    const res = await fetch(`${this.API_URL}/api/faqs/${id}`, {
      method: "DELETE",
      headers: {
        "x-admin-api-key": adminApiKey,
      },
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete FAQ");
    }

    return res.json();
  }
}

export const faqService = new FaqService();