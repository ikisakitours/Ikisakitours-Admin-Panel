'use client';

import { useState, useEffect } from 'react';
import FaqForm from './components/FaqForm';
import FaqList, { FaqItem } from './components/FaqList';
import { faqService } from '@/services/faq.service';

export default function FaqsAdminPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFaqs = async () => {
    try {
      const data = await faqService.getFaqs();
      setFaqs(data);
    } catch (err) {
      console.error('Failed to fetch FAQs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  return (
    <main className="w-full py-8 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Header matching your light theme design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
            FAQ Management
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Create, manage, and delete customer support questions and answers.
          </p>
        </div>
      </div>

      {/* Upload Form Component */}
      <FaqForm onFaqCreated={fetchFaqs} />

      {/* Existing FAQs List Component */}
      {loading ? (
        <p className="text-slate-500 font-mono text-sm">Loading FAQs...</p>
      ) : (
        <FaqList faqs={faqs} onDeleted={fetchFaqs} />
      )}
    </main>
  );
}