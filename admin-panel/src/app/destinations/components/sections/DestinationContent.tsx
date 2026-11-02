// components/destinations/DestinationContent.tsx
interface DestinationContentProps {
  language: string; // Current active language tab (e.g. 'en', 'ja', etc.)
  summary: Record<string, string>;
  description: Record<string, string>;
  highlights: Record<string, string[]>;
  onSummaryChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onHighlightChange: (index: number, val: string) => void;
  onAddHighlight: () => void;
  onRemoveHighlight: (index: number) => void;
}

export default function DestinationContent({
  language,
  summary,
  description,
  highlights,
  onSummaryChange,
  onDescriptionChange,
  onHighlightChange,
  onAddHighlight,
  onRemoveHighlight,
}: DestinationContentProps) {
  // Get highlights array for the current language, defaulting to an empty array
  const currentHighlights = highlights[language] || [];

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div>
        <label className="block text-xs font-semibold mb-1">
          Summary / Excerpt ({language.toUpperCase()})
        </label>
        <textarea
          rows={2}
          required
          value={summary[language] || ""}
          onChange={(e) => onSummaryChange(e.target.value)}
          className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700"
          placeholder="Brief overview of the destination..."
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold mb-1">
          Detailed Description ({language.toUpperCase()})
        </label>
        <textarea
          rows={5}
          required
          value={description[language] || ""}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700"
          placeholder="In-depth information about culture, attractions, history..."
        />
      </div>

      {/* Highlights */}
      <div>
        <label className="block text-xs font-semibold mb-1">
          Key Highlights ({language.toUpperCase()})
        </label>
        {currentHighlights.map((highlight, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={highlight}
              onChange={(e) => onHighlightChange(index, e.target.value)}
              placeholder={`Highlight #${index + 1}`}
              className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700"
            />
            {currentHighlights.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveHighlight(index)}
                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 dark:bg-red-950/50 dark:text-red-400"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={onAddHighlight}
          className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-800 mt-1"
        >
          + Add Another Highlight
        </button>
      </div>
    </div>
  );
}