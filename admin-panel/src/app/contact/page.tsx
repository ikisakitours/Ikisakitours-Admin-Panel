"use client";

import { useState, useEffect } from "react";
import ContactInquiryCard, { ContactInquiryProps } from "./components/ContactInquiryCard";
import { contactService } from "@/services/contact.service";

export default function Contact() {
  const [inquiries, setInquiries] = useState<ContactInquiryProps[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const data = await contactService.getContacts();
      
      const formattedData = data.map((item: any) => ({
        ...item,
        createdAt: item.date, 
      }));

      setInquiries(formattedData);
    } catch (err) {
      console.error("Failed to fetch contact inquiries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;

    try {
      await contactService.deleteContact(id);
      fetchContacts();
    } catch (err) {
      alert("Error deleting contact inquiry");
    }
  };

  return (
    <main className="w-full py-8 px-4 sm:px-6 max-w-5xl mx-auto font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
            Contact Form Inquiries ({inquiries.length})
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            View and respond to inquiries submitted via the public contact form.
          </p>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-slate-500 font-mono text-sm">Loading inquiries...</p>
        ) : inquiries.length > 0 ? (
          inquiries.map((inquiry) => (
            <ContactInquiryCard
              key={inquiry.id}
              {...inquiry}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300">
            <p className="text-sm font-medium text-slate-500 font-mono">
              No inquiries found in the database.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}