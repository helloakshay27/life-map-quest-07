import React from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

export interface LifeBalanceData {
  area: string;
  days: number;
}

interface LifeBalanceOverviewProps {
  mockLifeBalanceData?: LifeBalanceData[];
}

const LifeBalanceOverview = ({
  mockLifeBalanceData = [],
}: LifeBalanceOverviewProps) => {
  return (
    <div className="flex flex-col min-h-[320px] rounded-xl border bg-card p-6 shadow-sm">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-foreground">
          Life Balance Overview
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Based on unique days in each life area (Last 30 days)
        </p>
      </div>

      {/* Content Area */}
      <div className="mt-8 flex flex-1 items-center justify-center">
        {mockLifeBalanceData.length === 0 ? (
          // Empty State: Dashed Box
          <div className="h-48 w-full max-w-[280px] rounded border border-dashed border-border" />
        ) : (
          // Dynamic Chart Area using Recharts
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart
                cx="50%"
                cy="50%"
                outerRadius="80%"
                data={mockLifeBalanceData}
              >
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="area"
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, "auto"]}
                  tick={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                    color: "hsl(var(--foreground))",
                  }}
                  itemStyle={{ color: "hsl(var(--primary))" }}
                />
                <Radar
                  name="Days Focused"
                  dataKey="days"
                  stroke="hsl(var(--primary))" // Tailwind primary color
                  fill="hsl(var(--primary))"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default LifeBalanceOverview;
