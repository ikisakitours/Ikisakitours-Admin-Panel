'use client';

import { faqService } from '@/services/faq.service';
import { useState } from 'react';
import { Plus } from 'lucide-react';

export default function FaqForm({ onFaqCreated }: { onFaqCreated: () => void }) {
  // Dynamic language management state
  const [activeLang, setActiveLang] = useState<string>('en');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(['en', 'ja']);

  const [formData, setFormData] = useState({
    category: { en: '', ja: '' } as Record<string, string>,
    question: { en: '', ja: '' } as Record<string, string>,
    answer: { en: '', ja: '' } as Record<string, string>,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addCustomLanguage = () => {
    const lang = prompt("Enter new language code (e.g. fr, de, es, zh):")?.toLowerCase().trim();
    if (lang && !availableLanguages.includes(lang)) {
      setAvailableLanguages((prev) => [...prev, lang]);
      setActiveLang(lang);
      // Initialize empty strings for the new language across fields
      setFormData((prev) => ({
        category: { ...prev.category, [lang]: '' },
        question: { ...prev.question, [lang]: '' },
        answer: { ...prev.answer, [lang]: '' },
      }));
    }
  };

  const handleFieldChange = (
    field: 'category' | 'question' | 'answer',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [activeLang]: value,
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
      setActiveLang('en');
      setAvailableLanguages(['en', 'ja']);
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
        <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              Add New FAQ (Multilingual)
            </h2>
            <p className="text-slate-500 text-sm font-mono mt-1">
              Configure FAQ category, question, and detailed answer across dynamic languages.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Dynamic Language Switcher with Add Button */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 flex-wrap">
              {availableLanguages.map((langKey) => (
                <button
                  key={langKey}
                  type="button"
                  onClick={() => setActiveLang(langKey)}
                  className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all uppercase ${activeLang === langKey
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  {langKey}
                </button>
              ))}
              <button
                type="button"
                onClick={addCustomLanguage}
                className="p-1.5 text-slate-500 hover:text-indigo-600 text-xs flex items-center gap-0.5 font-semibold cursor-pointer rounded-lg hover:bg-slate-200 transition"
                title="Add new language code"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              {loading ? 'Publishing...' : 'Publish FAQ'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 font-mono text-sm">
            {error}
          </div>
        )}

        {/* Form Body */}
        <div className="space-y-6">
          <div className="flex items-center justify-between text-indigo-600 font-mono font-semibold text-sm">
            <div className="flex items-center gap-2">
              <span>FAQ Details</span>
            </div>
            <span className="text-xs text-slate-400 font-normal">
              Editing language: <strong className="uppercase text-slate-600">{activeLang}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Category */}
            <div className="space-y-3 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <label className="block text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
                Category ({activeLang.toUpperCase()}) *
              </label>
              <div>
                <input
                  type="text"
                  value={formData.category[activeLang] || ''}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  placeholder={`e.g. General, Booking (${activeLang.toUpperCase()})`}
                  required={activeLang === 'en'}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            {/* Question */}
            <div className="space-y-3 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <label className="block text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
                Question ({activeLang.toUpperCase()}) *
              </label>
              <div>
                <input
                  type="text"
                  value={formData.question[activeLang] || ''}
                  onChange={(e) => handleFieldChange('question', e.target.value)}
                  placeholder={`e.g. What is the cancellation policy? (${activeLang.toUpperCase()})`}
                  required={activeLang === 'en'}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>

            {/* Answer */}
            <div className="space-y-3 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
              <label className="block text-xs font-mono font-semibold text-slate-700 uppercase tracking-wider">
                Answer ({activeLang.toUpperCase()}) *
              </label>
              <div>
                <textarea
                  value={formData.answer[activeLang] || ''}
                  onChange={(e) => handleFieldChange('answer', e.target.value)}
                  placeholder={`Provide a thorough, helpful answer in ${activeLang.toUpperCase()}...`}
                  rows={4}
                  required={activeLang === 'en'}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}