import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
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
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo } from "react";

const Dashboard = () => {
  const { user, token, login } = useAuth();

  const navigate = useNavigate();

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
    energy_average?: string | number | null;
    alignment_average?: string | number | null;
    total_score?: number;
    highest_badge?: string | null;
    current_streak?: number;
    longest_streak?: number;
    life_balance?: {
      career?: number;
      health?: number;
      relationships?: number;
      growth?: number;
      finance?: number;
    };
  } | null>(null);

  const [setupCount, setSetupCount] = useState<{
    completed: number;
    total: number;
  }>({
    completed: 2,
    total: 5,
  });

  // Load setup count from localStorage
  useEffect(() => {
    const completed = parseInt(
      localStorage.getItem("setupCompletedCount") || "2",
    );
    const total = parseInt(localStorage.getItem("setupTotalCount") || "5");
    setSetupCount({ completed, total });

    // Listen for changes from other tabs/windows
    const handleStorageChange = () => {
      const updatedCompleted = parseInt(
        localStorage.getItem("setupCompletedCount") || "2",
      );
      const updatedTotal = parseInt(
        localStorage.getItem("setupTotalCount") || "5",
      );
      setSetupCount({ completed: updatedCompleted, total: updatedTotal });
    };

    // Listen for visibility changes to refresh when tab becomes active
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const updatedCompleted = parseInt(
          localStorage.getItem("setupCompletedCount") || "2",
        );
        const updatedTotal = parseInt(
          localStorage.getItem("setupTotalCount") || "5",
        );
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
    vision_images: string[];
    vision_statement: string | null;
  }>({
    daily_motivator: null,
    priorities: [],
    upcoming_dates: [],
    story_of_the_day: null,
    mission: null,
    bucket_preview: [],
    leaderboard_preview: [],
    vision_images: [],
    vision_statement: null,
  });

  // Fetch Actual Recent Journals from /user_journals for the UI update
  const [recentJournals, setRecentJournals] = useState<any[]>([]);
  const [weeklyJournals, setWeeklyJournals] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllJournals = async () => {
      try {
        const authHeader = {
          Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
        };

        const [dailyRes, weeklyRes] = await Promise.all([
          fetch("https://life-api.lockated.com/user_journals", { headers: authHeader }),
          fetch("https://life-api.lockated.com/user_journals?journal_type=weekly", { headers: authHeader })
        ]);

        if (dailyRes.ok) {
          const data = await dailyRes.json();
          setRecentJournals(Array.isArray(data) ? data : data?.user_journals || []);
        }

        if (weeklyRes.ok) {
          const data = await weeklyRes.json();
          setWeeklyJournals(Array.isArray(data) ? data : data?.user_journals || []);
        }
      } catch (err) {
        console.error("Failed to fetch journals:", err);
      }
    };
    fetchAllJournals();
  }, [token]);

  // Calendar Logic
  const [calendarDate, setCalendarDate] = useState(new Date());

  const weekData = useMemo(() => {
    const start = new Date(calendarDate);
    // Move to Sunday of current week
    start.setDate(calendarDate.getDate() - calendarDate.getDay());

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const isToday = d.toDateString() === new Date().toDateString();
      const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));

      return {
        day: ["Su", "M", "Tu", "W", "Th", "F", "Sa"][i],
        date: d.getDate().toString(),
        fullDate: d,
        active: isToday,
state: isPast ? "missed" : isToday ? "filled" : "upcoming",      };
    });
  }, [calendarDate]);

  const handlePrevWeek = () => {
    const newDate = new Date(calendarDate);
    newDate.setDate(calendarDate.getDate() - 7);
    setCalendarDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(calendarDate);
    newDate.setDate(calendarDate.getDate() + 7);
    setCalendarDate(newDate);
  };

  const getWeekLabel = () => {
    const today = new Date();
    const start = new Date(calendarDate);
    start.setDate(calendarDate.getDate() - calendarDate.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const isCurrentWeek =
      today >= start && today <= new Date(end.setHours(23, 59, 59, 999));

    if (isCurrentWeek) return "This Week";

    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  };

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
          setPreviewData((prev) => ({
            ...prev,
            daily_motivator: data.daily_motivator || null,
            upcoming_dates: data.upcoming_dates || [],
            story_of_the_day: data.story_of_the_day || null,
            mission: data.mission || prev.mission,
            bucket_preview: data.bucket_preview || [],
          }));
        }
      } catch (err) {
        console.error("Failed to fetch preview:", err);
      }
    };
    fetchPreview();
  }, [token]);

  // Fetch Vision Data specifically for images and statement
  useEffect(() => {
    const fetchVision = async () => {
      try {
        const authToken = token || localStorage.getItem("auth_token") || "";
        const res = await fetch("https://life-api.lockated.com/vision.json", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          const vision = Array.isArray(data) ? data[0] : data?.vision || data;

          if (vision) {
            const images = vision.images || data.images || [];
            setPreviewData((prev) => ({
              ...prev,
              vision_images: images,
              vision_statement: vision.vision_statement || null,
              mission: vision.mission_statement || prev.mission,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch vision data:", err);
      }
    };

    fetchVision();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchVision();
      }
    };

    const handleStorageChange = () => {
      fetchVision();
    };

    const handleVisionUpdated = () => {
      fetchVision();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("vision_data_updated", handleVisionUpdated);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("vision_data_updated", handleVisionUpdated);
    };
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

  // Fetch Today's Accomplishments (mapped into Priorities UI)
  useEffect(() => {
    const fetchDailyAccomplishments = async () => {
      try {
        const d = new Date();
        const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

        // 1. Fetch all user journals to find today's entry
        const listResponse = await fetch(
          `https://life-api.lockated.com/user_journals`,
          {
            headers: {
              Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
            },
          },
        );

        if (listResponse.ok) {
          const listData = await listResponse.json();
          const journals = Array.isArray(listData)
            ? listData
            : listData?.user_journals || [];

          // Find the journal that matches today's date
          const todayJournal = journals.find(
            (j: any) => j.start_date === todayStr,
          );

          if (todayJournal && todayJournal.id) {
            // 2. Fetch the detailed journal for today using its specific ID
            const detailRes = await fetch(
              `https://life-api.lockated.com/user_journals/${todayJournal.id}`,
              {
                headers: {
                  Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
                },
              },
            );

            if (detailRes.ok) {
              const detailData = await detailRes.json();
              const detailedJournal = detailData?.user_journal || detailData;

              let extractedAccomplishments = [];
              if (
                detailedJournal &&
                Array.isArray(detailedJournal.accomplishments)
              ) {
                extractedAccomplishments = detailedJournal.accomplishments;
              }

              const formatted = extractedAccomplishments.map(
                (a: any, idx: number) => {
                  if (typeof a === "string") return { id: idx, title: a };
                  return {
                    id: a.id || idx,
                    title: a.title || a.name || "Unnamed",
                  };
                },
              );

              setPreviewData((prev) => ({
                ...prev,
                priorities: formatted,
              }));
              return;
            }
          }
        }

        // Fallback: Clear if not found
        setPreviewData((prev) => ({
          ...prev,
          priorities: [],
        }));
      } catch (error) {
        console.error("Dashboard accomplishments API error:", error);
      }
    };
    fetchDailyAccomplishments();
  }, [token]);

  // Add People Fetch Logic
  const [people, setPeople] = useState<any[]>([]);
  const [isLoadingPeople, setIsLoadingPeople] = useState(true);

  useEffect(() => {
    const fetchPeople = async () => {
      try {
        const res = await fetch("https://life-api.lockated.com/people", {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setPeople(Array.isArray(data) ? data : data.data ?? []);
        }
      } catch (err) {
        console.error("Failed to fetch people:", err);
      } finally {
        setIsLoadingPeople(false);
      }
    };

    fetchPeople();
  }, [token]);

  const peopleHandler = () => {
    navigate("/people");
  };

  // Add Habits Fetch Logic
  const [habitsData, setHabitsData] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const res = await fetch("https://life-api.lockated.com/habits", {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}` }
        });
        if (res.ok) {
          const data = await res.json();
          setHabitsData(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch habits:", err);
      }
    };
    fetchHabits();
  }, [token]);

  // Add Leaderboard Fetch Logic
  const [leaderboardData, setLeaderboardData] = useState<{ top: any[], currentUser: any }>({ top: [], currentUser: null });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("https://life-api.lockated.com/leaderboard/rankings", {
          headers: { Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}` }
        });
        if (res.ok) {
          const data = await res.json();
          let list = [];
          let cu = null;

          if (Array.isArray(data)) {
             list = data;
          } else if (data.data && Array.isArray(data.data)) {
             list = data.data;
             cu = data.current_user || null;
          } else if (data.rankings && Array.isArray(data.rankings)) {
             list = data.rankings;
             cu = data.current_user || null;
          }

          setLeaderboardData({
             top: list.slice(0, 5),
             currentUser: cu
          });
        }
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      }
    };
    fetchLeaderboard();
  }, [token]);

  // --- Calculations for Habit Tracking ---
  const activeHabitsCount = habitsData.length;
  const avgHabitCompletion = activeHabitsCount > 0
    ? Math.round(habitsData.reduce((acc, h) => acc + (h.completion_percentage || h.completion_rate || 0), 0) / activeHabitsCount)
    : 0;

  const dailyHabits = habitsData.filter(h => {
    const freq = (h.repeat_type || h.frequency || '').toLowerCase();
    return freq === 'daily' || !freq; 
  });
  
  const weeklyHabits = habitsData.filter(h => {
    const freq = (h.repeat_type || h.frequency || '').toLowerCase();
    return freq === 'weekly';
  });


  // --- Journaling Status Calculations ---
  const statusToday = new Date();

  // 1. Daily Track (Last 7 Days)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(statusToday);
    d.setDate(statusToday.getDate() - 6 + i);
    return d;
  });

  const formatShortDate = (d: Date) =>
    `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "short" })}`;
  const dailyDateRangeStr = `${formatShortDate(last7Days[0])} - ${formatShortDate(last7Days[6])}`;

  const dailyCompletion = last7Days.map((date) => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const hasEntry = recentJournals.some(
      (j) =>
        (j.journal_type === "daily" || !j.journal_type) &&
        (j.start_date === dateString ||
          (j.created_at && j.created_at.startsWith(dateString)))
    );
    return {
      dayLabel: date.toLocaleDateString("en-US", { weekday: "short" }),
      completed: hasEntry,
    };
  });

  const dailyCompletedCount = dailyCompletion.filter((d) => d.completed).length;

  // 2. Weekly Track (Current Month)
  const currentMonthStatus = statusToday.getMonth();
  const currentYearStatus = statusToday.getFullYear();
  const monthNameStatus = statusToday.toLocaleDateString("en-US", {
    month: "long",
  });

  const getWeekNumber = (d: Date) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    const week1 = new Date(date.getFullYear(), 0, 4);
    return (
      1 +
      Math.round(
        ((date.getTime() - week1.getTime()) / 86400000 -
          3 +
          ((week1.getDay() + 6) % 7)) /
          7
      )
    );
  };

  const weeklyBlocks = Array.from({ length: 5 }).map((_, i) => {
    const startD = new Date(currentYearStatus, currentMonthStatus, 1 + i * 7);
    const endD = new Date(currentYearStatus, currentMonthStatus, 7 + i * 7);

    const hasEntry = weeklyJournals.some((j) => {
      const jDate = new Date(j.start_date || j.created_at);
      return jDate >= startD && jDate <= endD;
    });

    const datesLabel = `(${startD.toLocaleDateString("en-US", { month: "short" })} ${startD.getDate()}-${endD.getDate()})`;
    const wkLabel = `WK#${getWeekNumber(startD)}`;

    return {
      label: wkLabel,
      datesLabel,
      completed: hasEntry,
    };
  });

  const weeklyCompletedCount = weeklyBlocks.filter((w) => w.completed).length;

  // 3. Overall Completion %
  const totalComplete = dailyCompletedCount + weeklyCompletedCount;
  const totalTarget = 7 + 5;
  const percentComplete = Math.round((totalComplete / totalTarget) * 100);

  // --- Consistency Calculations (Dynamic Last 30 days) ---
  const last30DaysCount = useMemo(() => {
    if (insightsData.journaling_status.monthly_entries > 0) {
      return insightsData.journaling_status.monthly_entries;
    }
    // Fallback: calculate from recentJournals
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return recentJournals.filter((j) => {
      const d = new Date(j.start_date || j.created_at);
      return d >= thirtyDaysAgo;
    }).length;
  }, [insightsData.journaling_status.monthly_entries, recentJournals]);

  const consistencyScore = Math.min(Math.round((last30DaysCount / 30) * 100), 100);
  const longestStreak = summaryData?.longest_streak ?? summaryData?.current_streak ?? 0;

  const setupCompleted = parseInt(localStorage.getItem("setupCompletedCount") || "0");
const setupTotal     = parseInt(localStorage.getItem("setupTotalCount")     || "5");

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
          <Sparkles className="w-5 h-5 text-[#E11D48]" />
          <h2 className="text-lg font-semibold text-[#1E293B]">
            Daily Focus & Inspiration
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Daily Motivator */}
          <Card className="bg-[#FFF1F2] border-[#FECDD3] rounded-2xl overflow-hidden flex flex-col shadow-sm border-2">
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-[#E11D48] p-1.5 rounded-lg text-white shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-[10px] text-[#881337] tracking-wider uppercase flex items-center gap-1.5">
                  DAILY MOTIVATOR
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </h3>
              </div>
              
              <div className="flex-1 relative pl-6 mb-4 mt-2">
                <span className="text-4xl text-[#FECDD3] absolute -top-4 left-0 font-serif opacity-80">
                  "
                </span>
                <p className="text-sm font-bold text-[#881337] leading-relaxed z-10 relative">
                  {previewData.daily_motivator
                    ? previewData.daily_motivator
                    : "The end of education is character."}
                </p>
                <p className="text-[10px] text-[#E11D48] font-bold mt-2">— Sathya Sai Baba</p>
              </div>

              <div className="bg-[#FFE4E6] rounded-xl p-3 border border-[#FECDD3]">
                <div className="flex items-center gap-1.5 mb-1">
                  <Target className="w-3 h-3 text-[#E11D48]" />
                  <h4 className="font-black text-[9px] uppercase text-[#881337] tracking-widest">
                    ACTION
                  </h4>
                </div>
                <p className="text-[11px] text-[#9F1239] font-medium leading-snug">
                  True education is about building strong values and character, not just academics.
                </p>
              </div>
            </div>
          </Card>

          {/* Priorities (now mapped to accomplishments) */}
          <Card className="bg-[#F4F8FF] border-[#D1DBFF] p-5 flex flex-col shadow-sm rounded-2xl min-h-[180px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[17px] text-[#0F172A] flex items-center gap-2.5 tracking-tight">
                <ListTodo
                  className="w-5 h-5 text-[#4F46E5]"
                  strokeWidth={2.5}
                />{" "}
                Priorities
              </h3>
              <Badge
                variant="secondary"
                className="bg-[#E0E7FF] text-[#4338CA] hover:bg-[#E0E7FF] shadow-none font-semibold text-[12px] px-3 py-1 rounded-full pointer-events-none border-0"
              >
                For: {new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Badge>
            </div>

            {previewData.priorities.length > 0 ? (
              <div className="flex-1 flex flex-col gap-3 mt-2">
                {previewData.priorities.map(
                  (
                    todo: {
                      id?: string | number;
                      title?: string;
                    },
                    idx,
                  ) => (
                    <div
                      key={todo.id || idx}
                      className="flex items-start gap-3"
                    >
                      <div className="mt-0.5 flex-shrink-0 text-[#4F46E5]">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                      </div>
                      <p className="text-[15px] font-medium text-[#475569] leading-snug">
                        {todo.title}
                      </p>
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center mt-2">
                <p className="text-sm text-slate-500 mb-1.5 font-medium">
                  No accomplishments recorded yet today.
                </p>
                <Link
                  to="/daily-journal"
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 mt-1"
                >
                  Go to Daily Journal <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </Card>

          {/* People / Upcoming Dates Conditional Block */}
          {isLoadingPeople ? (
            <Card className="bg-pink-50/30 border-pink-200 p-4 flex flex-col items-center justify-center min-h-[180px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)] animate-pulse">
              <CalendarIcon
                className="w-10 h-10 text-pink-200 mb-3"
                strokeWidth={1.5}
              />
            </Card>
          ) : people.length === 0 ? (
            <Card className="bg-pink-50/30 border-pink-200 p-4 flex flex-col items-center justify-center min-h-[180px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)]">
              <CalendarIcon
                className="w-10 h-10 text-pink-300 mb-3"
                strokeWidth={1.5}
              />
              <p className="text-sm text-slate-500 text-center">
                No people added yet
              </p>
            </Card>
          ) : (
            <Card className="bg-[#FFF0F5]/50 border-[#F48FB1] p-5 flex flex-col min-h-[180px] shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)] rounded-[16px]">
              <div className="flex items-center justify-between mb-auto">
                <div className="flex items-center gap-2.5">
                  <div className="w-[30px] h-[30px] rounded-[8px] bg-[#F06292] flex items-center justify-center shadow-sm">
                    <CalendarIcon
                      className="w-[18px] h-[18px] text-white"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="font-bold text-[#0F172A] text-[15px]">
                    Upcoming Dates
                  </span>
                </div>
                <button
                  onClick={peopleHandler}
                  className="text-[13px] font-medium text-[#1E293B] hover:text-[#0F172A] transition-colors"
                >
                  View All
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center text-center mt-4">
                <p className="text-[14px] text-[#64748B]">
                  No upcoming dates in the next 30 days
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

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
              <ChevronLeft
                className="w-4 h-4 text-[#FF6B2C] cursor-pointer hover:scale-110 transition-transform"
                onClick={handlePrevWeek}
              />
              <h4 className="font-bold text-sm text-slate-700">
                {getWeekLabel()}
              </h4>
              <ChevronRight
                className="w-4 h-4 text-[#FF6B2C] cursor-pointer hover:scale-110 transition-transform"
                onClick={handleNextWeek}
              />
            </div>

            <div className="flex justify-between gap-1 mb-4">
              {weekData.map((d) => (
                <div
                  key={d.day + d.date}
                  className={`flex flex-col items-center justify-center py-2 px-1 w-9 rounded-xl transition-all ${d.active ? "border-[1.5px] border-[#FF6B2C] shadow-sm bg-white" : ""}`}
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

        {/* EXACT Journaling Status UI Match */}
        <Card className="p-5 bg-[#F2FBF9] border-[1.5px] border-[#5EEAD4] shadow-sm flex flex-col justify-between rounded-[20px] transition-all hover:shadow-md">
          <div className="flex justify-between items-center mb-5">
            <h3 className="font-bold text-[#0F766E] flex items-center gap-2.5 text-[17px]">
              <BookOpen className="w-5 h-5 text-[#0F766E]" strokeWidth={2.5} />{" "}
              Journaling Status
            </h3>
          </div>

          {/* Daily Track */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[14px] font-bold text-[#0F766E]">
                Daily ({dailyDateRangeStr})
              </span>
              <span className="text-[14px] font-bold text-slate-800">
                {dailyCompletedCount}/7
              </span>
            </div>
            <div className="flex justify-between gap-1 sm:gap-1.5 w-full">
              {dailyCompletion.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                  <div
                    className={`w-full aspect-square max-w-[42px] rounded-[8px] sm:rounded-[10px] flex items-center justify-center transition-all ${
                      day.completed
                        ? "bg-[#14B8A6] shadow-sm"
                        : "bg-white border-[1.5px] border-[#99F6E4]"
                    }`}
                  >
                    {day.completed ? (
                      <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
                        <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <div className="w-[50%] h-[50%] rounded-full border-[1.5px] border-[#99F6E4]"></div>
                    )}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-semibold text-[#0F766E] truncate w-full text-center">
                    {day.dayLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Track */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[14px] font-bold text-[#0F766E]">
                Weekly ({monthNameStatus} {currentYearStatus})
              </span>
              <span className="text-[14px] font-bold text-slate-800">
                {weeklyCompletedCount}/5
              </span>
            </div>
            <div className="flex justify-between gap-1 sm:gap-1.5 w-full">
              {weeklyBlocks.map((wk, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 flex-1 min-w-0">
                  <div
                    className={`w-full aspect-square max-w-[48px] rounded-[8px] sm:rounded-[10px] flex items-center justify-center transition-all ${
                      wk.completed
                        ? "bg-[#14B8A6] shadow-sm"
                        : "bg-white border-[1.5px] border-[#99F6E4]"
                    }`}
                  >
                    {wk.completed ? (
                      <svg width="50%" height="50%" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
                        <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <Calendar className="w-[45%] h-[45%] text-[#99F6E4]" strokeWidth={2} />
                    )}
                  </div>
                  <div className="text-center mt-1 w-full">
                    <div className="text-[9px] sm:text-[10px] font-bold text-[#0F766E] leading-tight mb-0.5 truncate">
                      {wk.label}
                    </div>
                    <div className="text-[8px] sm:text-[9px] font-medium text-[#0F766E] opacity-90 leading-tight truncate">
                      {wk.datesLabel}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#A7F3D0]/60">
            <span className="text-[14px] font-bold text-[#0F766E]">
              Keep up the momentum!
            </span>
            <span className="text-[15px] font-extrabold text-slate-800">
              {percentComplete}% Complete
            </span>
          </div>
        </Card>
      </div>

      {/* Purpose & Direction Section */}
      <div className="mt-8 mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-[18px] h-[18px] text-[#E63946]" strokeWidth={2} />
          <h2 className="text-[15px] font-bold text-slate-700">
            Purpose & Direction
          </h2>
        </div>

        <Card className="bg-[#FFF8F8] border border-[#E63946] rounded-[16px] shadow-sm transition-all hover:shadow-md p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-[18px] h-[18px] text-slate-900" strokeWidth={2.5} />
              <h3 className="font-bold text-[15px] text-slate-900 tracking-tight">
                My Mission
              </h3>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp className="w-[14px] h-[14px] text-slate-900" strokeWidth={2.5} />
              <span className="text-[12px] font-extrabold text-slate-900">
                {summaryData?.alignment_average !== null && summaryData?.alignment_average !== undefined 
                  ? Number(summaryData.alignment_average).toFixed(1) 
                  : "5.0"}/10
              </span>
              <div className="w-5 sm:w-8 h-[2px] bg-slate-900 rounded-full ml-1"></div>
            </div>
          </div>

          {/* Extra Content (Mission Statement & Vision Board) */}
          {(previewData.mission || (previewData.vision_images && previewData.vision_images.length > 0)) && (
            <div className="mt-5 pt-5 border-t border-red-100 flex flex-col gap-4">
              {previewData.mission && (
                <p className="text-lg md:text-xl font-black text-slate-900 tracking-tight uppercase leading-tight">
                  {previewData.mission}
                </p>
              )}

              {previewData.vision_images && previewData.vision_images.length > 0 && (
                <div className="relative rounded-[12px] overflow-hidden aspect-[16/9] bg-slate-50 border border-slate-100 group">
                  <img
                    src={previewData.vision_images[0]}
                    alt="My Vision"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      console.error("Dashboard - Failed to load main vision image");
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Execution & Tracking */}
      <div>
        <div className="flex items-center gap-2 mb-3 mt-8">
          <Zap className="w-4 h-4 text-[#E63946]" strokeWidth={2.5} />
          <h2 className="text-sm font-bold text-slate-800">
            Execution & Tracking
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* UPDATED Journaling Consistency Block */}
          <Card className="p-5 bg-[#FFF9F5] border border-[#FDBA74] shadow-sm rounded-[20px] flex flex-col transition-all hover:shadow-md">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-[8px] bg-[#F59E0B] flex items-center justify-center text-white shadow-sm">
                <Flame className="w-4 h-4 fill-current" />
              </div>
              <h3 className="font-bold text-slate-800 text-[16px]">
                Journaling Consistency
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-1 text-slate-800">
                  <Flame className="w-5 h-5 text-[#F97316]" strokeWidth={2.5} />
                  <span className="text-[22px] font-extrabold leading-none">
                    {summaryData?.current_streak || 0}
                  </span>
                </div>
                <span className="text-[12px] text-slate-500 font-medium mt-1">
                  Current Streak
                </span>
              </div>

              <div className="bg-white rounded-xl p-4 flex flex-col items-center justify-center shadow-sm border border-slate-100">
                <div className="flex items-center gap-2 mb-1 text-slate-800">
                  <Calendar className="w-5 h-5 text-[#3B82F6]" strokeWidth={2.5} />
                  <span className="text-[22px] font-extrabold leading-none">
                    {last30DaysCount}
                  </span>
                </div>
                <span className="text-[12px] text-slate-500 font-medium mt-1">
                  Last 30 Days
                </span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-4">
              <div className="flex justify-between items-center mb-3">
                <span className="text-[13px] font-bold text-slate-700">
                  Consistency Score
                </span>
                <span className="font-extrabold text-slate-900 text-[14px]">
                  {consistencyScore}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 mb-3">
                <div
                  className="bg-[#F59E0B] h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${consistencyScore}%`,
                  }}
                ></div>
              </div>
              <div className="flex justify-center items-center gap-1.5 text-[11px] font-semibold text-[#D97706]">
                <span>🏆</span> Longest streak: {longestStreak} days
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
              <h4 className="text-[13px] font-bold text-slate-700 mb-6 text-center">
                Life Balance (Last 7 Days)
              </h4>
              <div className="relative w-full aspect-square max-w-[200px] mx-auto">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full stroke-slate-200 fill-none"
                  strokeWidth="0.5"
                >
                  {/* Grid lines */}
                  <polygon
                    points="50,10 90,40 75,90 25,90 10,40"
                    strokeDasharray="2,2"
                  />
                  <polygon
                    points="50,30 70,45 62,70 38,70 30,45"
                    strokeDasharray="1,1"
                  />
                  <line x1="50" y1="50" x2="50" y2="10" />
                  <line x1="50" y1="50" x2="90" y2="40" />
                  <line x1="50" y1="50" x2="75" y2="90" />
                  <line x1="50" y1="50" x2="25" y2="90" />
                  <line x1="50" y1="50" x2="10" y2="40" />

                  {/* Dynamic Data Polygon */}
                  {summaryData?.life_balance && (
                    <polygon
                      points={`
                        50,${50 - (summaryData.life_balance.career || 0) * 4} 
                        ${50 + (summaryData.life_balance.health || 0) * 4},${50 - (summaryData.life_balance.health || 0) * 1}
                        ${50 + (summaryData.life_balance.relationships || 0) * 2.5},${50 + (summaryData.life_balance.relationships || 0) * 4}
                        ${50 - (summaryData.life_balance.growth || 0) * 2.5},${50 + (summaryData.life_balance.growth || 0) * 4}
                        ${50 - (summaryData.life_balance.finance || 0) * 4},${50 - (summaryData.life_balance.finance || 0) * 1}
                      `}
                      fill="rgba(45, 212, 191, 0.6)"
                      stroke="#14B8A6"
                      strokeWidth="1.5"
                      className="transition-all duration-1000"
                    />
                  )}
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

          {/* REBUILT: This Week's Strategic Focus (formerly Focus Areas) */}
          <Card className="p-6 bg-red-50/50 border border-red-200 shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)] rounded-[20px] flex flex-col min-h-[400px]">
             <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-[42px] h-[42px] rounded-[12px] bg-red-500 flex items-center justify-center text-white shadow-sm">
                  <Target className="w-[22px] h-[22px]" strokeWidth={2} />
                </div>
                <h3 className="font-bold text-slate-800 text-[17px] tracking-tight">
                  This Week's Strategic Focus
                </h3>
              </div>
              
            </div>

            {/* Note: I'm keeping the logic here empty state until the specific API implementation is complete as discussed previously, it acts as a placeholder based on your empty layout request. Let me know if you need to fetch list. */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Target className="w-[100px] h-[100px] text-red-200 stroke-[0.8] mb-6" />
                <p className="text-[14px] text-slate-500 font-medium max-w-[280px] leading-relaxed">
                    Complete your weekly reflection to see your focus areas here
                </p>
            </div>
          </Card>
        </div>
      </div>

      {/* NEW: Habit Tracking Section */}
      <div className="mt-8 mb-8">
        <Card className="bg-[#F0FDF8] border-[1.5px] border-[#5EEAD4] shadow-sm rounded-[20px] overflow-hidden transition-all hover:shadow-md">
          {/* Header */}
          <div className="p-4 md:p-5 flex items-center justify-between border-b border-[#CCFBF1] bg-white/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[8px] bg-[#14B8A6] flex items-center justify-center text-white shadow-sm">
                <Zap className="w-4 h-4 fill-current" />
              </div>
              <h3 className="font-bold text-slate-800 text-[16px]">Habit Tracking</h3>
            </div>
            <Button variant="outline" size="sm" className="h-7 text-[11px] font-bold text-slate-700 bg-white border-slate-200 rounded-full px-4" asChild>
              <Link to="/goals-habits">View All</Link>
            </Button>
          </div>

          {/* Content */}
          <div className="p-5 bg-white">
            {/* Top Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6 border-b border-slate-100 pb-6">
              <div>
                <p className="text-[11px] font-bold text-slate-500 mb-1 tracking-wide">Active Habits</p>
                <p className="text-[26px] font-extrabold text-[#0F766E] leading-none">{activeHabitsCount}</p>
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-500 mb-1 tracking-wide">Avg. Completion</p>
                <p className="text-[26px] font-extrabold text-[#14B8A6] leading-none">{avgHabitCompletion}%</p>
              </div>
            </div>

            {/* Habit Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Daily Habits */}
              <div>
                <h4 className="text-[13px] font-bold text-slate-800 mb-4">Daily Habits</h4>
                {dailyHabits.length > 0 ? (
                  <div className="space-y-5">
                    {dailyHabits.map((habit, idx) => (
                      <div key={idx} className="flex flex-col gap-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[13px] font-extrabold text-slate-800">{habit.name || habit.title}</span>
                          <Badge variant="outline" className="text-[10px] px-2.5 py-0 h-[18px] border-slate-200 text-slate-600 bg-white rounded-full">
                            {habit.category || habit.habit_category || 'Other'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-[#0F172A] h-full rounded-full transition-all duration-500" style={{ width: `${habit.completion_percentage || habit.completion_rate || 0}%` }}></div>
                          </div>
                          <span className="text-[11px] font-bold text-[#14B8A6] min-w-[28px] text-right">
                            {habit.completion_percentage || habit.completion_rate || 0}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-slate-400 italic">No daily habits</p>
                )}
              </div>

              {/* Weekly Habits */}
              <div>
                <h4 className="text-[13px] font-bold text-slate-800 mb-4">Weekly Habits</h4>
                {weeklyHabits.length > 0 ? (
                  <div className="space-y-5">
                    {weeklyHabits.map((habit, idx) => (
                      <div key={idx} className="flex flex-col gap-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[13px] font-extrabold text-slate-800">{habit.name || habit.title}</span>
                          <Badge variant="outline" className="text-[10px] px-2.5 py-0 h-[18px] border-slate-200 text-slate-600 bg-white rounded-full">
                            {habit.category || habit.habit_category || 'Other'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-[#0F172A] h-full rounded-full transition-all duration-500" style={{ width: `${habit.completion_percentage || habit.completion_rate || 0}%` }}></div>
                          </div>
                          <span className="text-[11px] font-bold text-[#14B8A6] min-w-[28px] text-right">
                            {habit.completion_percentage || habit.completion_rate || 0}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[12px] text-slate-400 italic">No weekly habits</p>
                )}
              </div>
            </div>
          </div>
        </Card>
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
          {/* UPDATED: Recent Journal Entries */}
          <Card className="p-6 bg-[#FFF6EE] border-2 border-[#F97316] shadow-sm flex flex-col min-h-[220px] rounded-[20px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-900 text-[16px]">
                Recent Journal Entries
              </h3>
              <Link to="/daily-journal">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-semibold text-slate-700 border-slate-200 bg-white hover:bg-slate-50 rounded-full px-4"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Entry
                </Button>
              </Link>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              {recentJournals.length > 0 ? (
                recentJournals.slice(0, 3).map((journal) => {
                  const d = new Date(journal.start_date || journal.created_at);
                  const month = d
                    .toLocaleDateString("en-US", { month: "short" })
                    .toUpperCase();
                  const date = d.getDate();
                  const weekday = d.toLocaleDateString("en-US", {
                    weekday: "long",
                  });
                  const year = d.getFullYear();
                  const energy = journal.energy_score ?? 5;
                  const alignment = journal.alignment_score ?? 5;
                  const note =
                    journal.data?.description ||
                    journal.description ||
                    journal.gratitude_note ||
                    journal.affirmation;

                  return (
                    <div
                      key={journal.id}
                      className="bg-white rounded-[16px] p-4 shadow-sm border border-slate-100 flex flex-col gap-3"
                    >
                      <div className="flex items-start gap-4">
                        {/* Date Badge */}
                        <div className="bg-[#FFEDD5] rounded-xl py-2 px-3 flex flex-col items-center justify-center min-w-[54px]">
                          <span className="text-[#EA580C] text-[10px] font-bold">
                            {month}
                          </span>
                          <span className="text-[#9A3412] text-lg font-extrabold leading-none mt-0.5">
                            {date}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 pt-0.5">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-slate-900 text-[15px]">
                              {weekday}, {year}
                            </h4>
                            <div className="w-4 h-4 rounded-md border border-purple-200 bg-purple-50"></div>
                          </div>
                          <div className="flex gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-orange-50 text-[#EA580C] hover:bg-orange-50 border-0 px-2 py-0.5 text-[11px] gap-1 font-bold"
                            >
                              <Zap className="w-3 h-3 fill-current" /> {energy}/10
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="bg-teal-50 text-teal-600 hover:bg-teal-50 border-0 px-2 py-0.5 text-[11px] gap-1 font-bold"
                            >
                              <Target className="w-3 h-3" /> {alignment}/10
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="h-px bg-slate-100 w-full my-1"></div>

                      <div className="flex items-center gap-2.5">
                        {note ? (
                          <>
                            <div className="w-5 h-5 rounded-full bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-green-500"
                              >
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </div>
                            <span className="text-[13px] text-slate-600 font-medium truncate">
                              {note}
                            </span>
                          </>
                        ) : (
                          <span className="text-[13px] text-slate-400 italic">
                            No detailed notes recorded.
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[13px] text-slate-400 font-medium text-center py-6 bg-white rounded-xl border border-slate-100">
                  No entries yet. Start journaling today!
                </p>
              )}
            </div>
          </Card>

          {/* REBUILT Personalized Insights */}
          <Card className="p-6 bg-[#FCFaff] border border-[#E9D5FF] shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)] flex flex-col min-h-[220px] rounded-[20px]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-[42px] h-[42px] rounded-[12px] bg-[#A855F7] flex items-center justify-center text-white shadow-sm">
                <Lightbulb className="w-[20px] h-[20px] fill-current" />
              </div>
              <h3 className="font-bold text-slate-800 text-[17px]">
                Personalized Insights
              </h3>
            </div>

            {insightsData.personalized_insights.length > 0 ? (
              <div className="flex-1 flex flex-col gap-3">
                {insightsData.personalized_insights
                  .slice(0, 3)
                  .map((insight, idx) => {
                    const insightText = insight.insight || insight.text || JSON.stringify(insight);
                    // Determine if it's an alert based on content, else standard chart icon
                    const isAlert = insightText.toLowerCase().includes("hasn't gotten much attention") || insightText.toLowerCase().includes("consider dedicating");
                    
                    return (
                    <div
                      key={insight.id ?? idx}
                      className="text-[13px] text-slate-600 font-medium bg-white rounded-[12px] px-4 py-3.5 border border-[#F3E8FF] shadow-sm flex items-start gap-3"
                    >
                      {isAlert ? (
                        <AlertCircle className="w-4 h-4 text-[#A855F7] shrink-0 mt-[2px]" strokeWidth={2.5} />
                      ) : (
                        <TrendingUp className="w-4 h-4 text-[#A855F7] shrink-0 mt-[2px]" strokeWidth={2.5} />
                      )}
                      <span className="leading-snug">
                        {insightText}
                      </span>
                    </div>
                  )})}
              </div>
            ) : (
              <div className="bg-white rounded-[12px] p-4 border border-[#F3E8FF] shadow-sm flex items-center gap-3 mt-auto">
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
        <Card className="p-6 bg-[#FDF2F8] border border-[#FBCFE8] shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)] flex flex-col min-h-[350px] rounded-[20px]">
          <div className="flex justify-between items-start mb-8">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F472B6] to-[#EC4899] flex items-center justify-center text-white shadow-sm shadow-pink-200">
                <ListOrdered className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-[15px]">
                  Bucket List Progress
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
                  className="bg-white rounded-[16px] p-4 shadow-sm border border-[#FCE7F3] flex justify-between items-center transition-all hover:bg-pink-50/30"
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
        <Card className="p-6 bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-[20px] transition-all hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)] flex flex-col min-h-[350px]">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-[42px] h-[42px] rounded-[12px] bg-[#A855F7] flex items-center justify-center text-white shadow-sm">
                <Trophy className="w-[20px] h-[20px] fill-current" />
              </div>
              <h3 className="font-bold text-slate-800 text-[17px]">
                Leaderboard
              </h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-[30px] text-[11px] font-bold text-slate-700 border-slate-200 px-4 rounded-full shadow-none bg-white hover:bg-slate-50"
              asChild
            >
              <Link to="/leaderboard">View All</Link>
            </Button>
          </div>

          <div className="bg-[#F3E8FF] rounded-[16px] p-4 flex flex-col justify-center border border-[#E9D5FF] mb-6">
            <div className="flex items-center gap-4">
              <div className="w-[42px] h-[42px] rounded-full bg-[#A855F7] flex items-center justify-center text-white font-extrabold text-[13px] shadow-sm tracking-tight">
                #{leaderboardData.currentUser?.rank || "232"}
              </div>
              <div>
                <p className="font-bold text-[15px] text-[#7E22CE] leading-tight mb-0.5 tracking-tight">
                  Your Rank
                </p>
                <p className="text-[13px] text-[#9333EA] font-semibold leading-tight">
                  {leaderboardData.currentUser?.points ?? summaryData?.total_score ?? 10} pts
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col px-2 gap-1">
            {leaderboardData.top.length > 0 ? (
              leaderboardData.top.map((person, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-3 border-b border-slate-100 last:border-b-0"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={`w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 shadow-sm ${
                        idx === 0
                          ? "bg-[#FEF9C3] border border-[#FDE047] text-[#A16207]"
                          : idx === 1
                            ? "bg-slate-200 text-slate-600 border border-slate-300"
                            : idx === 2
                              ? "bg-[#FFEDD5] border border-[#FED7AA] text-[#9A3412]"
                              : "bg-slate-50 border border-slate-100 text-slate-500"
                      }`}
                    >
                      {idx === 0 ? "👑" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}
                    </div>
                    <span className="font-bold text-[14px] text-slate-700 truncate tracking-tight">
                      {person.name || person.user_name || "Unknown"}
                    </span>
                  </div>
                  <span className="font-extrabold text-[#9333EA] text-[14px] ml-4 flex-shrink-0">
                    {person.points ?? person.score ?? 0}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-[13px] text-slate-400 font-medium pb-2">
                  Loading leaderboard data...
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Beta Testing Notice */}
      <Card className="p-4 bg-red-50 border-l-4 border-l-red-500 shadow-[0_4px_20px_rgba(0,0,0,0.06)] rounded-[16px]">
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