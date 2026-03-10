import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Calendar,
  Zap,
  Settings,
  BookOpen,
  CalendarDays,
  Trophy,
  Sparkles,
  Play,
  ChevronLeft,
  ChevronRight,
  Target,
  CalendarIcon,
  ListTodo,
  ArrowRight,
  Heart,
  Lock,
  Flame,
  Lightbulb,
  Plus,
  ListOrdered,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

const Dashboard = () => {
  const { user, token, login } = useAuth();

  // Debug: Check what user data we have
  useEffect(() => {
    console.log("Dashboard - User from AuthContext:", user);
    console.log("Dashboard - Token:", token);
    console.log("Dashboard - LocalStorage user:", localStorage.getItem("user"));
  }, [user, token]);

  // If the user's name is generic, try fetching true profile info
  useEffect(() => {
    if (user && (user.name === "User" || user.name === "Guest") && token) {
      const fetchProfile = async () => {
        try {
          const res = await fetch("https://life-api.lockated.com/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            const bestName =
              [
                data.name,
                data.full_name,
                [data.first_name, data.last_name].filter(Boolean).join(" "),
                data.username,
                data.given_name,
              ].find((n) => n && typeof n === "string" && n.trim() !== "") ||
              user.name;

            if (bestName !== user.name) {
              login(token, { ...user, name: bestName });
            }
          }
        } catch (err) {
          console.error(
            "Dashboard - Failed to fetch profile to update name:",
            err,
          );
        }
      };

      fetchProfile();
    }
  }, [user, token, login]);

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

  const [setupCount, setSetupCount] = useState<{ completed: number; total: number }>({
    completed: 2,
    total: 5,
  });

  // Load setup count from localStorage
  useEffect(() => {
    const completed = parseInt(localStorage.getItem("setupCompletedCount") || "2");
    const total = parseInt(localStorage.getItem("setupTotalCount") || "5");
    setSetupCount({ completed, total });

    // Listen for changes from other tabs/windows
    const handleStorageChange = () => {
      const updatedCompleted = parseInt(localStorage.getItem("setupCompletedCount") || "2");
      const updatedTotal = parseInt(localStorage.getItem("setupTotalCount") || "5");
      setSetupCount({ completed: updatedCompleted, total: updatedTotal });
    };

    // Listen for visibility changes to refresh when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const updatedCompleted = parseInt(localStorage.getItem("setupCompletedCount") || "2");
        const updatedTotal = parseInt(localStorage.getItem("setupTotalCount") || "5");
        setSetupCount({ completed: updatedCompleted, total: updatedTotal });
      }
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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

  // Fetch actual dreams API to populate Bucket List Dreams directly from source
  useEffect(() => {
    const fetchDreams = async () => {
      try {
        const response = await fetch("https://life-api.lockated.com/dreams", {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch dreams");
        const data = await response.json();

        const mappedItems: Array<{
          id: number;
          title?: string;
          category?: string;
          status?: string;
        }> = [];

        const mapCategory = (itemsArray: unknown[], statusStr: string) => {
          if (!Array.isArray(itemsArray)) return;
          itemsArray.forEach((itemObj: unknown) => {
            const item = itemObj as {
              id: number;
              title: string;
              category: string;
            };
            mappedItems.push({
              id: item.id,
              title: item.title,
              category: item.category,
              status: statusStr,
            });
          });
        };

        mapCategory(data.dreaming, "Dreaming");
        mapCategory(data.planning, "Planning");
        mapCategory(data.in_progress, "In Progress");
        mapCategory(data.achieved, "Achieved");

        setPreviewData((prev) => ({
          ...prev,
          bucket_preview: mappedItems,
        }));
      } catch (error) {
        console.error("Error fetching dreams:", error);
      }
    };
    fetchDreams();
  }, [token]);

  // Fetch actual todos API to populate Priorities
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const response = await fetch("https://life-api.lockated.com/todos", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const rawData = await response.json();
          const activeTodos = Array.isArray(rawData)
            ? rawData
                .filter((t: any) => {
                  const status = String(t.status).toLowerCase();
                  return status !== "completed";
                })
                .slice(0, 3)
            : [];

          setPreviewData((prev) => ({
            ...prev,
            priorities: activeTodos,
          }));
          return;
        }
        throw new Error("API not ok");
      } catch (error) {
        console.error(
          "Dashboard priorities API error, falling back to local storage:",
          error,
        );
        try {
          const savedTodosStr = localStorage.getItem("user_todos");
          if (savedTodosStr) {
            const savedTodos = JSON.parse(savedTodosStr);
            const activeTodos = Array.isArray(savedTodos)
              ? savedTodos
                  .filter((t: any) => {
                    const status = String(t.status).toLowerCase();
                    return status !== "completed";
                  })
                  .slice(0, 3)
              : [];

            setPreviewData((prev) => ({
              ...prev,
              priorities: activeTodos,
            }));
          }
        } catch (fallbackError) {
          console.error("Local storage fallback failed", fallbackError);
        }
      }
    };
    fetchTodos();
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
    <div className="animate-fade-in space-y-6 w-full">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Welcome Back, {user?.name || "Guest"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Let's align your day with your purpose
          </p>
        </div>

        {/* Top Actions */}
        <div className="flex gap-2 items-center flex-wrap">
          <Link to="/setup">
            <Button
              variant="outline"
              className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 gap-1.5 h-9 px-3 text-xs"
            >
              <Settings className="w-3.5 h-3.5" />
              Setup
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white ml-1 h-5 px-1.5 rounded-sm">
                {setupCount.completed}/{setupCount.total}
              </Badge>
            </Button>
          </Link>
          <Link to="/daily-journal">
            <Button
              variant="outline"
              className="bg-red-200 text-red-800 border-red-300 hover:bg-red-300 gap-1.5 h-9 px-3 text-xs font-medium"
            >
              <BookOpen className="w-3.5 h-3.5 text-red-700" />
              Daily
            </Button>
          </Link>
          <Link to="/weekly-journal">
            <Button
              variant="outline"
              className="bg-red-400 text-white border-red-500 hover:bg-red-500 gap-1.5 h-9 px-3 text-xs shadow-sm shadow-red-200"
            >
              <Calendar className="w-3.5 h-3.5" />
              Weekly
            </Button>
          </Link>
          <Link to="/calendar">
            <Button
              variant="outline"
              className="bg-blue-400 text-white border-blue-500 hover:bg-blue-500 gap-1.5 h-9 px-3 text-xs shadow-sm shadow-blue-200"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Cal
            </Button>
          </Link>
          <Link to="/leaderboard">
            <Button
              variant="outline"
              className="bg-amber-400 text-amber-900 border-amber-500 hover:bg-amber-500 gap-1.5 h-9 px-3 text-xs font-semibold shadow-sm shadow-amber-200"
            >
              <Trophy className="w-3.5 h-3.5" />
              Score: {summaryData?.total_score || 10}
            </Button>
          </Link>
        </div>
      </div>

      {/* Daily Focus & Inspiration */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-foreground">
            Daily Focus & Inspiration
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Daily Motivator */}
          <Card className="bg-red-50/50 border-red-200 overflow-hidden flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)]">
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-red-500 p-1.5 rounded-lg text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs text-red-900 tracking-wide">
                  DAILY MOTIVATOR
                </h3>
                <Sparkles className="w-3 h-3 text-amber-400 ml-auto" />
              </div>
              <div className="flex-1 relative pl-6 mt-2">
                <span className="text-4xl text-red-200 absolute -top-4 left-0 font-serif leading-none">
                  "
                </span>
                <p className="text-sm font-medium text-red-900 leading-relaxed mb-2 z-10 relative">
                  {previewData.daily_motivator
                    ? previewData.daily_motivator
                    : "Other people's opinion of you does not have to become your reality."}
                </p>
                <p className="text-xs text-red-700 font-medium">— Les Brown</p>
              </div>
            </div>
            <div className="px-4 pb-4">
              <div className="bg-red-100/80 rounded-lg p-3 border border-red-200">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Target className="w-3.5 h-3.5 text-red-600" />
                  <h4 className="font-bold text-[10px] uppercase text-red-900">
                    Action
                  </h4>
                </div>
                <p className="text-[11px] text-red-800 leading-tight">
                  You define your worth. Don't accept other's limited views of
                  you.
                </p>
              </div>
            </div>
          </Card>

          {/* Priorities */}
          <Card className="bg-blue-50/50 border-blue-200 p-4 flex flex-col shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-blue-600" /> Priorities
              </h3>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-700 hover:bg-blue-200 shadow-sm font-medium text-[10px] px-2 py-0.5 pointer-events-none"
              >
                For:{" "}
                {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Badge>
            </div>

            {previewData.priorities.length > 0 ? (
              <div className="flex-1 flex flex-col gap-2 mt-4">
                {previewData.priorities.map(
                  (
                    todo: {
                      id?: string | number;
                      title?: string;
                      priority?: string;
                    },
                    idx,
                  ) => (
                    <div
                      key={todo.id || idx}
                      className="bg-white rounded-lg p-2.5 border border-blue-100 flex items-start gap-2.5 shadow-sm transition-all hover:border-blue-300"
                    >
                      <div className="w-4 h-4 rounded-md mt-0.5 border-[1.5px] border-blue-300 flex-shrink-0 bg-blue-50/50" />
                      <div>
                        <p className="text-xs font-bold text-slate-700 leading-tight">
                          {todo.title}
                        </p>
                        {todo.priority && (
                          <div className="mt-1">
                            <span
                              className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm ${
                                todo.priority === "urgent"
                                  ? "bg-red-100 text-red-700"
                                  : todo.priority === "high"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {todo.priority}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center mt-6">
                <p className="text-sm text-slate-500 mb-1.5 font-medium">
                  No priorities underway.
                </p>
                <Link
                  to="/todos"
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 mt-1"
                >
                  Manage Todos <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </Card>

          {/* People Empty State */}
          <Card className="bg-pink-50/30 border-pink-200 p-4 flex flex-col items-center justify-center min-h-[180px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)]">
            <CalendarIcon
              className="w-10 h-10 text-pink-300 mb-3"
              strokeWidth={1.5}
            />
            <p className="text-sm text-slate-500 text-center">
              No people added yet
            </p>
          </Card>
        </div>
      </div>

      {/* Story of the Day (Video Box) */}
      <Card className="bg-orange-50 border-orange-200 overflow-hidden flex flex-col mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)]">
        <div className="p-4 flex items-center justify-between border-b border-orange-100/50">
          <div className="flex gap-3 items-center">
            <div className="bg-[#E86438] p-2 rounded-lg text-white">
              <Play className="w-5 h-5 fill-current ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-[#B45309]">
                  Story of the Day
                </h3>
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {previewData.story_of_the_day ||
                  "Story # 127: How can she be so calm ? वह इतनी शांत कैसे हो सकती है?"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 hover:bg-orange-100/80 rounded-md text-orange-800 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1.5 hover:bg-orange-100/80 rounded-md text-orange-800 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Embed */}
        <div
          className="relative w-full aspect-video md:aspect-[28/9] bg-black group overflow-hidden bg-cover bg-center cursor-pointer"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?auto=format&fit=crop&q=80')",
          }}
        >
          {/* Faux Play Button for UI matching */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-all">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <Play className="w-8 h-8 text-white fill-current ml-1" />
            </div>
          </div>

          <div className="absolute bottom-4 right-4 flex gap-4 text-white">
            <div className="flex flex-col items-center">
              <CalendarIcon className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold">Watch later</span>
            </div>
            <div className="flex flex-col items-center">
              <ArrowRight className="w-5 h-5 mb-1 -rotate-45" />
              <span className="text-[10px] font-bold">Share</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress & Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Avg Energy & Alignment & Calendar block */}
        <Card className="bg-gradient-to-br from-[#FCF7FF] to-[#FFF5FB] p-5 rounded-2xl border-0 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-3 items-center">
              <div className="bg-[#FF6B2C] w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shadow-[#FF6B2C]/20">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">
                  Avg Energy
                </p>
                <p className="text-xl font-extrabold text-slate-800 tracking-tight">
                  {summaryData?.energy_average !== null &&
                  summaryData?.energy_average !== undefined
                    ? Number(summaryData.energy_average).toFixed(1)
                    : "-"}
                </p>
              </div>
            </div>

            <div className="h-10 w-px bg-slate-200"></div>

            <div className="flex gap-3 items-center">
              <div className="bg-[#8B5CF6] w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shadow-[#8B5CF6]/20">
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-0.5">
                  Alignment
                </p>
                <p className="text-xl font-extrabold text-slate-800 tracking-tight">
                  {summaryData?.alignment_average !== null &&
                  summaryData?.alignment_average !== undefined
                    ? Number(summaryData.alignment_average).toFixed(1)
                    : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.04)]">
            <div className="flex justify-between items-center mb-4 px-2">
              <ChevronLeft className="w-4 h-4 text-[#FF6B2C] cursor-pointer" />
              <h4 className="font-bold text-sm text-slate-700">This Week</h4>
              <ChevronRight className="w-4 h-4 text-[#FF6B2C] cursor-pointer" />
            </div>

            <div className="flex justify-between gap-1 mb-4">
              {[
                { day: "Su", date: "8", state: "missed" },
                { day: "M", date: "9", state: "missed" },
                { day: "Tu", date: "10", state: "upcoming", active: true },
                { day: "W", date: "11", state: "upcoming" },
                { day: "Th", date: "12", state: "upcoming" },
                { day: "F", date: "13", state: "upcoming" },
                { day: "Sa", date: "14", state: "upcoming" },
              ].map((d) => (
                <div
                  key={d.day}
                  className={`flex flex-col items-center justify-center py-2 px-1 w-9 rounded-xl ${d.active ? "border-[1.5px] border-[#FF6B2C] shadow-sm bg-white" : ""}`}
                >
                  <span className="text-[10px] text-slate-500 font-bold mb-1">
                    {d.day}
                  </span>
                  <span
                    className={`text-sm font-extrabold ${d.active ? "text-[#FF6B2C]" : "text-slate-700"}`}
                  >
                    {d.date}
                  </span>
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 ${d.state === "missed" ? "bg-[#EF4444]" : d.state === "filled" ? "bg-[#22C55E]" : "bg-slate-200"}`}
                  ></div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-5 text-[10px] font-bold text-slate-500 mt-2">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></div>{" "}
                Filled
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></div>{" "}
                Missed
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>{" "}
                Upcoming
              </div>
            </div>
          </div>
        </Card>

        {/* Highest Rank */}
        <Card className="bg-[#FFFBF2] p-5 rounded-2xl border border-orange-100/60 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)]">
          <div className="flex justify-between items-center mb-10">
            <h3 className="font-bold text-[#C2410C] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#C2410C]" /> Highest Rank
            </h3>
            <Link 
              to="/achievements"
              className="text-xs font-bold text-[#EA580C] hover:underline transition-colors"
            >
              View All
            </Link>
          </div>

          <div className="flex flex-col items-center justify-center flex-1">
            <div className="w-16 h-16 bg-[#FFEDD5] rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-[#F97316]" strokeWidth={2.5} />
            </div>
            <h4 className="font-bold text-slate-700 mb-1.5 text-base">
              No badges yet
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              Start journaling to earn titles!
            </p>
          </div>

          <div className="flex justify-between items-center mt-10 pt-4 border-t border-orange-100/60">
            <span className="text-xs font-bold text-slate-500">
              Total Unlocked
            </span>
            <span className="text-sm font-extrabold text-slate-800">
              {summaryData?.highest_badge ? "1 / 19" : "0 / 19"}
            </span>
          </div>
        </Card>

        {/* Journaling Status */}
        <Card className="bg-[#F0FDF8] p-5 rounded-2xl border border-[#CCFBF1] flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)]">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-[#0F766E] flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Journaling Status
            </h3>
          </div>

          {/* Daily Track */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold text-[#0F766E]">
                Daily (4 Mar - 10 Mar)
              </span>
              <span className="text-[11px] font-bold text-slate-700">0/7</span>
            </div>
            <div className="flex justify-between gap-1">
              {["Wed", "Thu", "Fri", "Sat", "Sun", "Mon", "Tue"].map((day) => (
                <div key={day} className="flex flex-col items-center gap-1.5">
                  <div className="w-8 h-8 rounded-lg border border-[#99F6E4] bg-white flex items-center justify-center shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                    <div className="w-3 rounded-full border border-[#5EEAD4] aspect-square"></div>
                  </div>
                  <span className="text-[9px] font-bold text-[#0D9488]">
                    {day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Track */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold text-[#0F766E]">
                Weekly (March 2026)
              </span>
              <span className="text-[11px] font-bold text-slate-700">0/5</span>
            </div>
            <div className="flex justify-between gap-1">
              {[
                { label: "WK#10", dates: "(Mar 1-7)" },
                { label: "WK#11", dates: "(Mar 8-14)" },
                { label: "WK#12", dates: "(Mar 15-21)" },
                { label: "WK#13", dates: "(Mar 22-28)" },
                { label: "WK#14", dates: "(Mar 29-4)" },
              ].map((wk) => (
                <div
                  key={wk.label}
                  className="flex flex-col items-center gap-1"
                >
                  <div className="w-10 h-10 rounded-lg border border-[#99F6E4] bg-white flex items-center justify-center mb-0.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                    <Calendar className="w-4 h-4 text-[#5EEAD4]" />
                  </div>
                  <span className="text-[9px] font-bold text-[#0D9488]">
                    {wk.label}
                  </span>
                  <span className="text-[8px] font-medium text-[#14B8A6] tracking-tighter">
                    {wk.dates}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-1 pt-4 border-t border-[#CCFBF1]">
            <span className="text-[11px] font-bold text-[#0D9488]">
              Keep up the momentum!
            </span>
            <span className="text-[11px] font-extrabold text-slate-800">
              {insightsData.journaling_status.weekly_entries > 0
                ? `${Math.min((insightsData.journaling_status.weekly_entries / 7) * 100, 100).toFixed(0)}% Complete`
                : "0% Complete"}
            </span>
          </div>
        </Card>
      </div>

      {/* Purpose & Direction Banner */}
      <div className="mt-8 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-[#E63946]" strokeWidth={2.5} />
          <h2 className="text-sm font-bold text-slate-800">
            Purpose & Direction
          </h2>
        </div>
        <Card className="p-10 bg-[#E03C3E] text-white text-center rounded-xl border-0 shadow-[0_4px_20px_rgba(224,60,62,0.3)] transition-shadow hover:shadow-[0_4px_25px_rgba(224,60,62,0.4)]">
          <div className="flex justify-center mb-4">
            <Sparkles className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h3 className="font-medium text-[15px]">
            {previewData.mission
              ? previewData.mission
              : "Define your mission to guide your journey"}
          </h3>
        </Card>
      </div>

      {/* Execution & Tracking */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-[#E63946]" strokeWidth={2.5} />
          <h2 className="text-sm font-bold text-slate-800">
            Execution & Tracking
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Journaling Consistency Block */}
          <Card className="p-6 bg-[#FFF8F3] border border-[#FDBA74] shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#F97316] flex items-center justify-center text-white shadow-sm">
                <Flame className="w-5 h-5 fill-current" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">
                Journaling Consistency
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-sm border border-[#FFF7ED]">
                <div className="flex items-center gap-1.5 mb-1 text-slate-800">
                  <Flame className="w-4 h-4 text-[#F97316]" />
                  <span className="text-2xl font-extrabold">
                    {summaryData?.current_streak || 0}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium tracking-tight">
                  Current Streak
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-sm border border-[#FFF7ED]">
                <div className="flex items-center gap-1.5 mb-1 text-slate-800">
                  <Calendar className="w-4 h-4 text-[#3B82F6]" />
                  <span className="text-2xl font-extrabold">0</span>
                </div>
                <span className="text-xs text-slate-500 font-medium tracking-tight">
                  Last 30 Days
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#FFF7ED] mb-5">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold text-slate-600">
                  Consistency Score
                </span>
                <span className="font-extrabold text-slate-800 tracking-tight">
                  {Math.min(
                    ((summaryData?.current_streak || 0) / 7) * 100,
                    100,
                  ).toFixed(0)}
                  %
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-slate-200 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(((summaryData?.current_streak || 0) / 7) * 100, 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-[#FFF7ED]">
              <h4 className="text-xs font-bold text-slate-600 mb-6">
                Life Balance (Last 7 Days)
              </h4>
              <div className="relative w-full aspect-square max-w-[200px] mx-auto opacity-40 mix-blend-multiply">
                {/* Visual Radar Mockup for empty state matching layout */}
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full stroke-slate-400 fill-none"
                  strokeWidth="0.5"
                >
                  <polygon points="50,10 90,40 75,90 25,90 10,40" />
                  <polygon points="50,25 80,48 68,80 32,80 20,48" />
                  <polygon points="50,40 70,55 62,70 38,70 30,55" />
                  <line x1="50" y1="50" x2="50" y2="10" />
                  <line x1="50" y1="50" x2="90" y2="40" />
                  <line x1="50" y1="50" x2="75" y2="90" />
                  <line x1="50" y1="50" x2="25" y2="90" />
                  <line x1="50" y1="50" x2="10" y2="40" />
                </svg>

                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold text-slate-500">
                  Career
                </span>
                <span className="absolute top-[35%] -right-4 text-[9px] font-bold text-slate-500">
                  Health
                </span>
                <span className="absolute -bottom-3 -right-2 text-[9px] font-bold text-slate-500">
                  Relationships
                </span>
                <span className="absolute -bottom-3 -left-4 text-[9px] font-bold text-slate-500">
                  Personal Growth
                </span>
                <span className="absolute top-[35%] -left-3 text-[9px] font-bold text-slate-500">
                  Finance
                </span>
              </div>
            </div>
          </Card>

          {/* Focus Areas (Empty State) Block */}
          <Card className="p-8 bg-white border border-slate-100 flex flex-col items-center justify-center text-center shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)] min-h-[400px]">
            <Lightbulb className="w-12 h-12 text-slate-300 stroke-[1.5] mb-6" />
            <p className="text-[13px] text-slate-500 font-medium max-w-[250px] leading-relaxed">
              Complete your weekly reflection to see your focus areas here
            </p>
          </Card>
        </div>
      </div>

      {/* Review & Growth */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-[#E63946]" strokeWidth={2} />
          <h2 className="text-[15px] font-bold text-slate-700">
            Review & Growth
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent Journal Entries */}
          <Card className="p-6 bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)] flex flex-col min-h-[220px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-[15px]">
                Recent Journal Entries
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold text-slate-600 border-slate-200"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Entry
              </Button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              {insightsData.recent_journals.length > 0 ? (
                <div className="space-y-3 w-full">
                  {insightsData.recent_journals.slice(0, 3).map((journal) => (
                    <div
                      key={journal.id}
                      className="text-sm border-l-[3px] border-blue-400 pl-3 py-1 text-left w-full"
                    >
                      <p className="font-semibold text-slate-800 truncate">
                        {journal.title || `Journal #${journal.id}`}
                      </p>
                      {(journal.journal_date || journal.created_at) && (
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {new Date(
                            (journal.journal_date ||
                              journal.created_at) as string,
                          ).toLocaleDateString("en-US", {
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
                <p className="text-[13px] text-slate-400 font-medium">
                  No entries yet. Start journaling today!
                </p>
              )}
            </div>
          </Card>

          {/* Personalized Insights */}
          <Card className="p-6 bg-[#FCFaff] border border-[#E9D5FF] shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)] flex flex-col min-h-[220px]">
            <div className="flex items-center gap-3 mb-auto">
              <div className="w-10 h-10 rounded-[10px] bg-[#A855F7] flex items-center justify-center text-white shadow-sm shadow-[#A855F7]/20">
                <Lightbulb className="w-5 h-5 fill-current" />
              </div>
              <h3 className="font-bold text-slate-800 text-[15px]">
                Personalized Insights
              </h3>
            </div>

            {insightsData.personalized_insights.length > 0 ? (
              <div className="space-y-3 mt-6">
                {insightsData.personalized_insights
                  .slice(0, 2)
                  .map((insight, idx) => (
                    <div
                      key={insight.id ?? idx}
                      className="text-[13px] text-slate-600 font-medium bg-white rounded-lg p-3 border border-[#F3E8FF] shadow-sm flex items-start gap-3"
                    >
                      <TrendingUp className="w-4 h-4 text-[#A855F7] shrink-0 mt-0.5" />
                      <span>
                        {insight.insight ||
                          insight.text ||
                          JSON.stringify(insight)}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-4 border border-[#F3E8FF] shadow-sm flex items-center gap-3 mt-6">
                <TrendingUp
                  className="w-5 h-5 text-[#A855F7] shrink-0"
                  strokeWidth={2.5}
                />
                <p className="text-[13px] text-slate-600 font-medium">
                  Start journaling to discover patterns and insights about your
                  journey!
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Bucket List & Leaderboard Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* Bucket List Dreams */}
        <Card className="p-6 bg-[#FDF2F8] border border-[#FBCFE8] shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)] flex flex-col min-h-[350px]">
          <div className="flex justify-between items-start mb-8">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F472B6] to-[#EC4899] flex items-center justify-center text-white shadow-sm shadow-pink-200">
                <ListOrdered className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-[15px]">
                  Bucket List Dreams
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {previewData.bucket_preview.length} dreams
                </p>
              </div>
            </div>
            <Link
              to="/bucket-list"
              className="font-bold text-xs text-[#EC4899] hover:underline mt-1 mr-1"
            >
              View All
            </Link>
          </div>

          <div className="flex-1 flex flex-col gap-3">
            {previewData.bucket_preview.length > 0 ? (
              previewData.bucket_preview.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-[#FCE7F3] flex justify-between items-center transition-all hover:bg-pink-50/30"
                >
                  <span className="font-extrabold text-slate-800 text-sm tracking-tight">
                    {item.title}
                  </span>
                  <div className="flex gap-2 flex-wrap justify-end">
                    {item.status && (
                      <Badge className="bg-[#EC4899] hover:bg-[#DB2777] text-white text-[10px] px-2.5 py-0.5 rounded-full capitalize font-bold shadow-sm border-0">
                        {item.status.replace(/_/g, " ")}
                      </Badge>
                    )}
                    {item.category && (
                      <Badge
                        variant="outline"
                        className="text-[#EC4899] border-[#FBCFE8] bg-pink-50 text-[10px] px-2.5 py-0.5 rounded-full capitalize font-bold"
                      >
                        {item.category}
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[13px] text-slate-400 font-medium">
                  No bucket list items yet. Let's dream!
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="p-6 bg-white border border-[#E9D5FF] shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)] flex flex-col min-h-[350px]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#9333EA] flex items-center justify-center text-white shadow-sm shadow-purple-200">
                <Trophy className="w-5 h-5 fill-current" />
              </div>
              <h3 className="font-bold text-slate-800 text-[15px]">
                Leaderboard
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-[10px] font-bold text-slate-600 border-slate-200 px-3 shadow-none bg-slate-50"
              asChild
            >
              <Link to="/leaderboard">View All</Link>
            </Button>
          </div>

          <div className="bg-[#F3E8FF] rounded-xl p-3 flex flex-col justify-center border border-[#E9D5FF] mb-5 shadow-sm mx-1">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#A855F7] flex items-center justify-center text-white font-extrabold text-[11px] shadow-sm tracking-tighter">
                #232
              </div>
              <div>
                <p className="font-bold text-sm text-[#7E22CE] leading-tight mb-0.5 tracking-tight">
                  Your Rank
                </p>
                <p className="text-[11px] text-[#9333EA] font-semibold leading-tight">
                  10 pts
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col px-1">
            {previewData.leaderboard_preview.length > 0 ? (
              previewData.leaderboard_preview.map((person, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-b-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 shadow-sm ${
                        idx === 0
                          ? "bg-[#FDE047] text-[#854D0E] border border-[#FEF08A]"
                          : idx === 1
                            ? "bg-slate-200 text-slate-600 border border-slate-300"
                            : idx === 2
                              ? "bg-[#FDBA74] text-[#9A3412] border border-[#FED7AA]"
                              : "bg-slate-100 text-slate-500 font-medium"
                      }`}
                    >
                      {idx < 3 ? ["👑", "🥈", "🥉"][idx] : idx + 1}
                    </div>
                    <span className="font-bold text-[13px] text-slate-700 truncate tracking-tight">
                      {person.name}
                    </span>
                  </div>
                  <span className="font-extrabold text-[#9333EA] text-[13px] ml-4 flex-shrink-0">
                    {person.points}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[13px] text-slate-400 font-medium pb-2">
                  No leaderboard data yet.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Beta Testing Notice */}
      <Card className="p-4 bg-red-50 border-l-4 border-l-red-500 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
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
