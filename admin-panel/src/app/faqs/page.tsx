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
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">FAQ Management</h1>
      
      {/* Upload Form Component */}
      <FaqForm onFaqCreated={fetchFaqs} />

      {/* Existing FAQs List Component */}
      {loading ? (
        <p className="text-neutral-400">Loading FAQs...</p>
      ) : (
        <FaqList faqs={faqs} onDeleted={fetchFaqs} />
      )}
    </div>
  );
}