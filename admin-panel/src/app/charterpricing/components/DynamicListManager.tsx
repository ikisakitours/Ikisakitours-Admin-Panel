"use client";

import React from "react";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface DynamicListManagerProps {
  title: string;
  description?: string;
  items: string[];
  locale: string;
  placeholder?: string;
  addLabel?: string;
  accentColor?: "indigo" | "amber" | "emerald" | "rose";
  onChange: (updated: string[]) => void;
}

const BADGE_STYLES: Record<string, string> = {
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function DynamicListManager({
  title,
  description,
  items,
  locale,
  placeholder = "Enter item text…",
  addLabel = "Add Note",
  accentColor = "indigo",
  onChange,
}: DynamicListManagerProps) {
  const langLabel = locale.toUpperCase();

  const handleUpdate = (index: number, value: string) => {
    const next = [...items];
    next[index] = value;
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...items, ""]);
  };

  const handleDelete = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  };

  return (
    <div className="space-y-3 pt-4 border-t border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {title} ({langLabel})
            </h3>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                BADGE_STYLES[accentColor] ?? BADGE_STYLES.indigo
              }`}
            >
              {items.length}
            </span>
          </div>
          {description && (
            <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>
          )}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-all shadow-sm cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" /> {addLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-center bg-slate-50/70 border border-dashed border-slate-200 rounded-xl">
          <p className="text-xs text-slate-400">
            No items for <strong>{langLabel}</strong> yet. Click &quot;{addLabel}&quot; to add one.
          </p>
        </div>
      ) : (
        <div className="space-y-2 bg-slate-50/60 p-3.5 rounded-xl border border-slate-200/70">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs"
            >
              <span className="mt-2 w-5 text-center text-[10px] font-mono font-bold text-slate-400 shrink-0">
                {idx + 1}.
              </span>

              <textarea
                rows={2}
                value={item}
                onChange={(e) => handleUpdate(idx, e.target.value)}
                placeholder={`${placeholder} (${langLabel}) #${idx + 1}`}
                className="flex-1 text-xs border border-slate-200 rounded-lg p-2 outline-none bg-white resize-y min-h-9 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100 transition-all leading-relaxed"
              />

              <div className="flex items-center gap-1 shrink-0 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleMove(idx, -1)}
                  disabled={idx === 0}
                  title="Move up"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 rounded-lg transition-all cursor-pointer"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(idx, 1)}
                  disabled={idx === items.length - 1}
                  title="Move down"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-30 rounded-lg transition-all cursor-pointer"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(idx)}
                  title="Delete item"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

