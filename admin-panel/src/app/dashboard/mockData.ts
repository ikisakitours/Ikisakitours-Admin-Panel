export interface DailyMetric {
  day: string;
  visitors: number;
  impressions: number;
  clicks: number;
}

export interface MonthlyMetric {
  month: string;
  totalVisitors: number;
  feedImpressions: number;
  totalClicks: number;
  seoRank: number;
  visitorsGrowth: string;
  impressionsGrowth: string;
  clicksGrowth: string;
  seoGrowth: string;
  dailyData: DailyMetric[];
}

// Helper to generate full 30/31 day realistic data points
function generateDailyData(
  monthPrefix: string,
  totalDays: number,
  baseVisitors: number,
  baseImpressions: number,
  baseClicks: number
): DailyMetric[] {
  return Array.from({ length: totalDays }, (_, i) => {
    const dayNum = i + 1;
    const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
    
    // Simulates weekend drop-offs & realistic daily spikes
    const isWeekend = dayNum % 7 === 0 || dayNum % 7 === 6;
    const variation = isWeekend ? 0.7 : 0.9 + Math.random() * 0.35;
    const spike = (dayNum === 12 || dayNum === 24) ? 1.4 : 1.0;

    return {
      day: `${monthPrefix} ${dayStr}`,
      visitors: Math.round(baseVisitors * variation * spike),
      impressions: Math.round(baseImpressions * variation * spike),
      clicks: Math.round(baseClicks * variation * spike),
    };
  });
}

export const MOCK_ANALYTICS_DATA: Record<string, MonthlyMetric> = {
  "2026-08": {
    month: "2026-08",
    totalVisitors: 14280,
    feedImpressions: 89400,
    totalClicks: 3820,
    seoRank: 4.2,
    visitorsGrowth: "+12.4%",
    impressionsGrowth: "+18.2%",
    clicksGrowth: "+5.1%",
    seoGrowth: "-0.3",
    dailyData: generateDailyData("Aug", 31, 460, 2880, 123),
  },
  "2026-07": {
    month: "2026-07",
    totalVisitors: 12700,
    feedImpressions: 75600,
    totalClicks: 3630,
    seoRank: 4.5,
    visitorsGrowth: "+8.1%",
    impressionsGrowth: "+10.5%",
    clicksGrowth: "+2.3%",
    seoGrowth: "+0.1",
    dailyData: generateDailyData("Jul", 31, 410, 2440, 117),
  },
  "2026-06": {
    month: "2026-06",
    totalVisitors: 11750,
    feedImpressions: 68400,
    totalClicks: 3550,
    seoRank: 4.6,
    visitorsGrowth: "+4.0%",
    impressionsGrowth: "+6.2%",
    clicksGrowth: "+1.1%",
    seoGrowth: "-0.2",
    dailyData: generateDailyData("Jun", 30, 390, 2280, 118),
  },
};