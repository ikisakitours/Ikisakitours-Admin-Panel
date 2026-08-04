"use client";

import { useState } from "react";
import { MOCK_ANALYTICS_DATA } from "../mockData";
import StatCard from "./StatCard";
import GrowthChart from "./GrowthChart";

export default function AnalyticsDashboard() {
  const [selectedMonth, setSelectedMonth] = useState<string>("2026-08");

  const currentData = MOCK_ANALYTICS_DATA[selectedMonth] || MOCK_ANALYTICS_DATA["2026-08"];

  return (
    <div className="w-full space-y-8">
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block mb-1">
              Admin Insights
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Platform Analytics
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Monitor traffic, impressions, clicks, and SEO performance over time.
            </p>
          </div>

          {/* Month Changer */}
          <div className="flex items-center gap-2">
            <label htmlFor="month-picker" className="text-xs font-semibold text-slate-500">
              Select Month:
            </label>
            <select
              id="month-picker"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold bg-white text-slate-800 border border-slate-200 rounded-lg px-3 py-2 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-06">June 2026</option>
            </select>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Visitors"
            value={currentData.totalVisitors.toLocaleString()}
            growth={currentData.visitorsGrowth}
          />
          <StatCard
            title="Feed Impressions"
            value={currentData.feedImpressions.toLocaleString()}
            growth={currentData.impressionsGrowth}
          />
          <StatCard
            title="Total Clicks"
            value={currentData.totalClicks.toLocaleString()}
            growth={currentData.clicksGrowth}
          />
          <StatCard
            title="Avg. SEO Position"
            value={`#${currentData.seoRank}`}
            growth={currentData.seoGrowth}
            growthLabel="pos change"
            growthColor="indigo"
          />
        </div>
      </section>

      <section className="w-full">
        <GrowthChart data={currentData.dailyData} />
      </section>
    </div>
  );
}