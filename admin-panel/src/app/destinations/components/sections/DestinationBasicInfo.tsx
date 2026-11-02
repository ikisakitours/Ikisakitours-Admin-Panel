// components/destinations/DestinationBasicInfo.tsx
import { DestinationLanguage } from "@/services/destination.service";

interface DestinationBasicInfoProps {
  title: Record<string, string>;
  slug: string;
  language: string; // Current active language tab (e.g. 'en', 'ja', etc.)
  availableLanguages: string[]; // Languages present in the json payload
  province: Record<string, string>;
  onTitleChange: (value: string) => void;
  onSlugChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLanguageChange: (lang: string) => void;
  onProvinceChange: (value: string) => void;
}

export default function DestinationBasicInfo({
  title,
  slug,
  language,
  availableLanguages,
  province,
  onTitleChange,
  onSlugChange,
  onLanguageChange,
  onProvinceChange,
}: DestinationBasicInfoProps) {
  return (
    <div className="space-y-4">
      {/* Target Language Selector (Dynamic based on available languages in JSON) */}
      <div>
        <label className="block text-xs font-semibold mb-1">Target Language Version</label>
        <div className="flex flex-wrap gap-2">
          {availableLanguages.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => onLanguageChange(lang)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                language === lang
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
              }`}
            >
              {lang.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">
            Title ({language.toUpperCase()})
          </label>
          <input
            type="text"
            required
            value={title[language] || ""}
            onChange={(e) => onTitleChange(e.target.value)}
            className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700"
            placeholder="e.g. Kyoto / 京都 / Paris"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            URL Slug <span className="text-slate-400 font-normal">(Shared across languages)</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={onSlugChange}
            className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-600 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300"
            placeholder="kyoto"
          />
        </div>
      </div>

      {/* Province */}
      <div>
        <label className="block text-xs font-semibold mb-1">
          Province / Region ({language.toUpperCase()})
        </label>
        <input
          type="text"
          required
          value={province[language] || ""}
          onChange={(e) => onProvinceChange(e.target.value)}
          className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500 dark:bg-gray-900 dark:border-gray-700"
          placeholder="e.g. Central Province"
        />
      </div>
    </div>
  );
}