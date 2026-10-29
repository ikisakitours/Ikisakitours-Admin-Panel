"use client";

import { useEffect, useState } from "react";
import { packageService, PackageListItem } from "@/services/package.service";
import { Edit2, Trash2, RefreshCw } from "lucide-react";

interface Props {
  onEdit: (slug: string) => void;
}

export function PackagesTable({ onEdit }: Props) {
  const [packages, setPackages] = useState<PackageListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const fetchPackages = async () => {
    setLoading(true);
    try {
      const data = await packageService.getAllPackages();
      setPackages(data);
    } catch (err: any) {
      console.error("Failed to load packages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleDelete = async (slug: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingSlug(slug);
    try {
      await packageService.deletePackage(slug);
      setPackages((prev) => prev.filter((p) => p.slug !== slug));
    } catch (err: any) {
      alert(`Failed to delete package: ${err.message}`);
    } finally {
      setDeletingSlug(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          All Stored Packages ({packages.length})
        </span>
        <button
          onClick={fetchPackages}
          className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition-all cursor-pointer"
          title="Refresh List"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {loading ? (
        <div className="p-10 text-center text-xs text-slate-500">
          Loading stored packages...
        </div>
      ) : packages.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400">
          No packages found. Create one using the "Add New Package" menu!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Title & Slug</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {packages.map((pkg) => (
                <tr key={pkg.slug} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {pkg.title}
                    <span className="block text-[11px] font-normal text-slate-400 font-mono mt-0.5">
                      /{pkg.slug}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => onEdit(pkg.slug)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-semibold rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      type="button"
                      disabled={deletingSlug === pkg.slug}
                      onClick={() => handleDelete(pkg.slug, pkg.title)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-all inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> {deletingSlug === pkg.slug ? "..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}