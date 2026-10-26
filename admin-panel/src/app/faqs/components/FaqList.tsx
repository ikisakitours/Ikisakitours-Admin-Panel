'use client';

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
      const adminApiKey = localStorage.getItem('adminApiKey') || '';
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'x-admin-api-key': adminApiKey,
        },
      });

      if (!res.ok) throw new Error('Failed to delete FAQ');
      onDeleted();
    } catch (err) {
      alert('Error deleting FAQ');
    }
  };

  if (faqs.length === 0) {
    return <p className="text-neutral-400 text-sm">No FAQs found in the database.</p>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-white mb-4">Existing FAQs</h2>
      {faqs.map((faq) => (
        <div key={faq.id} className="bg-[#1a1a1a] p-5 rounded-xl border border-neutral-800 flex justify-between items-start gap-4">
          <div className="space-y-2">
            <span className="inline-block bg-[#2a2a2a] text-[#d4af37] text-xs px-2.5 py-1 rounded-md font-medium">
              {faq.category}
            </span>
            <h3 className="text-white font-medium text-lg">{faq.question}</h3>
            <p className="text-neutral-400 text-sm whitespace-pre-wrap">{faq.answer}</p>
          </div>
          <button
            onClick={() => handleDelete(faq.id)}
            className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-sm transition duration-200 shrink-0"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}