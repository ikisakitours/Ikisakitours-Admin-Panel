'use client';

import { faqService } from '@/services/faq.service';
import { useState } from 'react';

export default function FaqForm({ onFaqCreated }: { onFaqCreated: () => void }) {
  const [category, setCategory] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await faqService.createFaq({ category, question, answer }, '');

      setCategory('');
      setQuestion('');
      setAnswer('');
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
              Add New FAQ
            </h2>
            <p className="text-slate-500 text-sm font-mono mt-1">
              Configure FAQ category, question, and detailed answer.
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
            <span>FAQ Details</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Category *
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. General, Booking, Tours"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Question *
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="e.g. What is the cancellation policy?"
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Answer *
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Provide a thorough, helpful answer..."
              rows={4}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>
        </div>
      </form>
    </div>
  );
}