"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { GenericGuideSectionData } from "../data/manualMockData";
import { SectionCard } from "./SectionCard";
import { ManualIcon } from "./ManualIcon";

interface GenericModuleSectionProps {
  section: GenericGuideSectionData;
}

export function GenericModuleSection({ section }: GenericModuleSectionProps) {
  const gridClass =
    section.blocks.length === 1
      ? "grid-cols-1"
      : "grid-cols-1 lg:grid-cols-2";

  return (
    <SectionCard
      id={section.id}
      number={section.number}
      title={section.title}
      subtitle={section.subtitle}
      icon={section.icon}
      actionHref={section.actionHref}
      actionLabel={section.actionLabel}
    >
      <div className="space-y-4">
        <div className={`grid ${gridClass} gap-4`}>
          {section.blocks.map((block, blockIdx) => {
            const spanFullWidth =
              section.blocks.length === 3 && blockIdx === 2 ? "lg:col-span-2" : "";

            return (
              <div
                key={block.title}
                className={`rounded-xl border border-slate-200 bg-slate-50/60 p-5 flex flex-col justify-between space-y-3 min-w-0 ${spanFullWidth}`}
              >
                <div className="space-y-2.5 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xs sm:text-[13px] font-extrabold text-slate-900 flex items-center gap-2 leading-snug min-w-0">
                      <ManualIcon name={block.icon} className={`w-4 h-4 shrink-0 ${block.iconColorClass}`} />
                      <span className="wrap-break-word">{block.title}</span>
                    </h3>
                    {block.route && (
                      <Link
                        href={block.route}
                        className="shrink-0 whitespace-nowrap text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg hover:bg-emerald-600 hover:text-white transition-colors"
                      >
                        Open ↗
                      </Link>
                    )}
                  </div>

                  {block.badges && block.badges.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {block.badges.map((badge) => (
                        <span
                          key={badge}
                          className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-slate-600 leading-relaxed">{block.summary}</p>

                  {block.steps && block.steps.length > 0 && (
                    <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">
                        Step-by-Step Guide
                      </p>
                      <ol className="space-y-1.5">
                        {block.steps.map((step, sIdx) => (
                          <li
                            key={sIdx}
                            className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed"
                          >
                            <span className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-extrabold text-indigo-700 mt-0.5">
                              {sIdx + 1}
                            </span>
                            <span className="min-w-0">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <ul className="space-y-1.5 pt-1">
                    {block.bullets.map((bullet, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="min-w-0">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {section.proTip && (
          <div className="rounded-xl bg-indigo-50/70 border border-indigo-200 p-3.5 flex items-start gap-2.5 text-xs text-indigo-950">
            <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              <strong>Pro Tip:</strong> {section.proTip}
            </span>
          </div>
        )}

        {section.warning && (
          <div className="rounded-xl bg-amber-50/80 border border-amber-200 p-3.5 flex items-start gap-2.5 text-xs text-amber-950">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Important Note:</strong> {section.warning}
            </span>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
