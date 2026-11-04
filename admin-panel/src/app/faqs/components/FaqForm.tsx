'use client';

import { faqService } from '@/services/faq.service';
import { useState } from 'react';

export default function FaqForm({ onFaqCreated }: { onFaqCreated: () => void }) {
  const [formData, setFormData] = useState({
    category: { en: '', ja: '' },
    question: { en: '', ja: '' },
    answer: { en: '', ja: '' },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFieldChange = (
    field: 'category' | 'question' | 'answer',
    lang: 'en' | 'ja',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await faqService.createFaq(formData, '');

      setFormData({
        category: { en: '', ja: '' },
        question: { en: '', ja: '' },
        answer: { en: '', ja: '' },
      });
      onFaqCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create FAQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-8 font-sans">
      <form onSubmit={handleSubmit}>
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              Add New FAQ (Multilingual)
            </h2>
            <p className="text-slate-500 text-sm font-mono mt-1">
              Configure FAQ category, question, and detailed answer in English and Japanese.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50 shrink-0"
          >
            {loading ? 'Publishing...' : 'Publish FAQ'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-mono text-sm">
            {error}
          </div>
        )}

        {/* Form Body */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 font-mono font-semibold text-sm">
            <span>🏷️</span>
            <span>FAQ Details (EN / JA)</span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Category */}
            <div className="space-y-3 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <label className="block text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
                Category *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">English (en)</span>
                  <input
                    type="text"
                    value={formData.category.en}
                    onChange={(e) => handleFieldChange('category', 'en', e.target.value)}
                    placeholder="e.g. General, Booking"
                    required
                    className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">Japanese (ja)</span>
                  <input
                    type="text"
                    value={formData.category.ja}
                    onChange={(e) => handleFieldChange('category', 'ja', e.target.value)}
                    placeholder="例: 一般、予約"
                    required
                    className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Question */}
            <div className="space-y-3 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <label className="block text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
                Question *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">English (en)</span>
                  <input
                    type="text"
                    value={formData.question.en}
                    onChange={(e) => handleFieldChange('question', 'en', e.target.value)}
                    placeholder="e.g. What is the cancellation policy?"
                    required
                    className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">Japanese (ja)</span>
                  <input
                    type="text"
                    value={formData.question.ja}
                    onChange={(e) => handleFieldChange('question', 'ja', e.target.value)}
                    placeholder="例: キャンセルポリシーは何ですか？"
                    required
                    className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>
              </div>
            </div>

            {/* Answer */}
            <div className="space-y-3 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <label className="block text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
                Answer *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">English (en)</span>
                  <textarea
                    value={formData.answer.en}
                    onChange={(e) => handleFieldChange('answer', 'en', e.target.value)}
                    placeholder="Provide a thorough, helpful answer in English..."
                    rows={4}
                    required
                    className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase">Japanese (ja)</span>
                  <textarea
                    value={formData.answer.ja}
                    onChange={(e) => handleFieldChange('answer', 'ja', e.target.value)}
                    placeholder="日本語で詳しく役立つ回答を入力してください..."
                    rows={4}
                    required
                    className="mt-1 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}