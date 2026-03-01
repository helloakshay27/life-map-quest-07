import { useState, useEffect } from "react";
import TrendsChart from "@/components/TrendsChart";
import {
  FileText,
  Calendar,
  TrendingUp,
  Heart,
  Loader2,
  Lightbulb,
} from "lucide-react";
import LifeBalanceOverview from "@/components/LifeBalanceOverview";
import ValuesInAction from "@/components/ValuesData";
// Life Balance Data (Life areas and how many days they were focused on)
const mockLifeBalanceData = [
  { area: "Health & Fitness", days: 18 },
  { area: "Career & Work", days: 15 },
  { area: "Relationships", days: 12 },
  { area: "Personal Growth", days: 20 },
  { area: "Finance", days: 8 },
];

// Values Data (Core values and how many days they appeared in journals)
const mockValuesData = [
  { value: "Gratitude", days: 22 },
  { value: "Discipline", days: 18 },
  { value: "Focus", days: 16 },
  { value: "Peace", days: 14 },
  { value: "Courage", days: 9 },
];
// Types define kar lo API response ke according
interface AnalyticsMetrics {
  uniqueDays: number;
  uniqueDays30d: number;
  weekly: number;
  alignment: number;
  energy: number;
}

export interface TrendData {
  date: string;
  alignment: number;
  energy: number;
}

const insights = [
  "Consider reviewing your mission and daily priorities for better alignment.",
  "Try to journal more consistently. Aim for at least 3-4 times per week.",
];

const Analytics = () => {
  // State variables for dynamic data
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [chartData, setChartData] = useState<TrendData[]>([]);

  // Loading & Error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 🟢 REPLACE THIS BLOCK WITH YOUR ACTUAL API CALL
        /* const response = await fetch('/api/your-analytics-endpoint');
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json(); 
        */

        // MOCK API DELAY (Remove this in production)
        const mockData = await new Promise<{
          metrics: AnalyticsMetrics;
          trends: TrendData[];
        }>((resolve) =>
          setTimeout(
            () =>
              resolve({
                metrics: {
                  uniqueDays: 42,
                  uniqueDays30d: 18,
                  weekly: 5,
                  alignment: 7.4,
                  energy: 6.8,
                },
                trends: [
                  { date: "Mon", alignment: 4, energy: 3 },
                  { date: "Tue", alignment: 6, energy: 5 },
                  { date: "Wed", alignment: 8, energy: 9 },
                  { date: "Thu", alignment: 7, energy: 6 },
                  { date: "Fri", alignment: 8, energy: 7 },
                ],
              }),
            1000,
          ),
        );

        // Set the fetched data
        setMetrics(mockData.metrics);
        setChartData(mockData.trends);
      } catch (err) {
        setError("Failed to load analytics data. Please try again.");
        console.error("API Error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Loading Skeleton / Spinner
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex min-h-[400px] w-full items-center justify-center text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="mb-1 text-3xl font-bold text-foreground">
          Analytics & Insights
        </h2>
        <p className="text-sm text-muted-foreground">
          Track your progress and discover patterns
        </p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {/* Card 1: Unique Days */}
        <div className="flex flex-col rounded-xl border-2 border-emerald-300 bg-emerald-50/50 p-5 shadow-sm transition-all hover:shadow-md dark:border-emerald-800 dark:bg-emerald-950/20">
          <div className="mb-3 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <FileText className="h-4 w-4" strokeWidth={2} />
            <span className="text-sm font-medium">Unique Days</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-foreground">
            {metrics?.uniqueDays || 0}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            30d: {metrics?.uniqueDays30d || 0}
          </p>
        </div>

        {/* Card 2: Weekly */}
        <div className="flex flex-col rounded-xl border-2 border-purple-300 bg-purple-50/50 p-5 shadow-sm transition-all hover:shadow-md dark:border-purple-800 dark:bg-purple-950/20">
          <div className="mb-3 flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <Calendar className="h-4 w-4" strokeWidth={2} />
            <span className="text-sm font-medium">Weekly</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-foreground">
            {metrics?.weekly || 0}
          </div>
        </div>

        {/* Card 3: Alignment */}
        <div className="flex flex-col rounded-xl border-2 border-orange-300 bg-orange-50/50 p-5 shadow-sm transition-all hover:shadow-md dark:border-orange-800 dark:bg-orange-950/20">
          <div className="mb-3 flex items-center gap-2 text-orange-500 dark:text-orange-400">
            <TrendingUp className="h-4 w-4" strokeWidth={2} />
            <span className="text-sm font-medium">Alignment</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-foreground">
            {metrics?.alignment?.toFixed(1) || "0.0"}/10
          </div>
        </div>

        {/* Card 4: Energy */}
        <div className="flex flex-col rounded-xl border-2 border-red-300 bg-red-50/50 p-5 shadow-sm transition-all hover:shadow-md dark:border-red-800 dark:bg-red-950/20">
          <div className="mb-3 flex items-center gap-2 text-red-500 dark:text-red-400">
            <Heart className="h-4 w-4" strokeWidth={2} />
            <span className="text-sm font-medium">Energy</span>
          </div>
          <div className="text-4xl font-bold tracking-tight text-foreground">
            {metrics?.energy?.toFixed(1) || "0.0"}/10
          </div>
        </div>
      </div>

      {/* Dynamic Chart */}
      <TrendsChart data={chartData} />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <LifeBalanceOverview mockLifeBalanceData={mockLifeBalanceData} />
        <ValuesInAction mockValuesData={mockValuesData} />
      </div>
      <div className="w-full rounded-2xl bg-purple-50/60 p-6 dark:bg-purple-950/20 md:p-8">
        {/* Header Section */}
        <div className="mb-6 flex items-center gap-3">
          <Lightbulb
            className="h-6 w-6 text-purple-600 dark:text-purple-400"
            strokeWidth={2}
          />
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">
            Key Insights
          </h2>
        </div>

        {/* Insights List */}
        {insights.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No insights generated yet. Keep journaling to see patterns!
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-sm dark:bg-card"
              >
                {/* Purple Bullet Dot */}
                <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-purple-600 dark:bg-purple-400" />

                {/* Insight Text */}
                <p className="text-sm font-medium text-foreground/90 sm:text-base">
                  {insight}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
