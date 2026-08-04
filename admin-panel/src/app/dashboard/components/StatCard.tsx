import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  growth: string;
  growthLabel?: string;
  growthColor?: "emerald" | "indigo";
}

export default function StatCard({
  title,
  value,
  growth,
  growthLabel = "vs last month",
  growthColor = "emerald",
}: StatCardProps) {
  return (
    <Card className="bg-white border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {value}
        </div>
        <p
          className={`text-xs font-bold mt-1 ${
            growthColor === "indigo" ? "text-indigo-600" : "text-emerald-600"
          }`}
        >
          {growth} <span className="font-normal text-slate-400">{growthLabel}</span>
        </p>
      </CardContent>
    </Card>
  );
}