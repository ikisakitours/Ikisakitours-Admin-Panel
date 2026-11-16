'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { destinationService, DestinationPayload } from '@/services/destination.service';
import { Edit2, Trash2, RefreshCw, Eye } from 'lucide-react';

interface DestinationListItem extends DestinationPayload {
  id: string;
}

export function DestinationList() {
  const [destinations, setDestinations] = useState<DestinationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const data = await destinationService.getAdminDestinations();
      // Safely filter and cast data so TypeScript knows every item has a valid id string
      setDestinations(data.filter((d): d is DestinationListItem => Boolean(d.id)));
    } catch (err: any) {
      console.error('Failed to load destinations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDestinations();
  }, []);

  const resolveTitle = (titleField: any): string => {
    if (!titleField) return 'Untitled Destination';
    if (typeof titleField === 'string') return titleField;
    return titleField['en'] || Object.values(titleField)[0] || 'Untitled Destination';
  };

  const resolveProvince = (provinceField: any): string => {
    if (!provinceField) return 'N/A';
    if (typeof provinceField === 'string') return provinceField;
    return provinceField['en'] || Object.values(provinceField)[0] || 'N/A';
  };

  const handleDelete = async (id: string, rawTitle: any) => {
    const displayTitle = resolveTitle(rawTitle);
    if (!confirm(`Are you sure you want to delete "${displayTitle}"?`)) return;

    setDeletingId(id);
    try {
      await destinationService.deleteDestination(id);
      setDestinations((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      alert(`Failed to delete destination: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 dark:text-gray-300 uppercase tracking-wider">
          All Stored Destinations ({destinations.length})
        </span>
        <button
          type="button"
          onClick={fetchDestinations}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-500 dark:text-gray-400 rounded-lg transition-all cursor-pointer"
          title="Refresh List"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center text-xs text-slate-500 dark:text-gray-400">Loading stored destinations...</div>
      ) : destinations.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400 dark:text-gray-500">
          No destinations found. Create one above!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-gray-800/50 border-b border-slate-100 dark:border-gray-800 text-slate-500 dark:text-gray-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Title, Province & Slug</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800 text-slate-700 dark:text-gray-300">
              {destinations.map((dest) => {
                const titleString = resolveTitle(dest.title);
                const provinceString = resolveProvince(dest.province);
                return (
                  <tr key={dest.id} className="hover:bg-slate-50/80 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-gray-100 block">{titleString}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-slate-500 dark:text-gray-400 font-medium">Province: {provinceString}</span>
                        <span className="text-[11px] font-normal text-slate-400 dark:text-gray-500 font-mono">
                          /{dest.slug}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <a
                        href={`https://www.ikisakitours.com/en/destination/${dest.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View
                      </a>
                      <Link
                        href={`/managedestinations/${dest.id}/edit`}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 font-semibold rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer inline-block"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button
                        type="button"
                        disabled={deletingId === dest.id}
                        onClick={() => handleDelete(dest.id, dest.title)}
                        className="px-3 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 font-semibold rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingId === dest.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}