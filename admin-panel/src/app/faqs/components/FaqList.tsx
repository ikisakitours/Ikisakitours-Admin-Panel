'use client';

import { useState, useCallback } from "react";
import { faqService } from "@/services/faq.service";
import { AdminDeleteModal } from "@/components/AdminDeleteModal";
import { AdminToast, type AdminToastState, type ToastVariant } from "@/components/AdminToast";

export interface FaqItem {
  id: string;
  category: Record<string, string>;
  question: Record<string, string>;
  answer: Record<string, string>;
}

export default function FaqList({ faqs, onDeleted }: { faqs: FaqItem[]; onDeleted: () => void }) {
  const [faqToDelete, setFaqToDelete] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [toast, setToast] = useState<AdminToastState | null>(null);

  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const confirmDelete = async () => {
    if (!faqToDelete) return;

    try {
      setDeleting(true);
      await faqService.deleteFaq(faqToDelete.id);
      notify("FAQ deleted successfully!", "success");
      setFaqToDelete(null);
      onDeleted();
    } catch (err) {
      notify("Error deleting FAQ", "error");
    } finally {
      setDeleting(false);
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
    <div className="space-y-6">
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
            <div className="space-y-4 flex-1">
              {/* Category Badges (EN / JA) */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-block bg-indigo-50 text-indigo-600 text-xs px-3 py-1 rounded-lg font-mono font-medium">
                  EN Category: {faq.category?.en || '—'}
                </span>
                <span className="inline-block bg-purple-50 text-purple-600 text-xs px-3 py-1 rounded-lg font-mono font-medium">
                  JA Category: {faq.category?.ja || '—'}
                </span>
              </div>

              {/* Questions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">Question (EN)</span>
                  <h3 className="text-slate-900 font-bold text-base font-mono tracking-tight mt-1">
                    {faq.question?.en || '—'}
                  </h3>
                </div>
                <div>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">Question (JA)</span>
                  <h3 className="text-slate-900 font-bold text-base font-mono tracking-tight mt-1">
                    {faq.question?.ja || '—'}
                  </h3>
                </div>
              </div>

              {/* Answers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">Answer (EN)</span>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap font-mono leading-relaxed mt-1">
                    {faq.answer?.en || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">Answer (JA)</span>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap font-mono leading-relaxed mt-1">
                    {faq.answer?.ja || '—'}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() =>
                setFaqToDelete({
                  id: faq.id,
                  title: faq.question?.en || faq.question?.ja || `FAQ #${faq.id.slice(0, 6)}`,
                })
              }
              className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 rounded-xl text-xs font-mono font-medium transition duration-200 shrink-0 cursor-pointer"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Unified Luxury AdminDeleteModal */}
      <AdminDeleteModal
        isOpen={Boolean(faqToDelete)}
        title="Delete FAQ"
        description="Are you sure you want to delete this FAQ item? This action will permanently remove it from the system."
        itemTitle={faqToDelete?.title}
        confirmLabel="Delete FAQ"
        loading={deleting}
        onClose={() => setFaqToDelete(null)}
        onConfirm={confirmDelete}
      />

      {/* Executive Toast Notification */}
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}