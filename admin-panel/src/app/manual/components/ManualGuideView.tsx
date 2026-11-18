"use client";

import React, { useMemo, useState } from "react";
import { ArrowUp, Bot, FileJson, ListTree, Search } from "lucide-react";
import {
  GENERIC_GUIDE_SECTIONS,
  MANUAL_TOC_ITEMS,
  ManualSectionId,
} from "../data/manualMockData";
import { ManualHero } from "./ManualHero";
import { ManualSidebarToc } from "./ManualSidebarToc";
import { QuickDirectorySection } from "./QuickDirectorySection";
import { GenericModuleSection } from "./GenericModuleSection";
import { PackagesTitleHighlightSection } from "./PackagesTitleHighlightSection";
import { DynamicPricingGuideSection } from "./DynamicPricingGuideSection";
import { JsonAiGeneratorSection } from "./JsonAiGeneratorSection";
import { PrePublishChecklistSection } from "./PrePublishChecklistSection";
import { TroubleshootingSection } from "./TroubleshootingSection";

export default function ManualGuideView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<ManualSectionId>("getting-started");
  const [isTocOpen, setIsTocOpen] = useState(false);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const matchingSectionIds = useMemo(() => {
    if (!normalizedQuery) {
      return new Set<ManualSectionId>(MANUAL_TOC_ITEMS.map((item) => item.id));
    }
    return new Set<ManualSectionId>(
      MANUAL_TOC_ITEMS.filter(
        (item) =>
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.shortDesc.toLowerCase().includes(normalizedQuery) ||
          item.keywords.some((kw) => kw.toLowerCase().includes(normalizedQuery))
      ).map((item) => item.id)
    );
  }, [normalizedQuery]);

  const currentSectionMeta = useMemo(
    () => MANUAL_TOC_ITEMS.find((i) => i.id === activeSection) || MANUAL_TOC_ITEMS[0],
    [activeSection]
  );

  const handleSelectSection = (id: ManualSectionId) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isVisible = (id: ManualSectionId) => matchingSectionIds.has(id);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Hero Banner + Search */}
      <ManualHero searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Sticky Compact Action Bar (Replaces Left Sidebar for Full-Width Reading!) */}
      <div className="sticky top-4 z-30 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-2.5 shadow-md shadow-slate-900/5 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setIsTocOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <ListTree className="w-4 h-4 text-emerald-400" />
            <span>Guide Contents</span>
            <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-extrabold">
              {matchingSectionIds.size}
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-2 min-w-0 text-xs text-slate-500">
            <span className="text-slate-300">|</span>
            <span className="truncate font-semibold text-slate-700">
              {currentSectionMeta.number}. {currentSectionMeta.title}
            </span>
          </div>
        </div>

        {/* Right Quick Utilities: Jump to JSON & AI Prompts + Back to Top */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSelectSection("json-ai")}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-[11px] font-bold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span>JSON Templates</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectSection("json-ai")}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Prompts</span>
          </button>

          <button
            type="button"
            onClick={scrollToTop}
            title="Scroll back to top"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Top</span>
          </button>
        </div>
      </div>

      {/* Slide-Over Guide Contents Drawer (Opens on Button Click) */}
      <ManualSidebarToc
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        activeSection={activeSection}
        matchingSectionIds={matchingSectionIds}
        searchQuery={searchQuery}
        onSelectSection={handleSelectSection}
        onClearSearch={() => setSearchQuery("")}
      />

      {/* Full-Width Documentation Content Canvas */}
      <div className="w-full space-y-8">
        {matchingSectionIds.size === 0 && (
          <div className="rounded-2xl bg-white border border-slate-200 p-12 text-center space-y-3">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <h2 className="text-base font-bold text-slate-800">
              No matching guide topics found
            </h2>
            <p className="text-xs text-slate-500">
              Try searching for &quot;pricing&quot;, &quot;webp&quot;, &quot;slug&quot;, &quot;japanese&quot;, &quot;meals&quot;, or &quot;bookings&quot;.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
            >
              Show All Sections
            </button>
          </div>
        )}

        {isVisible("getting-started") && <QuickDirectorySection />}
        {isVisible("dashboard") && <GenericModuleSection section={GENERIC_GUIDE_SECTIONS.dashboard} />}
        {isVisible("bookings") && <GenericModuleSection section={GENERIC_GUIDE_SECTIONS.bookings} />}
        {isVisible("packages") && <PackagesTitleHighlightSection />}
        {isVisible("pricing") && <DynamicPricingGuideSection />}
        {isVisible("itinerary") && <GenericModuleSection section={GENERIC_GUIDE_SECTIONS.itinerary} />}
        {isVisible("destinations") && <GenericModuleSection section={GENERIC_GUIDE_SECTIONS.destinations} />}
        {isVisible("content") && <GenericModuleSection section={GENERIC_GUIDE_SECTIONS.content} />}
        {isVisible("availability") && <GenericModuleSection section={GENERIC_GUIDE_SECTIONS.availability} />}
        {isVisible("engagement") && <GenericModuleSection section={GENERIC_GUIDE_SECTIONS.engagement} />}
        {isVisible("compliance") && <GenericModuleSection section={GENERIC_GUIDE_SECTIONS.compliance} />}
        {isVisible("json-ai") && <JsonAiGeneratorSection />}
        {isVisible("checklist") && <PrePublishChecklistSection />}
        {isVisible("troubleshooting") && <TroubleshootingSection />}
      </div>
    </div>
  );
}
