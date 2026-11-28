"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, Check, Copy, Download, FileJson, Sparkles, Wand2, Zap } from "lucide-react";
import { AdminToast, type AdminToastState, type ToastVariant } from "@/components/AdminToast";
import {
  AI_GENERATOR_PROMPTS,
  AiPromptTemplate,
  ONE_DAY_PACKAGE_AI_PROMPT,
  MULTI_DAY_PACKAGE_AI_PROMPT,
  SAMPLE_TEMPLATES,
  SampleTemplateDownload,
} from "../data/manualMockData";
import { SectionCard } from "./SectionCard";

export function JsonAiGeneratorSection() {
  const [activePromptId, setActivePromptId] = useState<AiPromptTemplate["id"]>("package");
  const [tourType, setTourType] = useState<"oneday" | "multiday" | "">("");
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedCombinedId, setCopiedCombinedId] = useState<string | null>(null);
  const [loadingCombinedId, setLoadingCombinedId] = useState<string | null>(null);
  const [copiedJsonId, setCopiedJsonId] = useState<string | null>(null);
  const [loadingJsonId, setLoadingJsonId] = useState<string | null>(null);
  const [toast, setToast] = useState<AdminToastState | null>(null);

  const notify = useCallback((message: string, variant: ToastVariant = "info") => {
    setToast({ id: Date.now(), message, variant });
  }, []);

  const activePrompt = AI_GENERATOR_PROMPTS.find((p) => p.id === activePromptId) || AI_GENERATOR_PROMPTS[0];

  const getResolvedPromptText = (): string => {
    if (activePromptId === "package") {
      if (tourType === "multiday") return MULTI_DAY_PACKAGE_AI_PROMPT;
      if (tourType === "oneday") return ONE_DAY_PACKAGE_AI_PROMPT;
      return `/* ── PLEASE SELECT TOUR PACKAGE TYPE ABOVE ── */\n\nPlease select "One-Day Tour" or "Multi-Day Tour" using the dropdown above.\nEach tour type uses a dedicated JSON structure (sample-oneday-tour.json vs sample-multiday-tour.json) and tailored itinerary rules. Once selected, the copy buttons on the right will be unlocked automatically.`;
    }
    return activePrompt.promptText;
  };

  const getTemplateHref = (): string => {
    if (activePromptId === "package") {
      return tourType === "multiday"
        ? "/sample-packages/sample-multiday-tour.json"
        : "/sample-packages/sample-oneday-tour.json";
    }
    return activePromptId === "destination"
      ? "/sample-packages/sample-destination.json"
      : "/sample-packages/sample-blog.json";
  };

  const isCopyDisabled = (activePromptId === "package" && !tourType) || loadingCombinedId === activePrompt.id;

  const handleCopyPrompt = async () => {
    if (isCopyDisabled) return;
    try {
      const textToCopy = getResolvedPromptText();
      await navigator.clipboard.writeText(textToCopy);
      setCopiedPromptId(activePrompt.id);
      notify("AI Prompt copied to clipboard!", "success");
      setTimeout(() => setCopiedPromptId(null), 2200);
    } catch {
      notify("Could not copy automatically. Please select and copy the prompt text.", "warning");
    }
  };

  const handleCopyPromptWithJson = async () => {
    if (isCopyDisabled) return;
    try {
      setLoadingCombinedId(activePrompt.id);
      const templateHref = getTemplateHref();

      const res = await fetch(templateHref);
      let rawJson = "";
      if (res.ok) {
        rawJson = await res.text();
      }

      // Cleanly replace the sample JSON placeholder with the real sample schema!
      let combinedText = getResolvedPromptText();
      if (combinedText.includes("[PASTE sample-oneday-tour.json HERE]")) {
        combinedText = combinedText.replace(
          "[PASTE sample-oneday-tour.json HERE]",
          `EXACT SAMPLE SCHEMA TO EMULATE:\n${rawJson}`,
        );
      } else if (combinedText.includes("[PASTE sample-multiday-tour.json HERE]")) {
        combinedText = combinedText.replace(
          "[PASTE sample-multiday-tour.json HERE]",
          `EXACT SAMPLE SCHEMA TO EMULATE:\n${rawJson}`,
        );
      } else if (combinedText.includes("[PASTE sample-destination.json HERE]")) {
        combinedText = combinedText.replace(
          "[PASTE sample-destination.json HERE]",
          `EXACT SAMPLE SCHEMA TO EMULATE:\n${rawJson}`,
        );
      } else if (combinedText.includes("[PASTE sample-blog.json HERE]")) {
        combinedText = combinedText.replace(
          "[PASTE sample-blog.json HERE]",
          `EXACT SAMPLE SCHEMA TO EMULATE:\n${rawJson}`,
        );
      } else if (combinedText.includes("[PASTE YOUR SAMPLE JSON STRUCTURE HERE]")) {
        combinedText = combinedText.replace(
          "[PASTE YOUR SAMPLE JSON STRUCTURE HERE]",
          `EXACT SAMPLE SCHEMA TO EMULATE:\n${rawJson}`,
        );
      } else {
        combinedText = `${combinedText}\n\nEXACT SAMPLE SCHEMA TO EMULATE:\n${rawJson}`;
      }

      await navigator.clipboard.writeText(combinedText);
      setCopiedCombinedId(activePrompt.id);
      notify("Combined AI Prompt + Sample JSON copied to clipboard!", "success");
      setTimeout(() => setCopiedCombinedId(null), 2500);
    } catch {
      notify("Could not copy combined prompt and JSON. Please copy them individually.", "warning");
    } finally {
      setLoadingCombinedId(null);
    }
  };

  const handleCopyJsonStructure = async (tpl: SampleTemplateDownload) => {
    try {
      setLoadingJsonId(tpl.id);
      const res = await fetch(tpl.href);
      if (!res.ok) throw new Error("Failed to fetch JSON template");
      const rawJson = await res.text();
      await navigator.clipboard.writeText(rawJson);
      setCopiedJsonId(tpl.id);
      notify("JSON Template copied to clipboard!", "success");
      setTimeout(() => setCopiedJsonId(null), 2200);
    } catch {
      notify("Unable to copy JSON. Please use the Download button instead.", "warning");
    } finally {
      setLoadingJsonId(null);
    }
  };

  return (
    <SectionCard
      id="json-ai"
      number="12"
      title="JSON Structure Downloads & AI Content Generator Prompts"
      subtitle="Download every JSON structure used in the Admin Panel and use ready-made AI prompts to convert rough ideas into upload-ready bilingual (EN + JA) JSON files."
      icon="fileJson"
    >
      <div className="space-y-6">
        {/* Module Switcher & 3-Step Workflow Guide */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Step-by-Step AI Workflow Guide by Module:</span>
            </span>

            {/* Module Switcher Tabs for Steps */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActivePromptId("package")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePromptId === "package"
                    ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🎒 Tour Packages
              </button>
              <button
                type="button"
                onClick={() => setActivePromptId("destination")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePromptId === "destination"
                    ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📍 Destinations
              </button>
              <button
                type="button"
                onClick={() => setActivePromptId("blog")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activePromptId === "blog"
                    ? "bg-white text-indigo-700 shadow-xs border border-slate-200/80"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📝 Blog Articles
              </button>
            </div>
          </div>

          {/* Dynamic 3-Step Workflow Cards Based on Selected Module */}
          {activePromptId === "package" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  Tour Package · Step 1
                </span>
                <p className="text-xs font-extrabold text-slate-900 pt-0.5">Select Type &amp; Copy Prompt + JSON</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Choose <strong>One-Day</strong> or <strong>Multi-Day</strong> tour type below and click <strong>&quot;Copy AI Prompt with JSON&quot;</strong> to copy the complete instructions with schema structure in 1 click.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Tour Package · Step 2
                </span>
                <p className="text-xs font-extrabold text-slate-900 pt-0.5">Paste in Gemini / ChatGPT + Notes</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Paste into AI. Add your rough itinerary, pricing, or destination notes at the bottom in English,Japanese. AI outputs 100% valid bilingual (EN + JA) JSON.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Tour Package · Step 3
                </span>
                <p className="text-xs font-extrabold text-slate-900 pt-0.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  <span>1-Click Apply on /addpackage</span>
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Open <code>/addpackage</code> and click <strong>&quot;1-Click Paste &amp; Apply&quot;</strong>. Form is populated instantly with itineraries and pricing. Attach gallery photos and save!
                </p>
              </div>
            </div>
          ) : activePromptId === "destination" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  Destination · Step 1
                </span>
                <p className="text-xs font-extrabold text-slate-900 pt-0.5">Copy Destination Prompt + JSON</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Select <strong>Destination AI Prompt</strong> below and click <strong>&quot;Copy AI Prompt with JSON&quot;</strong> (paired with <code>sample-destination.json</code>).
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Destination · Step 2
                </span>
                <p className="text-xs font-extrabold text-slate-900 pt-0.5">Add Location Notes &amp; Highlights</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Paste into AI with your Sri Lanka city or attraction name (e.g. Sigiriya, Ella, Galle Fort). AI generates exact GPS coordinates, highlights, and bilingual copy.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Destination · Step 3
                </span>
                <p className="text-xs font-extrabold text-slate-900 pt-0.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  <span>1-Click Apply on /destinations</span>
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Open <code>/destinations</code> and click <strong>&quot;1-Click Paste &amp; Apply&quot;</strong>. Multilingual fields, facts, and GPS auto-fill in 1 click. Attach hero image and save!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                  Blog Article · Step 1
                </span>
                <p className="text-xs font-extrabold text-slate-900 pt-0.5">Copy Blog AI Prompt + JSON</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Select <strong>Blog Article AI Prompt</strong> below and click <strong>&quot;Copy AI Prompt with JSON&quot;</strong> (paired with <code>sample-blog.json</code>).
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Blog Article · Step 2
                </span>
                <p className="text-xs font-extrabold text-slate-900 pt-0.5">Provide Travel Topic or Draft</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Paste into AI with your travel topic or bullet points. AI writes engaging SEO-friendly English and Japanese paragraphs, read time, and preview summary.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
                <span className="inline-block text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                  Blog Article · Step 3
                </span>
                <p className="text-xs font-extrabold text-slate-900 pt-0.5 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                  <span>1-Click Apply on /blogs</span>
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Open <code>/blogs</code> and click <strong>&quot;1-Click Paste &amp; Apply&quot;</strong>. Rich article content, category, and metadata populate in 1 click. Attach cover image and publish!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Part A: All Downloadable JSON Structure Templates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-indigo-600" /> All Supported Admin JSON Structure Templates (
              {SAMPLE_TEMPLATES.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {SAMPLE_TEMPLATES.map((tpl) => {
              const isCopied = copiedJsonId === tpl.id;
              const isLoading = loadingJsonId === tpl.id;

              return (
                <div
                  key={tpl.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col justify-between gap-3 hover:border-indigo-300 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${tpl.badgeClass}`}
                      >
                        {tpl.moduleBadge}
                      </span>
                      <Link
                        href={tpl.targetRoute}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-600 transition-colors"
                      >
                        <span>Upload at {tpl.targetRoute}</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div>
                      <p className="text-xs font-extrabold text-slate-900">{tpl.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{tpl.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <a
                      href={tpl.href}
                      download={tpl.fileName}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-indigo-700 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .json</span>
                    </a>

                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleCopyJsonStructure(tpl)}
                      className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-bold transition-colors cursor-pointer ${
                        isCopied
                          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{isLoading ? "Copying..." : "Copy JSON"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Part B: Interactive AI Prompt Studio */}
        <div id="ai-prompt-studio" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-slate-950 text-white p-5 sm:p-6 space-y-4 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                <Bot className="w-3.5 h-3.5" />
                AI JSON Prompt Studio (ChatGPT · Gemini · Claude)
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">
                Modify or Create Valid EN + JA JSON Files Using AI
              </h3>
            </div>

            {/* Prompt Selector Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
              {AI_GENERATOR_PROMPTS.map((prompt) => {
                const isActive = activePromptId === prompt.id;
                return (
                  <button
                    key={prompt.id}
                    type="button"
                    onClick={() => setActivePromptId(prompt.id)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-emerald-500 text-slate-950 shadow-sm"
                        : "text-slate-300 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {prompt.tabLabel}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Prompt Details & Copy Bar */}
          <div className="flex flex-col gap-3.5 rounded-xl bg-white/5 border border-white/10 p-4">
            <div className="space-y-1.5 max-w-4xl">
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <Wand2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                {activePromptId === "package" && tourType
                  ? `Generate or Modify a ${tourType === "oneday" ? "One-Day" : "Multi-Day"} Tour Package JSON`
                  : activePrompt.title}
              </p>
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">{activePrompt.whenToUse}</p>
              <p className="text-[10px] sm:text-[11px] text-emerald-300 font-semibold pt-0.5">
                Pair with:{" "}
                <code>
                  {activePromptId === "package"
                    ? tourType === "multiday"
                      ? "sample-multiday-tour.json"
                      : tourType === "oneday"
                        ? "sample-oneday-tour.json"
                        : "sample-oneday-tour.json or sample-multiday-tour.json"
                    : activePrompt.matchingJsonFile}
                </code>{" "}
                → Upload on <code>{activePrompt.targetRoute}</code>
              </p>
            </div>

            {/* Bottom Toolbar: Left side Type Selector & Right side Copy Action Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-white/10">
              {/* LEFT SIDE: Type Selector Dropdown for Tour Package */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {activePromptId === "package" ? (
                  <div className="flex items-center gap-2 flex-wrap">
                    <label
                      htmlFor="tour-type-select"
                      className="text-xs font-bold text-slate-200 flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${tourType ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`}
                      ></span>
                      <span>Tour Package Type:</span>
                    </label>
                    <select
                      id="tour-type-select"
                      value={tourType}
                      onChange={(e) => setTourType(e.target.value as "oneday" | "multiday" | "")}
                      className={`bg-slate-900 border rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer outline-none ${
                        !tourType
                          ? "border-amber-400 text-amber-300 ring-1 ring-amber-400/40"
                          : "border-emerald-400 text-emerald-300 ring-1 ring-emerald-400/40"
                      }`}
                    >
                      <option value="" className="bg-slate-900 text-slate-400">
                        -- Select Tour Type (Required to Copy) --
                      </option>
                      <option value="oneday" className="bg-slate-900 text-white">
                        One-Day Tour (sample-oneday-tour.json)
                      </option>
                      <option value="multiday" className="bg-slate-900 text-white">
                        Multi-Day Tour (sample-multiday-tour.json)
                      </option>
                    </select>
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span>
                      Target Schema:{" "}
                      <code className="text-emerald-300 font-mono text-[11px]">{activePrompt.matchingJsonFile}</code>
                    </span>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE: Action Buttons (Disabled until type is selected for package) */}
              <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleCopyPromptWithJson}
                  disabled={isCopyDisabled}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold transition-all shadow-sm ${
                    isCopyDisabled
                      ? "opacity-40 cursor-not-allowed bg-slate-800 text-slate-400 border border-white/10"
                      : copiedCombinedId === activePrompt.id
                        ? "bg-emerald-400 text-slate-950 ring-2 ring-emerald-300 cursor-pointer"
                        : "bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 hover:from-emerald-300 hover:to-teal-300 cursor-pointer"
                  }`}
                  title={
                    activePromptId === "package" && !tourType
                      ? "Please select a tour type (One-Day or Multi-Day) first"
                      : "Copies both the complete AI prompt instructions AND the full sample JSON schema together"
                  }
                >
                  {copiedCombinedId === activePrompt.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Prompt + JSON Copied!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>
                        {loadingCombinedId === activePrompt.id
                          ? "Preparing..."
                          : activePromptId === "package" && tourType
                            ? `Copy ${tourType === "oneday" ? "One-Day" : "Multi-Day"} Prompt + JSON`
                            : "Copy AI Prompt with JSON"}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  disabled={isCopyDisabled}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                    isCopyDisabled
                      ? "opacity-40 cursor-not-allowed bg-slate-800 text-slate-400 border border-white/10"
                      : copiedPromptId === activePrompt.id
                        ? "bg-emerald-400 text-slate-950 cursor-pointer"
                        : "bg-white/10 text-white hover:bg-white/20 border border-white/15 cursor-pointer"
                  }`}
                  title={
                    activePromptId === "package" && !tourType
                      ? "Please select a tour type (One-Day or Multi-Day) first"
                      : "Copies only the AI prompt instructions"
                  }
                >
                  {copiedPromptId === activePrompt.id ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Prompt Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>
                        {activePromptId === "package" && tourType
                          ? `Copy ${tourType === "oneday" ? "One-Day" : "Multi-Day"} Prompt Only`
                          : activePromptId === "destination"
                          ? "Copy Destination Prompt Only"
                          : activePromptId === "blog"
                          ? "Copy Blog Prompt Only"
                          : "Copy Prompt Only"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Prompt Preview Box */}
          <div className="relative rounded-xl border border-white/10 bg-black/50 p-4 max-h-72 overflow-y-auto">
            <pre className="text-[11px] leading-relaxed text-slate-200 whitespace-pre-wrap font-mono">
              {getResolvedPromptText()}
            </pre>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>
              Tip: You can write your rough tour/blog notes in <strong>English,Japanese</strong> at the
              bottom of the prompt — the AI will automatically output polished English + Japanese JSON!
            </span>
          </div>
        </div>
      </div>

      {/* Executive Toast Notification */}
      <AdminToast toast={toast} onDismiss={() => setToast(null)} />
    </SectionCard>
  );
}
