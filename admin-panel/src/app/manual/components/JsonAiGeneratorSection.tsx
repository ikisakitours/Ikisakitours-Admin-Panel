"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Bot,
  Check,
  Copy,
  Download,
  FileJson,
  Sparkles,
  Wand2,
} from "lucide-react";
import {
  AI_GENERATOR_PROMPTS,
  AiPromptTemplate,
  SAMPLE_TEMPLATES,
  SampleTemplateDownload,
} from "../data/manualMockData";
import { SectionCard } from "./SectionCard";

export function JsonAiGeneratorSection() {
  const [activePromptId, setActivePromptId] = useState<AiPromptTemplate["id"]>("package");
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);
  const [copiedJsonId, setCopiedJsonId] = useState<string | null>(null);
  const [loadingJsonId, setLoadingJsonId] = useState<string | null>(null);

  const activePrompt =
    AI_GENERATOR_PROMPTS.find((p) => p.id === activePromptId) || AI_GENERATOR_PROMPTS[0];

  const handleCopyPrompt = async (prompt: AiPromptTemplate) => {
    try {
      await navigator.clipboard.writeText(prompt.promptText);
      setCopiedPromptId(prompt.id);
      setTimeout(() => setCopiedPromptId(null), 2200);
    } catch {
      alert("Could not copy automatically. Please select and copy the prompt text.");
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
      setTimeout(() => setCopiedJsonId(null), 2200);
    } catch {
      alert("Unable to copy JSON. Please use the Download button instead.");
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
        {/* 3-Step Workflow Guide */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
              Step 1
            </span>
            <p className="text-xs font-extrabold text-slate-900 pt-0.5">
              Download or Copy JSON Structure
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Grab the exact schema template for a One-Day Tour, Multi-Day Tour, Destination, or Blog Article below.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              Step 2
            </span>
            <p className="text-xs font-extrabold text-slate-900 pt-0.5">
              Paste AI Prompt + Your Idea
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Copy the matching AI Prompt below into ChatGPT, Gemini, or Claude with the JSON template and your rough notes (EN, Sinhala, or JA).
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1">
            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
              Step 3
            </span>
            <p className="text-xs font-extrabold text-slate-900 pt-0.5">
              Upload JSON &amp; Attach Images
            </p>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Save the AI output as a <code>.json</code> file, upload it via the module&apos;s JSON Uploader, add photos manually, and click Save!
            </p>
          </div>
        </div>

        {/* Part A: All Downloadable JSON Structure Templates */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-indigo-600" /> All Supported Admin JSON Structure Templates ({SAMPLE_TEMPLATES.length})
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
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {tpl.description}
                      </p>
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
        <div className="rounded-2xl border border-slate-200 bg-slate-950 text-white p-5 sm:p-6 space-y-4 shadow-md">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl bg-white/5 border border-white/10 p-3.5">
            <div className="space-y-1">
              <p className="text-xs font-bold text-white flex items-center gap-2">
                <Wand2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                {activePrompt.title}
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {activePrompt.whenToUse}
              </p>
              <p className="text-[10px] text-emerald-300 font-semibold">
                Pair with: <code>{activePrompt.matchingJsonFile}</code> → Upload on{" "}
                <code>{activePrompt.targetRoute}</code>
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleCopyPrompt(activePrompt)}
              className={`shrink-0 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                copiedPromptId === activePrompt.id
                  ? "bg-emerald-400 text-slate-950"
                  : "bg-white text-slate-950 hover:bg-emerald-300"
              }`}
            >
              {copiedPromptId === activePrompt.id ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Prompt Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy AI Prompt</span>
                </>
              )}
            </button>
          </div>

          {/* Prompt Preview Box */}
          <div className="relative rounded-xl border border-white/10 bg-black/50 p-4 max-h-72 overflow-y-auto">
            <pre className="text-[11px] leading-relaxed text-slate-200 whitespace-pre-wrap font-mono">
              {activePrompt.promptText}
            </pre>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>
              Tip: You can write your rough tour/blog notes in <strong>Sinhala, English, or Japanese</strong> at the bottom of the prompt — the AI will automatically output polished English + Japanese JSON!
            </span>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
