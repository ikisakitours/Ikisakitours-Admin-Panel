'use client';

import { faqService } from "@/services/faq.service";


export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export default function FaqList({ faqs, onDeleted }: { faqs: FaqItem[]; onDeleted: () => void }) {
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await faqService.deleteFaq(id);
      onDeleted();
    } catch (err) {
      alert('Error deleting FAQ');
    }
  };

  if (faqs.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center">
        <p className="text-slate-400 font-mono text-sm">No FAQs found in the database.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-900 font-mono tracking-tight">
          Existing FAQs ({faqs.length})
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-start gap-6 transition hover:shadow-md"
          >
            <div className="space-y-3 flex-1">
              <span className="inline-block bg-indigo-50 text-indigo-600 text-xs px-3 py-1 rounded-lg font-mono font-medium">
                {faq.category}
              </span>
              <h3 className="text-slate-900 font-bold text-lg font-mono tracking-tight">
                {faq.question}
              </h3>
              <p className="text-slate-600 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {faq.answer}
              </p>
            </div>

            <button
              onClick={() => handleDelete(faq.id)}
              className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-mono font-medium transition duration-200 shrink-0"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}