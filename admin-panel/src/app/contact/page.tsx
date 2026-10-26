"use client";

import { useState, useEffect } from "react";
import ContactInquiryCard, { ContactInquiryProps } from "./components/ContactInquiryCard";
import { contactService } from "@/services/contact.service";

export default function Contact() {
  const [inquiries, setInquiries] = useState<ContactInquiryProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

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
      // Refresh list after successful deletion
      fetchContacts();
    } catch (err) {
      alert("Error deleting contact inquiry");
    }
  };

  const filteredInquiries = inquiries.filter((inquiry) => {
    if (filter === "all") return true;
    return inquiry.inquiryType === filter;
  });

  return (
    <main className="w-full py-8 px-4 sm:px-6 max-w-5xl mx-auto font-sans">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
            Contact Form Inquiries
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            View and respond to inquiries submitted via the public contact form.
          </p>
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label htmlFor="inquiry-filter" className="text-xs font-semibold text-slate-500 whitespace-nowrap font-mono">
            Filter By:
          </label>
          <select
            id="inquiry-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-xs font-semibold bg-white text-slate-700 border border-slate-200 rounded-xl px-3 py-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer font-mono"
          >
            <option value="all">All Inquiries ({inquiries.length})</option>
            <option value="tour_inquiry">Tour Inquiry & Availability</option>
            <option value="services">Services</option>
            <option value="general">General Questions</option>
            <option value="partnership_media">Partnership & Media</option>
            <option value="others">Others</option>
          </select>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-slate-500 font-mono text-sm">Loading inquiries...</p>
        ) : filteredInquiries.length > 0 ? (
          filteredInquiries.map((inquiry) => (
            <ContactInquiryCard
              key={inquiry.id}
              {...inquiry}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300">
            <p className="text-sm font-medium text-slate-500 font-mono">
              No inquiries found for this category.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}