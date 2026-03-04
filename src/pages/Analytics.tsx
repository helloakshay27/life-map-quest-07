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

const ANALYTICS_URL = "https://api.lifecompass.lockated.com/analytics";
const VALUES_URL = "https://api.lifecompass.lockated.com/core_values";

const Analytics = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [chartData, setChartData] = useState([]);
  const [lifeBalanceData, setLifeBalanceData] = useState([]);
  const [valuesData, setValuesData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("auth_token");
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        };

        const [resA, resV] = await Promise.allSettled([
          fetch(ANALYTICS_URL, { method: "GET", headers }),
          fetch(VALUES_URL, { method: "GET", headers }),
        ]);

        // 1. Analytics Data Processing
        if (resA.status === "fulfilled" && resA.value.ok) {
          try {
            const aData = await resA.value.json();
            setMetrics({
              uniqueDays: aData.metrics?.uniqueDays ?? aData.unique_days ?? 0,
              uniqueDays30d: aData.metrics?.uniqueDays30d ?? aData.unique_days_30d ?? 0,
              weekly: aData.metrics?.weekly ?? aData.weekly_average ?? 0,
              alignment: aData.metrics?.alignment ?? aData.alignment_score ?? 0,
              energy: aData.metrics?.energy ?? aData.energy_score ?? 0,
            });
            setChartData(aData.trends ?? aData.trend_data ?? []);
            setLifeBalanceData(aData.life_balance ?? aData.life_areas ?? []);
            setInsights(aData.insights ?? aData.key_insights ?? []);
          } catch (e) {
            console.error("Analytics parsing failed:", e);
          }
        }

        // 2. Core Values Data Processing
        if (resV.status === "fulfilled" && resV.value.ok) {
          try {
            const vData = await resV.value.json();
            console.log("RAW VALUES API RESPONSE:", vData);

            const rawArray = Array.isArray(vData)
              ? vData
              : vData.data || vData.values || [];

            if (rawArray.length === 0) {
              console.warn("Values array is empty or wrong format!");
            }

            const formattedValues = rawArray.map((item: any) => ({
              value: item.name || item.value || "Unknown",
              days:
                item.priority !== undefined
                  ? item.priority
                  : item.days || 0,
            }));

            console.log("FORMATTED VALUES FOR UI:", formattedValues);
            setValuesData(formattedValues);
          } catch (e) {
            console.error("Values mapping failed:", e);
          }
        }
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError("Failed to load API data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-primary" />
      </div>
    );

  if (error)
    return (
      <div className="flex h-screen items-center justify-center px-4">
        <p className="text-sm text-red-500 text-center">{error}</p>
      </div>
    );

  return (
    <div className="w-full space-y-5 px-4 py-5 md:px-6 md:py-8 lg:px-0 animate-in fade-in duration-500">

      {/* Header */}
      <header className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight">
          Analytics & Insights
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Live data from your metrics and core values.
        </p>
      </header>

      {/* Metric Cards — 2 col on mobile, 4 on md+ */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <MetricBox
          icon={FileText}
          title="Unique Days"
          value={metrics?.uniqueDays}
          color="emerald"
        />
        <MetricBox
          icon={Calendar}
          title="Weekly Avg"
          value={metrics?.weekly}
          color="purple"
        />
        <MetricBox
          icon={TrendingUp}
          title="Alignment"
          value={metrics?.alignment?.toFixed(1)}
          isScore
          color="orange"
        />
        <MetricBox
          icon={Heart}
          title="Energy"
          value={metrics?.energy?.toFixed(1)}
          isScore
          color="red"
        />
      </div>

      {/* Trends Chart */}
      <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm overflow-hidden">
        <h3 className="text-base sm:text-lg font-semibold mb-4">
          Activity Trends
        </h3>
        {/* Horizontal scroll wrapper for small screens */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[300px]">
            <TrendsChart data={chartData} />
          </div>
        </div>
      </div>

      {/* Life Balance + Values — stacked on mobile, side-by-side on lg+ */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <LifeBalanceOverview mockLifeBalanceData={lifeBalanceData} />
        <ValuesInAction mockValuesData={valuesData} />
      </div>

      {/* Key Insights */}
      <section className="p-4 sm:p-6 rounded-2xl bg-purple-50/50 border border-purple-100 dark:bg-purple-900/10">
        <h3 className="flex items-center gap-2 text-lg sm:text-xl font-bold mb-4 text-purple-700">
          <Lightbulb className="h-5 w-5 flex-shrink-0" />
          Key Insights
        </h3>
        <div className="space-y-3">
          {insights.length > 0 ? (
            insights.map((ins, i) => (
              <div
                key={i}
                className="p-3 sm:p-4 bg-background rounded-lg border shadow-sm text-sm sm:text-base leading-relaxed"
              >
                {ins}
              </div>
            ))
          ) : (
            <p className="text-sm italic text-muted-foreground">
              No insights yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

const MetricBox = ({ icon: Icon, title, value, color, isScore }: any) => {
  const colors: any = {
    emerald:
      "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400",
    purple:
      "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400",
    orange:
      "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-900/20 dark:border-orange-800 dark:text-orange-400",
    red: "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400",
  };

  return (
    <div
      className={`p-4 sm:p-5 border-2 rounded-xl ${colors[color]} transition-all`}
    >
      <Icon className="mb-2 h-4 w-4 flex-shrink-0" />
      <div className="text-xs sm:text-sm font-medium truncate">{title}</div>
      <div className="text-2xl sm:text-3xl font-bold mt-0.5">
        {value ?? 0}
        {isScore && (
          <span className="text-base sm:text-lg font-medium opacity-70">
            /10
          </span>
        )}
      </div>
    </div>
  );
};

export default Analytics;