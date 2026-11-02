// components/destinations/DestinationQuickFacts.tsx
interface DestinationQuickFactsProps {
  language: string;
  bestTimeToVisit: Record<string, string>;
  climate: Record<string, string>;
  primaryLanguage: Record<string, string>;
  localCurrency: Record<string, string>;
  lat: number;
  lng: number;
  onChange: (field: string, value: string | number) => void;
}

export default function DestinationQuickFacts({
  language,
  bestTimeToVisit,
  climate,
  primaryLanguage,
  localCurrency,
  lat,
  lng,
  onChange,
}: DestinationQuickFactsProps) {
  return (
    <div className="space-y-4">
      {/* Grid Quick Facts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">
            Best Time to Visit ({language.toUpperCase()})
          </label>
          <input
            type="text"
            required
            value={bestTimeToVisit[language] || ""}
            onChange={(e) => onChange("bestTimeToVisit", e.target.value)}
            className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700"
            placeholder="e.g. December to January"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">
            Climate ({language.toUpperCase()})
          </label>
          <input
            type="text"
            required
            value={climate[language] || ""}
            onChange={(e) => onChange("climate", e.target.value)}
            className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700"
            placeholder="e.g. Tropical, Cool highlands"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">
            Primary Language ({language.toUpperCase()})
          </label>
          <input
            type="text"
            required
            value={primaryLanguage[language] || ""}
            onChange={(e) => onChange("primaryLanguage", e.target.value)}
            className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700"
            placeholder="e.g. Japanese, English"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">
            Local Currency ({language.toUpperCase()})
          </label>
          <input
            type="text"
            required
            value={localCurrency[language] || ""}
            onChange={(e) => onChange("localCurrency", e.target.value)}
            className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700"
            placeholder="e.g. Japanese Yen (JPY)"
          />
        </div>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            required
            value={lat}
            onChange={(e) => onChange("lat", parseFloat(e.target.value))}
            className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            required
            value={lng}
            onChange={(e) => onChange("lng", parseFloat(e.target.value))}
            className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700"
          />
        </div>
      </div>
    </div>
  );
}