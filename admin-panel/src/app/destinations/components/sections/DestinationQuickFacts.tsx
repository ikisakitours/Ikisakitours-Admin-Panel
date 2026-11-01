// components/destinations/DestinationQuickFacts.tsx
interface DestinationQuickFactsProps {
  bestTimeToVisit: string;
  climate: string;
  primaryLanguage: string;
  localCurrency: string;
  lat: number;
  lng: number;
  onChange: (field: string, value: string | number) => void;
}

export default function DestinationQuickFacts({
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
          <label className="block text-xs font-semibold mb-1">Best Time to Visit</label>
          <input
            type="text"
            required
            value={bestTimeToVisit}
            onChange={(e) => onChange("bestTimeToVisit", e.target.value)}
            className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. December to January"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Climate</label>
          <input
            type="text"
            required
            value={climate}
            onChange={(e) => onChange("climate", e.target.value)}
            className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Tropical, Cool highlands"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Primary Language</label>
          <input
            type="text"
            required
            value={primaryLanguage}
            onChange={(e) => onChange("primaryLanguage", e.target.value)}
            className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Japanese, English"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold mb-1">Local Currency</label>
          <input
            type="text"
            required
            value={localCurrency}
            onChange={(e) => onChange("localCurrency", e.target.value)}
            className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
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
            className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
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
            className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
  );
}