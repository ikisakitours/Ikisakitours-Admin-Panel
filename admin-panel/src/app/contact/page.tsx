"use client";

import { useState } from "react";
import ContactInquiryCard, { ContactInquiryProps } from "./components/ContactInquiryCard";

const MOCK_INQUIRIES: ContactInquiryProps[] = [
  {
    id: "inq_1",
    fullName: "Alexander Knight",
    email: "alex@example.com",
    phone: "+94 77 123 4567",
    inquiryType: "tour_inquiry",
    subject: "Availability for Sigiriya & Kandy 3-Day Tour in September",
    message: "Hi, I would like to check if you have an available driver and guide for a 3-day trip starting September 12th from Colombo.",
    createdAt: "Aug 03, 2026",
    status: "pending",
  },
  {
    id: "inq_2",
    fullName: "Sophia Martinez",
    email: "sophia.m@example.com",
    phone: "+1 305 555 0199",
    inquiryType: "services",
    subject: "Luxury SUV Airport Transfer Service",
    message: "Hello team, do you offer airport pickup in a luxury SUV for a group of 4 with heavy luggage? What would be the price to Ella?",
    createdAt: "Aug 02, 2026",
    status: "contacted",
  },
  {
    id: "inq_3",
    fullName: "David Miller",
    email: "david.m@partners.com",
    phone: "+44 20 7946 0888",
    inquiryType: "partnership_media",
    subject: "Travel Blog Collaboration & Media Kit Inquiry",
    message: "Greetings, we are a UK travel media team looking to showcase unique experiences in Sri Lanka. We'd love to discuss potential sponsorship or affiliate partnerships.",
    createdAt: "Jul 30, 2026",
    status: "completed",
  },
  {
    id: "inq_4",
    fullName: "Liam Wilson",
    email: "liam.w@example.com",
    phone: "+61 4 9157 0156",
    inquiryType: "general",
    subject: "Visa details and best months to travel",
    message: "What is the best month to visit the South Coast for good surfing conditions? Also, do you handle ETA visa processing?",
    createdAt: "Jul 28, 2026",
    status: "pending",
  },
];

export default function Contact() {
  const [filter, setFilter] = useState<string>("all");

  const filteredInquiries = MOCK_INQUIRIES.filter((inquiry) => {
    if (filter === "all") return true;
    return inquiry.inquiryType === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Contact Form Inquiries
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              View and respond to inquiries submitted via the public contact form.
            </p>
          </div>

          {/* Filter Dropdown matching exact frontend categories */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <label htmlFor="inquiry-filter" className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Filter By:
            </label>
            <select
              id="inquiry-filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-xs font-semibold bg-white text-slate-700 border border-slate-200 rounded-lg px-3 py-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
            >
              <option value="all">All Inquiries ({MOCK_INQUIRIES.length})</option>
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
          {filteredInquiries.length > 0 ? (
            filteredInquiries.map((inquiry) => (
              <ContactInquiryCard key={inquiry.id} {...inquiry} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-sm font-medium text-slate-500">
                No inquiries found for this category.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}