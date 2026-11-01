// components/destinations/DestinationContent.tsx
interface DestinationContentProps {
  summary: string;
  description: string;
  highlights: string[];
  onSummaryChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onHighlightChange: (index: number, val: string) => void;
  onAddHighlight: () => void;
  onRemoveHighlight: (index: number) => void;
}

export default function DestinationContent({
  summary,
  description,
  highlights,
  onSummaryChange,
  onDescriptionChange,
  onHighlightChange,
  onAddHighlight,
  onRemoveHighlight,
}: DestinationContentProps) {
  return (
    <div className="space-y-4">
      {/* Summary */}
      <div>
        <label className="block text-xs font-semibold mb-1">Summary / Excerpt</label>
        <textarea
          rows={2}
          required
          value={summary}
          onChange={(e) => onSummaryChange(e.target.value)}
          className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Brief overview of the destination..."
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-semibold mb-1">Detailed Description</label>
        <textarea
          rows={5}
          required
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="In-depth information about culture, attractions, history..."
        />
      </div>

      {/* Highlights */}
      <div>
        <label className="block text-xs font-semibold mb-1">Key Highlights</label>
        {highlights.map((highlight, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={highlight}
              onChange={(e) => onHighlightChange(index, e.target.value)}
              placeholder={`Highlight #${index + 1}`}
              className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            />
            {highlights.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveHighlight(index)}
                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200"
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={onAddHighlight}
          className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 mt-1"
        >
          + Add Another Highlight
        </button>
      </div>
    </div>
  );
}