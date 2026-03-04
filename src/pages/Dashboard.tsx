import { useAuth } from "@/contexts/AuthContext";
import { TrendingUp, Calendar, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const { user, token } = useAuth();

  const [summaryData, setSummaryData] = useState<{
    energy_average?: number | null;
    alignment_average?: number | null;
    total_score?: number;
    highest_badge?: string | null;
    current_streak?: number;
    life_balance?: {
      [key: string]: number;
    };
  } | null>(null);

  const [insightsData, setInsightsData] = useState<{
    recent_journals: Array<{
      id: number;
      title?: string;
      created_at?: string;
      journal_date?: string;
      [key: string]: unknown;
    }>;
    personalized_insights: Array<{
      id?: number;
      insight?: string;
      text?: string;
      [key: string]: unknown;
    }>;
    journaling_status: {
      monthly_entries: number;
      weekly_entries: number;
    };
  }>({
    recent_journals: [],
    personalized_insights: [],
    journaling_status: { monthly_entries: 0, weekly_entries: 0 },
  });

  const [previewData, setPreviewData] = useState<{
    daily_motivator: string | null;
    priorities: Array<{
      id?: number;
      title?: string;
      description?: string;
      [key: string]: unknown;
    }>;
    upcoming_dates: Array<{
      id?: number;
      title?: string;
      date?: string;
      [key: string]: unknown;
    }>;
    story_of_the_day: string | null;
    mission: string | null;
    bucket_preview: Array<{
      id: number;
      title?: string;
      category?: string;
      status?: string;
      [key: string]: unknown;
    }>;
    leaderboard_preview: Array<{ name: string; points: number }>;
  }>({
    daily_motivator: null,
    priorities: [],
    upcoming_dates: [],
    story_of_the_day: null,
    mission: null,
    bucket_preview: [],
    leaderboard_preview: [],
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch(
          "https://life-api.lockated.com/dashboard/summary",
          {
            headers: {
              Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setSummaryData(data);
        }
      } catch (err) {
        console.error("Failed to fetch summary:", err);
      }
    };
    fetchSummary();
  }, [token]);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch(
          "https://life-api.lockated.com/dashboard/insights",
          {
            headers: {
              Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setInsightsData({
            recent_journals: data.recent_journals || [],
            personalized_insights: data.personalized_insights || [],
            journaling_status: data.journaling_status || {
              monthly_entries: 0,
              weekly_entries: 0,
            },
          });
        }
      } catch (err) {
        console.error("Failed to fetch insights:", err);
      }
    };
    fetchInsights();
  }, [token]);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const res = await fetch(
          "https://life-api.lockated.com/dashboard/preview",
          {
            headers: {
              Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
            },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setPreviewData({
            daily_motivator: data.daily_motivator || null,
            priorities: data.priorities || [],
            upcoming_dates: data.upcoming_dates || [],
            story_of_the_day: data.story_of_the_day || null,
            mission: data.mission || null,
            bucket_preview: data.bucket_preview || [],
            leaderboard_preview: data.leaderboard_preview || [],
          });
        }
      } catch (err) {
        console.error("Failed to fetch preview:", err);
      }
    };
    fetchPreview();
  }, [token]);

  const timePeriods = [
    { label: "Daily", active: true },
    { label: "Weekly", active: false },
    { label: "Monthly", active: false },
    { label: "Q1-Q2", active: false },
    { label: "Skiller", active: false },
  ];

  const motivationItems = [
    {
      icon: "🔥",
      label: "DAILY MOTIVATOR",
      desc: "Let the seeds you plant today blossom tomorrow. Find those one light...",
    },
    {
      icon: "🎯",
      label: "ACTION",
      desc: "Take 10 mins right now to guide you. Discover a new habit card today.",
    },
    {
      icon: "⭐",
      label: "PURPOSE",
      desc: "Give your year a purpose. Check priorities in daily journal.",
    },
  ];

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const lifeAreas = [
    "Career",
    "Finances",
    "Health",
    "Personal Growth",
    "Relationships",
  ];

  return (
    <div className="animate-fade-in space-y-6 w-full max-w-screen-xl mx-auto px-3 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Welcome Back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Let's align your day with your purpose
        </p>
      </div>

      {/* Time Period Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {timePeriods.map((period) => (
          <Badge
            key={period.label}
            variant={period.active ? "default" : "outline"}
            className="cursor-pointer px-3 py-1.5 text-xs font-medium whitespace-nowrap flex-shrink-0"
          >
            {period.label}
          </Badge>
        ))}
      </div>

      {/* Daily Focus & Inspiration */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Daily Focus & Inspiration
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Daily Motivator – live from API */}
          <Card className="p-4 border-l-4 border-l-orange-400 hover:shadow-md transition-shadow w-full">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔥</span>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-foreground">
                  DAILY MOTIVATOR
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {previewData.daily_motivator
                    ? previewData.daily_motivator
                    : "Let the seeds you plant today blossom tomorrow. Find those one light..."}
                </p>
              </div>
            </div>
          </Card>
          {/* Story of the Day – live from API */}
          <Card className="p-4 border-l-4 border-l-orange-400 hover:shadow-md transition-shadow w-full">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-foreground">
                  ACTION
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {previewData.story_of_the_day
                    ? previewData.story_of_the_day
                    : "Take 10 mins right now to guide you. Discover a new habit card today."}
                </p>
              </div>
            </div>
          </Card>
          {/* Mission – live from API */}
          <Card className="p-4 border-l-4 border-l-orange-400 hover:shadow-md transition-shadow w-full">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⭐</span>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-foreground">
                  PURPOSE
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {previewData.mission
                    ? previewData.mission
                    : "Give your year a purpose. Check priorities in daily journal."}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Priorities, Aura Energy, Alignment */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 border-t-4 border-t-blue-400">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <span className="text-lg">📋</span> Priorities
          </h3>
          <p className="text-xs text-muted-foreground mb-2">
            For{" "}
            {new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </p>
          <div className="space-y-2">
            {previewData.priorities.length > 0 ? (
              previewData.priorities.map((p, idx) => (
                <div
                  key={p.id ?? idx}
                  className="flex items-start gap-2 text-xs"
                >
                  <span className="mt-0.5 text-blue-400">•</span>
                  <p className="text-foreground">
                    {p.title || p.description || JSON.stringify(p)}
                  </p>
                </div>
              ))
            ) : (
              <>
                <p className="text-xs text-center text-gray-400">
                  No priorities or todos
                </p>
                <p className="text-xs text-blue-600 hover:underline cursor-pointer">
                  Set in daily journal →
                </p>
              </>
            )}
          </div>
        </Card>

        <Card className="p-4 border-t-4 border-t-orange-400">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" /> Aura Energy
            </h3>
            {summaryData?.energy_average !== null &&
              summaryData?.energy_average !== undefined && (
                <span className="text-lg font-bold text-orange-600">
                  {Number(summaryData.energy_average).toFixed(1)}
                </span>
              )}
          </div>
          <div className="flex justify-between">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-xs text-center font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Upcoming
          </p>
        </Card>

        <Card className="p-4 border-t-4 border-t-purple-400">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span className="text-lg">✨</span> Alignment
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs items-center">
              <span>This Week Avg</span>
              <span className="text-lg font-bold text-purple-600 border border-purple-100 bg-purple-50 px-2 rounded-md">
                {summaryData?.alignment_average !== null &&
                summaryData?.alignment_average !== undefined
                  ? Number(summaryData.alignment_average).toFixed(1)
                  : "0"}
              </span>
            </div>
            <div className="text-xs text-gray-400 text-center mt-2">
              Upcoming tracking
            </div>
          </div>
        </Card>
      </div>

      {/* Highlight Rank & Journaling Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-4 border-t-4 border-t-yellow-400 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-500" /> Highlight
                Rank
              </h3>
              <p className="text-xs text-blue-600 hover:underline cursor-pointer">
                View All
              </p>
            </div>
            {summaryData?.highest_badge ? (
              <div className="flex items-center gap-3 bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                <span className="text-2xl">🏅</span>
                <span className="text-sm font-bold text-yellow-800">
                  {summaryData.highest_badge}
                </span>
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400">No bangers yet</p>
                <p className="text-xs text-gray-500 mt-2">
                  Start journaling to see bangers
                </p>
              </>
            )}
          </div>
          <div className="mt-3 pt-3 border-t text-xs flex justify-between">
            <p className="font-medium">Total Unlocked</p>
            <p className="font-bold text-yellow-600">
              {summaryData?.highest_badge ? "1" : "0"}
            </p>
          </div>
        </Card>

        <Card className="p-4 border-t-4 border-t-cyan-400">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-500" /> Journaling Status
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center bg-cyan-50 rounded-lg p-2">
              <p className="text-2xl font-bold text-cyan-700">
                {insightsData.journaling_status.weekly_entries}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">This Week</p>
            </div>
            <div className="text-center bg-cyan-50 rounded-lg p-2">
              <p className="text-2xl font-bold text-cyan-700">
                {insightsData.journaling_status.monthly_entries}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5">This Month</p>
            </div>
          </div>
          <div className="flex justify-between mb-1">
            {weekDays.map((day) => (
              <div key={day} className="text-xs text-center text-gray-400">
                {day.substring(0, 1)}
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {insightsData.journaling_status.weekly_entries > 0
              ? `${Math.min((insightsData.journaling_status.weekly_entries / 7) * 100, 100).toFixed(0)}% Weekly Complete`
              : "Start journaling to track progress"}
          </p>
        </Card>
      </div>

      {/* Purpose & Direction Banner */}
      <Card className="p-8 bg-red-500 text-white text-center rounded-lg">
        <div className="flex justify-center mb-2">
          <span className="text-3xl">✨</span>
        </div>
        <h3 className="font-semibold text-lg">
          {previewData.mission
            ? previewData.mission
            : "Define your mission to guide your journey"}
        </h3>
      </Card>

      {/* Execution & Tracking */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Execution & Tracking
        </h2>
        <Card className="p-6 border-t-4 border-t-orange-400">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <span className="text-lg">📓</span> Journaling Consistency
            </h3>
            <Badge
              variant="secondary"
              className="bg-orange-50 text-orange-700 border-orange-200"
            >
              Total Score: {summaryData?.total_score || 0}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">
                {summaryData?.current_streak || 0}
              </p>
              <p className="text-xs text-muted-foreground">Current Streak</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">0</p>
              <p className="text-xs text-muted-foreground">Last 30 Days</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-foreground mb-2 flex justify-between">
              <span>Consistency Score</span>
              <span className="text-orange-600 font-bold">
                {Math.min(
                  ((summaryData?.current_streak || 0) / 7) * 100,
                  100,
                ).toFixed(0)}
                %
              </span>
            </p>
            <div className="bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
              <div
                className="bg-orange-400 h-full transition-all duration-500"
                style={{
                  width: `${Math.min(((summaryData?.current_streak || 0) / 7) * 100, 100)}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">Based on weekly goal</p>
          </div>
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs font-medium text-foreground mb-4">
              Life Balance (Last 7 Days)
            </p>
            <div className="flex items-end justify-around gap-2 h-32">
              {lifeAreas.map((label) => {
                const key =
                  label === "Personal Growth" ? "growth" : label.toLowerCase();
                const score = summaryData?.life_balance?.[key] || 0;
                const heightPercentage = Math.max((score / 5) * 100, 5); // 5% min height

                return (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-2 flex-1 group"
                  >
                    <div className="relative w-full max-w-[40px] h-24 bg-gray-100 rounded-t-lg mx-auto overflow-hidden">
                      <div
                        className="absolute bottom-0 w-full bg-[#c69cf4] transition-all duration-700 group-hover:bg-[#b58ce3]"
                        style={{ height: `${heightPercentage}%` }}
                      ></div>
                    </div>
                    <span
                      className="text-[10px] sm:text-xs text-gray-500 text-center leading-tight truncate w-full"
                      title={`${label}: ${score.toFixed(1)}`}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>

      {/* Review & Growth */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          Review & Growth
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4">
            <h3 className="font-semibold text-sm mb-3">
              Recent Journal Entries
            </h3>
            {insightsData.recent_journals.length > 0 ? (
              <div className="space-y-2">
                {insightsData.recent_journals.slice(0, 5).map((journal) => (
                  <div
                    key={journal.id}
                    className="text-xs border-l-2 border-l-blue-300 pl-2 py-1"
                  >
                    <p className="font-medium text-foreground truncate">
                      {journal.title || `Journal #${journal.id}`}
                    </p>
                    {(journal.journal_date || journal.created_at) && (
                      <p className="text-gray-400 mt-0.5">
                        {new Date(
                          (journal.journal_date ||
                            journal.created_at) as string,
                        ).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">
                No entries yet. Start journaling today!
              </p>
            )}
          </Card>

          <Card className="p-4 bg-purple-50">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <span className="text-lg">✨</span> Personalized Insights
            </h3>
            {insightsData.personalized_insights.length > 0 ? (
              <div className="space-y-2">
                {insightsData.personalized_insights
                  .slice(0, 4)
                  .map((insight, idx) => (
                    <div
                      key={insight.id ?? idx}
                      className="text-xs text-gray-700 bg-white rounded-md p-2 border border-purple-100 leading-relaxed"
                    >
                      {insight.insight ||
                        insight.text ||
                        JSON.stringify(insight)}
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-gray-600">
                Start journaling to discover patterns and insights about your
                journey
              </p>
            )}
          </Card>

          <Card className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-sm">Bucket List Dreams</h3>
              <a href="#" className="text-xs text-blue-600 hover:underline">
                View All
              </a>
            </div>
            <div className="space-y-2">
              {previewData.bucket_preview.length > 0 ? (
                previewData.bucket_preview.map((item) => (
                  <div key={item.id} className="text-xs">
                    <p className="font-medium text-foreground">{item.title}</p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {item.status && (
                        <Badge
                          variant="outline"
                          className="text-xs py-0 capitalize"
                        >
                          {item.status.replace(/_/g, " ")}
                        </Badge>
                      )}
                      {item.category && (
                        <Badge variant="outline" className="text-xs py-0">
                          {item.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">
                  No bucket list items yet.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Leaderboard */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <span className="text-lg">🏆</span> Leaderboard
          </h3>
          <a href="#" className="text-xs text-blue-600 hover:underline">
            View All
          </a>
        </div>
        <div className="space-y-2">
          {previewData.leaderboard_preview.length > 0 ? (
            previewData.leaderboard_preview.map((person, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-2 text-sm border-b last:border-b-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white ${
                      idx === 0
                        ? "bg-yellow-400"
                        : idx === 1
                          ? "bg-gray-400"
                          : idx === 2
                            ? "bg-amber-600"
                            : "bg-gray-300"
                    }`}
                  >
                    {idx < 3 ? ["🥇", "🥈", "🥉"][idx] : person.name[0]}
                  </div>
                  <span className="text-foreground truncate">
                    {person.name}
                  </span>
                </div>
                <span className="font-semibold text-foreground ml-4 flex-shrink-0">
                  {person.points} pts
                </span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">
              No leaderboard data yet.
            </p>
          )}
        </div>
      </Card>

      {/* Beta Testing Notice */}
      <Card className="p-4 bg-red-50 border-l-4 border-l-red-500">
        <div className="flex gap-3">
          <span className="text-lg flex-shrink-0">🔔</span>
          <div>
            <h4 className="font-semibold text-sm text-red-800">
              Beta Testing Notice
            </h4>
            <p className="text-xs text-red-700 mt-1">
              We are continuously improving your experience. If you face any
              challenges, we cannot provide performance guarantees at this
              stage. We recommend bookmarking your regularly for safekeeping.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
