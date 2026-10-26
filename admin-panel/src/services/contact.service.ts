export interface ContactItem {
  id: string;
  inquiryType: string;
  date: string;
  status: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  tourInterest?: string;
}

class ContactService {
  private API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Fetch all contact submissions for the admin panel
  async getContacts(): Promise<ContactItem[]> {
    const res = await fetch(`${this.API_URL}/contacts`);

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to fetch contact inquiries");
    }

    return res.json();
  }

  // Delete a contact inquiry by ID
  async deleteContact(id: string) {
    const res = await fetch(`${this.API_URL}/contacts/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || "Failed to delete contact inquiry");
    }

    return res.json();
  }
}

export const contactService = new ContactService();