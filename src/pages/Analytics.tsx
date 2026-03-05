import { useState, useEffect } from "react";
import TrendsChart from "@/components/TrendsChart"; // Ise alag hi rehne dena kyunki ye chart component hai
import {
  FileText,
  Calendar,
  TrendingUp,
  Heart,
  Loader2,
  Lightbulb,
} from "lucide-react";

const ANALYTICS_URL = "https://life-api.lockated.com/analytics";
const VALUES_URL = "https://life-api.lockated.com/core_values";

// ==========================================
// 1. MAIN ANALYTICS COMPONENT
// ==========================================
const Analytics = () => {
  const [metrics, setMetrics] = useState({
    uniqueDays: 0,
    weekly: 0,
    alignment: 0,
    energy: 0,
  });

  const [chartData, setChartData] = useState([]);
  const [lifeBalanceData, setLifeBalanceData] = useState({});
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
          Authorization: `Bearer ${token}`,
        };

        const [resA, resV] = await Promise.allSettled([
          fetch(ANALYTICS_URL, { method: "GET", headers }),
          fetch(VALUES_URL, { method: "GET", headers }),
        ]);

        // Analytics Data Processing
        if (resA.status === "fulfilled" && resA.value.ok) {
          try {
            const aData = await resA.value.json();
            const summary = aData.summary || {};

            setMetrics({
              uniqueDays: summary.unique_days ?? aData.unique_days ?? 0,
              weekly: summary.weekly_count ?? aData.weekly_count ?? 0,
              alignment: summary.avg_alignment ?? aData.avg_alignment ?? 0,
              energy: summary.avg_energy ?? aData.avg_energy ?? 0,
            });

            setChartData(aData.trends || []);
            setLifeBalanceData(aData.life_balance || {});
            setInsights(aData.insights || []);
          } catch (e) {
            console.error("Analytics parsing failed:", e);
          }
        }

        // Core Values Data Processing
        if (resV.status === "fulfilled" && resV.value.ok) {
          try {
            const vData = await resV.value.json();
            const rawArray = Array.isArray(vData)
              ? vData
              : vData.data || vData.values || [];

            const formattedValues = rawArray.map((item: any) => ({
              id: item.id || Math.random(),
              value: item.name || item.value || "Unknown",
              days: item.priority || item.days || 0,
              color: item.color || "purple",
            }));

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

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <MetricBox
          icon={FileText}
          title="Unique Days"
          value={metrics.uniqueDays}
          color="emerald"
        />
        <MetricBox
          icon={Calendar}
          title="Weekly Avg"
          value={metrics.weekly}
          color="purple"
        />
        <MetricBox
          icon={TrendingUp}
          title="Alignment"
          value={
            typeof metrics.alignment === "number"
              ? metrics.alignment.toFixed(1)
              : "0.0"
          }
          isScore
          color="orange"
        />
        <MetricBox
          icon={Heart}
          title="Energy"
          value={
            typeof metrics.energy === "number"
              ? metrics.energy.toFixed(1)
              : "0.0"
          }
          isScore
          color="red"
        />
      </div>

      {/* Trends Chart */}
      <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm overflow-hidden">
        <h3 className="text-base sm:text-lg font-semibold mb-4">
          Activity Trends
        </h3>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[300px]">
            {chartData.length > 0 ? (
              <TrendsChart data={chartData} />
            ) : (
              <p className="text-sm text-gray-400">
                No chart data available yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Life Balance + Values */}
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

export default Analytics;

// ==========================================
// 2. HELPER COMPONENTS (ALL IN ONE FILE)
// ==========================================

// --- Metric Box ---
const MetricBox = ({ icon: Icon, title, value, color, isScore }: any) => {
  const colors: any = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    red: "bg-red-50 border-red-200 text-red-700",
  };

  return (
    <div
      className={`p-4 sm:p-5 border-2 rounded-xl ${colors[color] || colors.purple} transition-all`}
    >
      <Icon className="mb-2 h-4 w-4 flex-shrink-0" />
      <div className="text-xs sm:text-sm font-medium truncate">{title}</div>
      <div className="text-2xl sm:text-3xl font-bold mt-0.5">
        {value !== undefined ? value : 0}
        {isScore && (
          <span className="text-base sm:text-lg font-medium opacity-70">
            /10
          </span>
        )}
      </div>
    </div>
  );
};

// --- Values in Action ---
const ValuesInAction = ({ mockValuesData = [] }: any) => {
  const getColorClass = (colorName: string) => {
    const colorMap: any = {
      purple: "bg-purple-500",
      teal: "bg-teal-500",
      red: "bg-red-500",
      blue: "bg-blue-500",
      green: "bg-green-500",
      orange: "bg-orange-500",
      yellow: "bg-yellow-500",
    };
    return colorMap[colorName] || "bg-gray-500";
  };

  return (
    <div className="rounded-xl border bg-white p-4 sm:p-6 shadow-sm flex flex-col h-full font-sans">
      <div className="mb-5">
        <h3 className="text-[1.125rem] font-bold text-gray-900">
          Values in Action
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Days each value appeared (Last 30 days)
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {mockValuesData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-sm text-gray-400 font-medium">
              No values recorded yet.
            </p>
          </div>
        ) : (
          mockValuesData.map((item: any) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-3 h-3 rounded-full shadow-sm ${getColorClass(item.color)}`}
                ></span>
                <span className="font-semibold text-gray-700 capitalize">
                  {item.value}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-600 bg-white px-2.5 py-1 rounded-md border shadow-sm">
                {item.days} {item.days === 1 ? "day" : "days"}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- Life Balance Overview ---
const LifeBalanceOverview = ({ mockLifeBalanceData = {} }: any) => {
  const dataArray = Object.entries(mockLifeBalanceData || {}).map(
    ([key, val]) => ({
      name: key,
      days: Number(val) || 0,
    }),
  );

  const maxDays = Math.max(...dataArray.map((d) => d.days), 1);

  return (
    <div className="rounded-xl border bg-white p-4 sm:p-6 shadow-sm flex flex-col h-full font-sans">
      <div className="mb-5">
        <h3 className="text-[1.125rem] font-bold text-gray-900">
          Life Balance Overview
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Based on unique days in each life area (Last 30 days)
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        {dataArray.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-sm text-gray-400 font-medium">
              No life balance data found yet.
            </p>
          </div>
        ) : (
          dataArray.map((item, index) => (
            <div key={index} className="space-y-1.5 group">
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-700">{item.name}</span>
                <span className="text-gray-500 font-medium">
                  {item.days} days
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-out group-hover:bg-blue-600"
                  style={{ width: `${(item.days / maxDays) * 100}%` }}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
