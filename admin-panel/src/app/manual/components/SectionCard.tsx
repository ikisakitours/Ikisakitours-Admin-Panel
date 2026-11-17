"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ManualIconKey } from "../data/manualMockData";
import { ManualIcon } from "./ManualIcon";

interface SectionCardProps {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  icon: ManualIconKey;
  actionHref?: string;
  actionLabel?: string;
  children: React.ReactNode;
}

export function SectionCard({
  id,
  number,
  title,
  subtitle,
  icon,
  actionHref,
  actionLabel,
  children,
}: SectionCardProps) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl bg-white border border-slate-200 p-6 shadow-xs space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
            <ManualIcon name={icon} className="w-5 h-5" />
          </div>
          <div>
            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
              Section {number}
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-1">{title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors self-start"
          >
            {actionLabel} <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div>{children}</div>
    </section>
  );
}
