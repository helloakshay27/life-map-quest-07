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

// ─── Brand Palette ────────────────────────────────────────────────────────────
const C = {
  coral:     "#D5474E",
  coral8:    "rgba(213,71,78,0.08)",
  coral15:   "rgba(213,71,78,0.15)",
  charcoal:  "#2A2A2A",
  cream:     "#F5CECA",
  forest:    "#0B5541",
  forest8:   "rgba(11,85,65,0.08)",
  forest15:  "rgba(11,85,65,0.15)",
  violet:    "#5534B7",
  violet8:   "rgba(85,52,183,0.08)",
  violet15:  "rgba(85,52,183,0.15)",
  sand:      "#C5AB92",
  sand15:    "rgba(197,171,146,0.15)",
  sand40:    "rgba(197,171,146,0.40)",
  dune:      "#E8C0A8",
  mist:      "#D1D4A6",
  stone:     "#888765",
  success:   "#44AF90",
  warning:   "#F4A94C",
  warning8:  "rgba(244,169,76,0.08)",
  crimson:   "#C72540",
  sky:       "#2B6CC5",
  sky8:      "rgba(43,108,197,0.08)",
  amber:     "#F4A94C",
  leaf:      "#3A6011",
  lavender:  "#C0CBEB",
  pageBg:    "#FAF7F3",
};

const ANALYTICS_URL = "https://life-api.lockated.com/analytics";
const VALUES_URL    = "https://life-api.lockated.com/core_values";

// ─── Main Analytics Component ─────────────────────────────────────────────────
const Analytics = () => {
  const [metrics, setMetrics] = useState({ uniqueDays: 0, weekly: 0, alignment: 0, energy: 0 });
  const [chartData, setChartData]           = useState([]);
  const [lifeBalanceData, setLifeBalanceData] = useState({});
  const [valuesData, setValuesData]         = useState([]);
  const [insights, setInsights]             = useState([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState<string | null>(null);

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
          fetch(VALUES_URL,    { method: "GET", headers }),
        ]);

        if (resA.status === "fulfilled" && resA.value.ok) {
          try {
            const aData   = await resA.value.json();
            const summary = aData.summary || {};
            setMetrics({
              uniqueDays: summary.unique_days  ?? aData.unique_days  ?? 0,
              weekly:     summary.weekly_count ?? aData.weekly_count ?? 0,
              alignment:  summary.avg_alignment ?? aData.avg_alignment ?? 0,
              energy:     summary.avg_energy    ?? aData.avg_energy    ?? 0,
            });
            setChartData(aData.trends       || []);
            setLifeBalanceData(aData.life_balance || {});
            setInsights(aData.insights      || []);
          } catch (e) { console.error("Analytics parsing failed:", e); }
        }

        if (resV.status === "fulfilled" && resV.value.ok) {
          try {
            const vData    = await resV.value.json();
            const rawArray = Array.isArray(vData) ? vData : vData.data || vData.values || [];
            setValuesData(rawArray.map((item: any) => ({
              id:    item.id    || Math.random(),
              value: item.name  || item.value || "Unknown",
              days:  item.priority || item.days || 0,
              color: item.color || "violet",
            })));
          } catch (e) { console.error("Values mapping failed:", e); }
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
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: C.pageBg }}>
        <Loader2 className="animate-spin h-10 w-10" style={{ color: C.coral }} />
      </div>
    );

  if (error)
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: C.pageBg, padding: "0 16px" }}>
        <p style={{ fontSize: 14, textAlign: "center", color: C.crimson }}>{error}</p>
      </div>
    );

  return (
    <div
      className="w-full space-y-5 px-4 py-5 md:px-6 md:py-8 lg:px-0 animate-in fade-in duration-500"
      style={{ background: C.pageBg, minHeight: "100vh" }}
    >
      {/* Header */}
      <header className="space-y-1">
        <h2
          className="text-2xl sm:text-3xl font-bold tracking-tight leading-tight"
          style={{ color: C.charcoal }}
        >
          Analytics &amp; Insights
        </h2>
        <p className="text-sm sm:text-base" style={{ color: C.stone }}>
          Live data from your metrics and core values.
        </p>
      </header>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <MetricBox icon={FileText}   title="Unique Days" value={metrics.uniqueDays}                                         variant="coral"  />
        <MetricBox icon={Calendar}   title="Weekly Avg"  value={metrics.weekly}                                             variant="violet" />
        <MetricBox icon={TrendingUp} title="Alignment"   value={typeof metrics.alignment === "number" ? metrics.alignment.toFixed(1) : "0.0"} isScore variant="forest" />
        <MetricBox icon={Heart}      title="Energy"      value={typeof metrics.energy    === "number" ? metrics.energy.toFixed(1)    : "0.0"} isScore variant="amber"  />
      </div>

      {/* Trends Chart */}
      <div
        className="rounded-xl p-4 sm:p-6 shadow-sm overflow-hidden"
        style={{ background: "#FFFFFF", border: `1.5px solid ${C.dune}` }}
      >
        <h3 className="text-base sm:text-lg font-semibold mb-4" style={{ color: C.charcoal }}>
          Activity Trends
        </h3>
        <div className="w-full overflow-x-auto">
          <div className="min-w-[300px]">
            {chartData.length > 0 ? (
              <TrendsChart data={chartData} />
            ) : (
              <p style={{ fontSize: 14, color: C.stone }}>No chart data available yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Life Balance + Values */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        <LifeBalanceOverview mockLifeBalanceData={lifeBalanceData} />
        <ValuesInAction      mockValuesData={valuesData} />
      </div>

      {/* Key Insights */}
      <section
        className="p-4 sm:p-6 rounded-2xl"
        style={{ background: C.violet8, border: `1.5px solid ${C.violet15}` }}
      >
        <h3
          className="flex items-center gap-2 text-lg sm:text-xl font-bold mb-4"
          style={{ color: C.violet }}
        >
          <Lightbulb className="h-5 w-5 flex-shrink-0" />
          Key Insights
        </h3>
        <div className="space-y-3">
          {insights.length > 0 ? (
            insights.map((ins, i) => (
              <div
                key={i}
                className="p-3 sm:p-4 rounded-lg shadow-sm text-sm sm:text-base leading-relaxed"
                style={{ background: "#FFFFFF", border: `1px solid ${C.violet15}`, color: C.charcoal }}
              >
                {ins}
              </div>
            ))
          ) : (
            <p className="text-sm italic" style={{ color: C.stone }}>No insights yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Analytics;

// ─── Metric Box ───────────────────────────────────────────────────────────────
const MetricBox = ({ icon: Icon, title, value, variant, isScore }: any) => {
  const variants: Record<string, { bg: string; border: string; color: string }> = {
    coral:  { bg: C.coral8,   border: C.coral,   color: C.coral   },
    violet: { bg: C.violet8,  border: C.violet,  color: C.violet  },
    forest: { bg: C.forest8,  border: C.forest,  color: C.forest  },
    amber:  { bg: C.warning8, border: C.warning, color: C.warning },
  };
  const v = variants[variant] || variants.coral;

  return (
    <div
      className="p-4 sm:p-5 rounded-xl transition-all"
      style={{ background: v.bg, border: `1.5px solid ${v.border}` }}
    >
      <Icon className="mb-2 h-4 w-4 flex-shrink-0" style={{ color: v.color }} />
      <div className="text-xs sm:text-sm font-medium truncate" style={{ color: C.charcoal }}>
        {title}
      </div>
      <div className="text-2xl sm:text-3xl font-bold mt-0.5" style={{ color: v.color }}>
        {value !== undefined ? value : 0}
        {isScore && (
          <span className="text-base sm:text-lg font-medium" style={{ opacity: 0.55 }}>/10</span>
        )}
      </div>
    </div>
  );
};

// ─── Values in Action ─────────────────────────────────────────────────────────
const ValuesInAction = ({ mockValuesData = [] }: any) => {
  const colorMap: Record<string, string> = {
    purple:   C.violet,
    violet:   C.violet,
    teal:     C.forest,
    forest:   C.forest,
    red:      C.coral,
    coral:    C.coral,
    blue:     C.sky,
    sky:      C.sky,
    green:    C.leaf,
    leaf:     C.leaf,
    orange:   C.amber,
    amber:    C.amber,
    yellow:   C.warning,
    crimson:  C.crimson,
    lavender: C.lavender,
    stone:    C.stone,
    sand:     C.sand,
  };

  return (
    <div
      className="rounded-xl p-4 sm:p-6 shadow-sm flex flex-col h-full"
      style={{ background: "#FFFFFF", border: `1.5px solid ${C.dune}` }}
    >
      <div className="mb-5">
        <h3 className="text-[1.125rem] font-bold" style={{ color: C.charcoal }}>
          Values in Action
        </h3>
        <p className="text-sm mt-1" style={{ color: C.stone }}>
          Days each value appeared (Last 30 days)
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-3">
        {mockValuesData.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-32 rounded-lg border border-dashed"
            style={{ background: C.pageBg, borderColor: C.sand }}
          >
            <p className="text-sm font-medium" style={{ color: C.stone }}>
              No values recorded yet.
            </p>
          </div>
        ) : (
          mockValuesData.map((item: any) => {
            const hex = colorMap[item.color] || C.violet;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 rounded-lg transition-colors"
                style={{ background: hex + "14", border: `1px solid ${hex}30` }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full shadow-sm flex-shrink-0"
                    style={{ background: hex }}
                  />
                  <span className="font-semibold capitalize text-sm" style={{ color: C.charcoal }}>
                    {item.value}
                  </span>
                </div>
                <span
                  className="text-sm font-bold px-2.5 py-1 rounded-md"
                  style={{ background: "#FFFFFF", color: hex, border: `1px solid ${hex}40` }}
                >
                  {item.days} {item.days === 1 ? "day" : "days"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ─── Life Balance Overview ────────────────────────────────────────────────────
const LifeBalanceOverview = ({ mockLifeBalanceData = {} }: any) => {
  const dataArray = Object.entries(mockLifeBalanceData || {}).map(([key, val]) => ({
    name: key,
    days: Number(val) || 0,
  }));

  const maxDays = Math.max(...dataArray.map(d => d.days), 1);

  const barColors = [
    C.sky,
    C.amber,
    C.crimson,
    C.leaf,
    C.violet,
    C.forest,
    C.coral,
    C.stone,
  ];

  return (
    <div
      className="rounded-xl p-4 sm:p-6 shadow-sm flex flex-col h-full"
      style={{ background: "#FFFFFF", border: `1.5px solid ${C.dune}` }}
    >
      <div className="mb-5">
        <h3 className="text-[1.125rem] font-bold" style={{ color: C.charcoal }}>
          Life Balance Overview
        </h3>
        <p className="text-sm mt-1" style={{ color: C.stone }}>
          Based on unique days in each life area (Last 30 days)
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        {dataArray.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-32 rounded-lg border border-dashed"
            style={{ background: C.pageBg, borderColor: C.sand }}
          >
            <p className="text-sm font-medium" style={{ color: C.stone }}>
              No life balance data found yet.
            </p>
          </div>
        ) : (
          dataArray.map((item, index) => {
            const barColor = barColors[index % barColors.length];
            return (
              <div key={index} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold" style={{ color: C.charcoal }}>{item.name}</span>
                  <span className="font-medium"   style={{ color: C.stone    }}>{item.days} days</span>
                </div>
                <div
                  className="w-full rounded-full h-2.5 overflow-hidden"
                  style={{ background: C.sand40 }}
                >
                  <div
                    className="h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(item.days / maxDays) * 100}%`, background: barColor }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};