'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { FaqItem, faqService } from '@/services/faq.service';
// Adjust this path if your FaqForm is located elsewhere
import FaqForm from '@/app/faqs/components/FaqForm';

export default function EditFaqPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [faq, setFaq] = useState<FaqItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const loadFaq = async () => {
      try {
        setLoading(true);
        const data = await faqService.getAdminFaqById(id);
        setFaq(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load FAQ details');
      } finally {
        setLoading(false);
      }
    };

    loadFaq();
  }, [id]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <Link
          href="/managefaqs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Manage FAQs
        </Link>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
          <p className="text-sm font-mono text-slate-500 animate-pulse">
            Loading FAQ data...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
          <p className="text-sm font-semibold text-red-700">{error}</p>
        </div>
      ) : (
        <FaqForm
          initialData={faq}
          onSuccess={() => router.push('/managefaqs')}
        />
      )}
    </div>
  );
}