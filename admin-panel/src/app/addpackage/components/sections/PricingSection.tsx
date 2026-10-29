"use client";

import { DollarSign } from "lucide-react";
import { PackageFormData } from "../../types/package.types";

interface Props {
  formData: PackageFormData;
  setFormData: React.Dispatch<React.SetStateAction<PackageFormData>>;
}

export function PricingSection({ formData, setFormData }: Props) {
  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <DollarSign className="w-4 h-4 text-indigo-500" /> Pricing
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Base Price ($)</label>
          <input
            type="number"
            min="0"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="e.g. 450"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Discount (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
            placeholder="0 to 100"
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 outline-none"
          />
        </div>
      </div>
    </div>
  );
}