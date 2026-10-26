export interface FaqPayload {
  category: string;
  question: string;
  answer: string;
}

class FaqService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Fetch all FAQs
  async getFaqs() {
    const res = await fetch(`${this.API_URL}/faqs`);

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch FAQs");
    }

    return res.json();
  }

  // Create a new FAQ (without admin API key header)
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

  // Delete FAQ by ID (without admin API key header)
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