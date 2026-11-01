// components/destinations/DestinationBasicInfo.tsx
import { DestinationLanguage } from "@/services/destination.service";

interface DestinationBasicInfoProps {
  title: string;
  slug: string;
  language: string;
  province: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSlugChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onLanguageChange: (lang: string) => void;
  onProvinceChange: (province: string) => void;
}

export default function DestinationBasicInfo({
  title,
  slug,
  language,
  province,
  onTitleChange,
  onSlugChange,
  onLanguageChange,
  onProvinceChange,
}: DestinationBasicInfoProps) {
  return (
    <div className="space-y-4">
      {/* Target Language */}
      <div>
        <label className="block text-xs font-semibold mb-1">Target Language</label>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="w-full text-xs border rounded-lg p-2.5 bg-white outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="en">English (en)</option>
          <option value="ja">Japanese (ja)</option>
          <option value="fr">French (fr)</option>
        </select>
      </div>

      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold mb-1">Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={onTitleChange}
            className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
            placeholder="e.g. Kyoto / 京都 / Paris"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">
            URL Slug <span className="text-slate-400 font-normal">(Auto-generated)</span>
          </label>
          <input
            type="text"
            value={slug}
            onChange={onSlugChange}
            className="w-full text-xs border rounded-lg p-2.5 bg-slate-50 outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-slate-600"
            placeholder="kyoto"
          />
        </div>
      </div>

      {/* Province */}
      <div>
        <label className="block text-xs font-semibold mb-1">Province / Region</label>
        <input
          type="text"
          required
          value={province}
          onChange={(e) => onProvinceChange(e.target.value)}
          className="w-full text-xs border rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="e.g. Central Province"
        />
      </div>
    </div>
  );
}