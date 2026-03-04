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

const ANALYTICS_URL = "https://life-api.lockated.com/analytics";
const VALUES_URL = "https://life-api.lockated.com/core_values";

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
          fetch(VALUES_URL, { method: "GET", headers })
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

        // 2. Core Values Data Processing (BULLETPROOF MAPPING)
        if (resV.status === "fulfilled" && resV.value.ok) {
          try {
            const vData = await resV.value.json();
            console.log("RAW VALUES API RESPONSE:", vData); // <--- YAHAN CHECK KAR CONSOLE MEIN
            
            // Agar data direct array nahi hai, toh check karo kahan chhupa hai
            const rawArray = Array.isArray(vData) ? vData : (vData.data || vData.values || []);
            
            if (rawArray.length === 0) {
              console.warn("Values array khali hai ya galat format mein hai!");
            }

            // Safe mapping
            const formattedValues = rawArray.map((item: any) => ({
              value: item.name || item.value || "Unknown", // API 'name' de rahi thi
              days: item.priority !== undefined ? item.priority : (item.days || 0) // API 'priority' de rahi thi
            }));

            console.log("FORMATTED VALUES FOR UI:", formattedValues); // <--- YE BHI CHECK KAR
            setValuesData(formattedValues);
            
          } catch (e) {
            console.error("Values map karne mein phat gaya:", e);
          }
        }

      } catch (err: any) {
        console.error("Fetch error:", err);
        setError("API load nahi hui.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="animate-spin h-10 w-10 text-primary" />
    </div>
  );

  return (
    <div className="w-full space-y-8 p-4 md:p-0 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold tracking-tight">Analytics & Insights</h2>
        <p className="text-muted-foreground">Live data from your metrics and core values.</p>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricBox icon={FileText} title="Unique Days" value={metrics?.uniqueDays} color="emerald" />
        <MetricBox icon={Calendar} title="Weekly Avg" value={metrics?.weekly} color="purple" />
        <MetricBox icon={TrendingUp} title="Alignment" value={metrics?.alignment?.toFixed(1)} isScore color="orange" />
        <MetricBox icon={Heart} title="Energy" value={metrics?.energy?.toFixed(1)} isScore color="red" />
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Activity Trends</h3>
        <TrendsChart data={chartData} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <LifeBalanceOverview mockLifeBalanceData={lifeBalanceData} />
        {/* Tumhara data yahan UI par jana chahiye */}
        <ValuesInAction mockValuesData={valuesData} />
      </div>

      {/* Insights */}
      <section className="p-6 rounded-2xl bg-purple-50/50 border border-purple-100 dark:bg-purple-900/10">
        <h3 className="flex items-center gap-2 text-xl font-bold mb-4 text-purple-700">
          <Lightbulb className="h-5 w-5" /> Key Insights
        </h3>
        <div className="space-y-3">
          {insights.length > 0 ? (
            insights.map((ins, i) => (
              <div key={i} className="p-4 bg-background rounded-lg border shadow-sm">{ins}</div>
            ))
          ) : (
            <p className="text-sm italic text-muted-foreground">No insights yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

const MetricBox = ({ icon: Icon, title, value, color, isScore }: any) => {
  const colors: any = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    red: "bg-red-50 border-red-200 text-red-700",
  };
  return (
    <div className={`p-5 border-2 rounded-xl ${colors[color]} dark:bg-slate-900 dark:border-slate-800`}>
      <Icon className="mb-2 h-4 w-4" />
      <div className="text-sm font-medium">{title}</div>
      <div className="text-3xl font-bold">{value ?? 0}{isScore ? "/10" : ""}</div>
    </div>
  );
};

export default Analytics;