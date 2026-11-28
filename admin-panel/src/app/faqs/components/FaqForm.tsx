'use client';

import { FaqItem, faqService } from '@/services/faq.service';
import { useState, useEffect, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useFormDraft } from '@/hooks/useFormDraft';
import { DraftRecoveryBanner } from '@/components/DraftRecoveryBanner';
import { FormReadinessDrawer, FormReadinessItem } from '@/components/FormReadinessDrawer';

interface FaqFormProps {
  initialData?: FaqItem | null;
  onFaqCreated?: () => void;
  onSuccess?: () => void;
}

export default function FaqForm({
  initialData,
  onFaqCreated,
  onSuccess,
}: FaqFormProps) {
  const isEditMode = Boolean(initialData?.id);

  // Dynamic language management state
  const [activeLang, setActiveLang] = useState<string>('en');
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(() => {
    if (initialData) {
      const langs = new Set<string>(['en', 'ja']);
      const checkObj = (obj?: Record<string, any>) => {
        if (obj) Object.keys(obj).forEach((k) => { if (k.length <= 5) langs.add(k); });
      };
      checkObj(initialData.category);
      checkObj(initialData.question);
      checkObj(initialData.answer);
      return Array.from(langs);
    }
    return ['en', 'ja'];
  });

  const [formData, setFormData] = useState<{
    category: Record<string, string>;
    question: Record<string, string>;
    answer: Record<string, string>;
  }>(() => ({
    category: { en: '', ja: '', ...(initialData?.category || {}) },
    question: { en: '', ja: '', ...(initialData?.question || {}) },
    answer: { en: '', ja: '', ...(initialData?.answer || {}) },
  }));

  // Crash-resilient draft auto-save and recovery
  const draftKey = isEditMode && initialData?.id
    ? `ikisaki_draft_faq_edit_${initialData.id}`
    : 'ikisaki_draft_faq_new';

  const {
    hasDraft,
    draftSavedAt,
    lastSaved,
    isSaving,
    restoreDraft,
    discardDraft,
    saveDraftNow,
    clearDraft,
    showLeaveConfirm,
    cancelLeave,
    confirmLeave,
  } = useFormDraft<typeof formData>({
    storageKey: draftKey,
    formData,
    setFormData: (restored) => {
      const langs = new Set<string>(["en", "ja"]);
      if (restored.question && typeof restored.question === "object") {
        Object.keys(restored.question).forEach((k) => {
          if (k.length <= 5) langs.add(k);
        });
      }
      setAvailableLanguages(Array.from(langs));
      setFormData(restored);
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Only sync if initialData changes to a DIFFERENT record after mount
  const prevInitialIdRef = useRef<string | undefined>(initialData?.id);
  useEffect(() => {
    if (initialData && initialData.id !== prevInitialIdRef.current) {
      prevInitialIdRef.current = initialData.id;
      const detectedLangs = Array.from(
        new Set([
          'en',
          'ja',
          ...Object.keys(initialData.category || {}),
          ...Object.keys(initialData.question || {}),
          ...Object.keys(initialData.answer || {}),
        ])
      );

      setAvailableLanguages(detectedLangs);
      setFormData({
        category: { en: '', ja: '', ...(initialData.category || {}) },
        question: { en: '', ja: '', ...(initialData.question || {}) },
        answer: { en: '', ja: '', ...(initialData.answer || {}) },
      });
    }
  }, [initialData]);

  const addCustomLanguage = () => {
    const lang = prompt('Enter new language code (e.g. fr, de, es, zh):')
      ?.toLowerCase()
      .trim();
    if (lang && !availableLanguages.includes(lang)) {
      setAvailableLanguages((prev) => [...prev, lang]);
      setActiveLang(lang);
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
      if (isEditMode && initialData) {
        await faqService.updateFaq(initialData.id, formData);
        clearDraft();
      } else {
        await faqService.createFaq(formData, '');
        clearDraft();
        // Reset form only when creating a new FAQ
        setFormData({
          category: { en: '', ja: '' },
          question: { en: '', ja: '' },
          answer: { en: '', ja: '' },
        });
        setActiveLang('en');
        setAvailableLanguages(['en', 'ja']);
      }

      onFaqCreated?.();
      onSuccess?.();
    } catch (err: any) {
      setError(
        err.message || (isEditMode ? 'Failed to update FAQ' : 'Failed to create FAQ')
      );
    } finally {
      setLoading(false);
    }
  };

  // Comprehensive FAQ Field Checklist
  const readinessItems: FormReadinessItem[] = [
    {
      id: "faq_cat_en",
      label: "Category (English)",
      isComplete: Boolean(formData.category?.en?.trim()),
      elementId: "faq_input_category",
      targetLang: "en",
      hint: "Topic grouping (e.g. Booking, Transport)",
    },
    {
      id: "faq_cat_ja",
      label: "Category (Japanese)",
      isComplete: Boolean(formData.category?.ja?.trim()),
      elementId: "faq_input_category",
      targetLang: "ja",
      hint: "Japanese topic grouping",
    },
    {
      id: "faq_q_en",
      label: "Question (English)",
      isComplete: Boolean(formData.question?.en?.trim()),
      elementId: "faq_input_question",
      targetLang: "en",
      hint: "Core customer question (EN)",
    },
    {
      id: "faq_q_ja",
      label: "Question (Japanese)",
      isComplete: Boolean(formData.question?.ja?.trim()),
      elementId: "faq_input_question",
      targetLang: "ja",
      hint: "Customer question in Japanese (JA)",
    },
    {
      id: "faq_a_en",
      label: "Answer (English)",
      isComplete: Boolean(formData.answer?.en?.trim()),
      elementId: "faq_input_answer",
      targetLang: "en",
      hint: "Detailed solution / response (EN)",
    },
    {
      id: "faq_a_ja",
      label: "Answer (Japanese)",
      isComplete: Boolean(formData.answer?.ja?.trim()),
      elementId: "faq_input_answer",
      targetLang: "ja",
      hint: "Detailed solution in Japanese (JA)",
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-8">
      <FormReadinessDrawer
        items={readinessItems}
        entityTitle="FAQ"
        onNavigateToField={(item) => {
          if (item.targetLang) {
            setActiveLang(item.targetLang);
          }
        }}
      />
      <form onSubmit={handleSubmit}>
        <DraftRecoveryBanner
          hasDraft={hasDraft}
          draftSavedAt={draftSavedAt}
          onRestore={restoreDraft}
          onDiscard={discardDraft}
          lastSaved={lastSaved}
          isSaving={isSaving}
          onSaveNow={saveDraftNow}
          entityName={isEditMode ? 'FAQ Edit' : 'New FAQ'}
          className="mb-6"
          showLeaveConfirm={showLeaveConfirm}
          onCancelLeave={cancelLeave}
          onConfirmLeave={confirmLeave}
        />

        {/* Header Section */}
        <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100 flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {isEditMode ? 'Edit FAQ (Multilingual)' : 'Add New FAQ (Multilingual)'}
            </h2>
            <p className="text-slate-500 text-sm font-mono mt-1">
              {isEditMode
                ? 'Update FAQ category, question, and answer across languages.'
                : 'Configure FAQ category, question, and detailed answer across dynamic languages.'}
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
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-mono font-medium text-sm px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow flex items-center gap-2 disabled:opacity-50 shrink-0 cursor-pointer"
            >
              {loading
                ? isEditMode
                  ? 'Saving...'
                  : 'Publishing...'
                : isEditMode
                  ? 'Save Changes'
                  : 'Publish FAQ'}
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
              Editing language:{' '}
              <strong className="uppercase text-slate-600">{activeLang}</strong>
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
                  id="faq_input_category"
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
                  id="faq_input_question"
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
                  id="faq_input_answer"
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