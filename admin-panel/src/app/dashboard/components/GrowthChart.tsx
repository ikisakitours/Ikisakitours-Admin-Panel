"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { DailyMetric } from "../mockData";

const chartConfig = {
  impressions: {
    label: "Feed Impressions",
    color: "#6366f1", // Indigo-500
  },
  visitors: {
    label: "Visitors",
    color: "#10b981", // Emerald-500
  },
  clicks: {
    label: "Clicks",
    color: "#f59e0b", // Amber-500
  },
} satisfies ChartConfig;

interface GrowthChartProps {
  data: DailyMetric[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <CardTitle className="text-base font-extrabold text-slate-900">
              Daily Growth Breakdown
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Daily trend analysis for visitors, feed impressions, and clicks.
            </CardDescription>
          </div>

          {/* Clean Minimal Legend */}
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Impressions
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Visitors
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Clicks
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
              {/* Modern Subtle Gradient Fills */}
              <defs>
                <linearGradient id="fillImpressions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fillVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              
              <XAxis
                dataKey="day"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={2} // Keeps X-axis labels spaced evenly for 30+ days
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              
              <ChartTooltip content={<ChartTooltipContent indicator="line" />} />

              {/* Impressions Area */}
              <Area
                type="monotone"
                dataKey="impressions"
                stroke={chartConfig.impressions.color}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#fillImpressions)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: "#ffffff" }}
              />

              {/* Visitors Area */}
              <Area
                type="monotone"
                dataKey="visitors"
                stroke={chartConfig.visitors.color}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#fillVisitors)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: "#ffffff" }}
              />

              {/* Clicks Area */}
              <Area
                type="monotone"
                dataKey="clicks"
                stroke={chartConfig.clicks.color}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#fillClicks)"
                dot={false}
                activeDot={{ r: 5, strokeWidth: 2, fill: "#ffffff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}