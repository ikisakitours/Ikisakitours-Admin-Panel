'use client';

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
      const adminApiKey = localStorage.getItem('adminApiKey') || ''; // Or your API key storage method
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/faqs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-api-key': adminApiKey,
        },
        body: JSON.stringify({ category, question, answer }),
      });

      if (!res.ok) throw new Error('Failed to create FAQ');

      setCategory('');
      setQuestion('');
      setAnswer('');
      onFaqCreated(); // Refresh the list
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] p-6 rounded-xl border border-neutral-800 shadow-lg mb-8">
      <h2 className="text-xl font-semibold text-white mb-4">Add New FAQ</h2>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Category *</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. General, Booking, Tours"
            required
            className="w-full bg-[#111] border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Question *</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type the question here..."
            required
            className="w-full bg-[#111] border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wider mb-2">Answer *</label>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type the detailed answer here..."
            rows={4}
            required
            className="w-full bg-[#111] border border-neutral-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#d4af37]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#d4af37] text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-[#c5a028] transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish FAQ'}
        </button>
      </form>
    </div>
  );
}