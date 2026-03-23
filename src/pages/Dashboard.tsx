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
          fetch("https://life-api.lockated.com/user_journals", {
            headers: authHeader,
          }),
          fetch(
            "https://life-api.lockated.com/user_journals?journal_type=weekly",
            { headers: authHeader },
          ),
        ]);

        if (dailyRes.ok) {
          const data = await dailyRes.json();
          setRecentJournals(
            Array.isArray(data) ? data : data?.user_journals || [],
          );
        }

        if (weeklyRes.ok) {
          const data = await weeklyRes.json();
          setWeeklyJournals(
            Array.isArray(data) ? data : data?.user_journals || [],
          );
        }
      } catch (err) {
        console.error("Failed to fetch journals:", err);
      }
    };
    fetchAllJournals();
  }, [token]);

  // Calendar Logic
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Replace the existing weekData useMemo with this:
  const weekData = useMemo(() => {
    const start = new Date(calendarDate);
    start.setDate(calendarDate.getDate() - calendarDate.getDay());

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      d.setHours(0, 0, 0, 0);

      const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const isToday = d.toDateString() === today.toDateString();
      const isFuture = d > today;

      // Check if journal exists for this date from real API data
      const hasJournal = recentJournals.some((j) => {
        const journalDate =
          j.start_date || (j.created_at ? j.created_at.split("T")[0] : "");
        return journalDate === dateString;
      });

      const state = isFuture ? "upcoming" : hasJournal ? "filled" : "missed";

      return {
        day: ["Su", "M", "Tu", "W", "Th", "F", "Sa"][i],
        date: d.getDate().toString(),
        fullDate: d,
        active: isToday,
        state,
      };
    });
  }, [calendarDate, recentJournals]); // <-- add recentJournals as dependency

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
            // FIX: Extract URL from the images array of objects
            let imageUrls: string[] = [];
            if (Array.isArray(vision.images)) {
              imageUrls = vision.images
                .map((img: any) => (typeof img === "object" ? img.url : img))
                .filter(Boolean);
            } else if (vision.image) {
              imageUrls =
                typeof vision.image === "object"
                  ? [vision.image.url]
                  : [vision.image];
            }

            // Grab the mission statement
            const missionText =
              vision.mission_statement ||
              vision.life_mission ||
              vision.mission ||
              null;

            setPreviewData((prev) => ({
              ...prev,
              vision_images: imageUrls,
              mission: missionText,
            }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch vision data:", err);
      }
    };

    fetchVision();

    const handleVisibilityChange = () => {
      if (!document.hidden) fetchVision();
    };
    const handleStorageChange = () => fetchVision();
    const handleVisionUpdated = () => fetchVision();

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
          setPeople(Array.isArray(data) ? data : (data.data ?? []));
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
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
          },
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
  const [leaderboardData, setLeaderboardData] = useState<{
    top: any[];
    currentUser: any;
  }>({ top: [], currentUser: null });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(
          "https://life-api.lockated.com/leaderboard/rankings",
          {
            headers: {
              Authorization: `Bearer ${token || localStorage.getItem("auth_token") || ""}`,
            },
          },
        );
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
            currentUser: cu,
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
  const avgHabitCompletion =
    activeHabitsCount > 0
      ? Math.round(
          habitsData.reduce(
            (acc, h) =>
              acc + (h.completion_percentage || h.completion_rate || 0),
            0,
          ) / activeHabitsCount,
        )
      : 0;

  const dailyHabits = habitsData.filter((h) => {
    const freq = (h.repeat_type || h.frequency || "").toLowerCase();
    return freq === "daily" || !freq;
  });

  const weeklyHabits = habitsData.filter((h) => {
    const freq = (h.repeat_type || h.frequency || "").toLowerCase();
    return freq === "weekly";
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
          (j.created_at && j.created_at.startsWith(dateString))),
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
          7,
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

  const consistencyScore = Math.min(
    Math.round((last30DaysCount / 30) * 100),
    100,
  );
  const longestStreak =
    summaryData?.longest_streak ?? summaryData?.current_streak ?? 0;

  const setupCompleted = parseInt(
    localStorage.getItem("setupCompletedCount") || "0",
  );
  const setupTotal = parseInt(localStorage.getItem("setupTotalCount") || "5");

  return (
    <div className="animate-fade-in w-full min-h-screen bg-white -m-6 p-8">
      {/* Header Section */}
      <div className="flex flex-row items-center justify-between gap-6 mb-8 overflow-x-hidden">
        <div className="flex-shrink-0">
          <h1 className="text-[28px] font-bold text-[#111111] leading-tight tracking-tight">
            Welcome Back, {user?.name || "User"}
          </h1>
          <p className="text-[#6B7280] text-[13px] mt-1">
            Let's align your day with your purpose
          </p>
        </div>

        <div className="flex flex-row items-center gap-2 flex-nowrap overflow-x-auto no-scrollbar pb-1">
          <Button
            onClick={() => navigate("/setup")}
            variant="outline"
            className="h-10 bg-[#F3F4F6] hover:bg-[#B91C1C] text-[#555555] hover:text-white border-[#E5E7EB] hover:border-[#B91C1C] rounded-lg px-4 gap-2 font-bold shadow-none transition-all duration-200"
          >
            <Sparkles className="w-4 h-4" />
            <span>Setup</span>
            <span className="bg-[#555555] group-hover:bg-white text-white text-[10px] w-5 h-4 rounded-md flex items-center justify-center ml-0.5">
              {setupCount.total - setupCount.completed}
            </span>
          </Button>

          <Button
            onClick={() => navigate("/daily-journal")}
            variant="outline"
            className="h-10 bg-[#F3F4F6] hover:bg-[#B91C1C] text-[#555555] hover:text-white border-[#E5E7EB] hover:border-[#B91C1C] rounded-lg px-4 gap-2 font-bold shadow-none transition-all duration-200"
          >
            <BookOpen className="w-4 h-4" />
            <span>Daily</span>
          </Button>

          <Button
            onClick={() => navigate("/weekly-journal")}
            variant="outline"
            className="h-10 bg-[#F3F4F6] hover:bg-[#B91C1C] text-[#555555] hover:text-white border-[#E5E7EB] hover:border-[#B91C1C] rounded-lg px-4 gap-2 font-bold shadow-none transition-all duration-200"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Weekly</span>
          </Button>

          <Button
            onClick={() => navigate("/calendar")}
            variant="outline"
            className="h-10 bg-[#F3F4F6] hover:bg-[#B91C1C] text-[#555555] hover:text-white border-[#E5E7EB] hover:border-[#B91C1C] rounded-lg px-4 gap-2 font-bold shadow-none transition-all duration-200"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Cal</span>
          </Button>

          <Button
            onClick={() => navigate("/leaderboard")}
            variant="outline"
            className="h-10 bg-[#F3F4F6] hover:bg-[#B91C1C] text-[#555555] hover:text-white border-[#E5E7EB] hover:border-[#B91C1C] rounded-lg px-4 gap-2 font-bold shadow-none transition-all duration-200"
          >
            <Trophy className="w-4 h-4" />
            <span>Score: {summaryData?.total_score || 0}</span>
          </Button>
        </div>
      </div>

      {/* Top Row: Daily Motivator, Priorities, Journaling Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Daily Motivator */}
        <Card className="bg-[#FAF9F6] border-[#E8E4D9] p-6 rounded-xl flex flex-col min-h-[220px] shadow-none">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-[#BBA48B]" />
            <h3 className="font-bold text-[#333333] text-[17px]">
              Daily Motivator
            </h3>
          </div>
          <div className="flex-1 flex flex-col justify-center px-4">
            <p className="text-[17px] italic text-[#444444] font-medium leading-relaxed mb-3">
              "
              {previewData.daily_motivator ||
                "The only way to do great work is to love what you do."}
              "
            </p>
            <p className="text-sm text-[#777777] font-medium">
              — {previewData.daily_motivator ? "Source" : "Steve Jobs"}
            </p>
          </div>
          <p className="text-[13px] text-[#888888] mt-6 leading-relaxed">
            Take a moment to reflect on what this means for your journey today.
          </p>
        </Card>

        {/* Priorities */}
        <Card className="bg-[#FAF9F6] border-[#E8E4D9] p-6 rounded-xl flex flex-col min-h-[220px] shadow-none relative overflow-hidden">
          <div className="w-full flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-[#BBA48B]" />
              <h3 className="font-bold text-[#333333] text-[18px]">
                Priorities
              </h3>
            </div>
            <div className="bg-[#e8e4d9] text-[#BBA48B] px-3 py-1 rounded-full text-[12px] font-bold border border-[#E8E4D9]/50">
              For:{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center -mt-4">
            <p className="text-[#6B7280] font-medium text-[15px] mb-2">
              No priorities or todos.
            </p>
            <Link
              to="/daily-journal"
              className="text-[#BBA48B] font-bold text-[14px] flex items-center gap-1 hover:underline transition-all"
            >
              Set in Daily Journal →
            </Link>
          </div>
        </Card>

        {/* Journaling Status */}
        <Card className="bg-[#FAF9F6] border-[#E8E4D9] p-6 rounded-xl flex flex-col min-h-[220px] shadow-none">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#BBA48B]" />
              <h3 className="font-bold text-[#333333] text-[17px]">
                Journaling Status
              </h3>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[13px] font-bold text-[#444444]">
                Daily ({dailyDateRangeStr})
              </span>
              <span className="text-[13px] font-bold text-[#777777]">
                {dailyCompletedCount}/7
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {dailyCompletion.map((day, idx) => (
                <div
                  key={idx}
                  className={`aspect-square rounded-full flex items-center justify-center ${day.completed ? "bg-[#D2B48C]" : "bg-[#EFEDE7]"}`}
                >
                  {day.completed && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[13px] font-bold text-[#444444]">
                Weekly ({monthNameStatus} {currentYearStatus})
              </span>
              <span className="text-[13px] font-bold text-[#777777]">
                {weeklyCompletedCount}/4
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {weeklyBlocks.slice(0, 4).map((wk, idx) => (
                <div
                  key={idx}
                  className={`aspect-square rounded-md p-1.5 flex flex-col items-center justify-center text-center ${wk.completed ? "bg-[#D2B48C] text-white" : "bg-[#EFEDE7] text-[#AAAAAA]"}`}
                >
                  <BookOpen
                    className={`w-3.5 h-3.5 mb-1 ${wk.completed ? "text-white" : "text-[#CCCCCC]"}`}
                  />
                  <span className="text-[9px] font-bold">{wk.label}</span>
                  <span className="text-[7px] opacity-70">
                    (
                    {wk.label === "WK#06"
                      ? "Feb 1-7"
                      : wk.label === "WK#07"
                        ? "Feb 8-14"
                        : wk.label === "WK#08"
                          ? "Feb 15-21"
                          : "Feb 22-28"}
                    )
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 flex justify-between items-center border-t border-[#E8E4D9]/50">
            <span className="font-bold text-[#333333] uppercase tracking-wider text-[10px]">
              Keep Up The Momentum!
            </span>
            <span className="text-[11px] font-bold text-[#333333]">
              {percentComplete}% Complete
            </span>
          </div>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card className="bg-[#FAF9F6] border-[#E8E4D9] p-8 rounded-xl flex flex-col min-h-[380px] shadow-none">
          {/* Header Stats Block */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#EFEDE7]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#D32F2F] rounded-xl flex items-center justify-center text-white shadow-sm">
                <Zap className="w-6 h-6 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Avg Energy
                </span>
                <span className="text-2xl font-bold text-[#111111]">
                  {summaryData?.energy_average !== null &&
                  summaryData?.energy_average !== undefined
                    ? ` ${Number(summaryData.energy_average).toFixed(1)}`
                    : " - "}
                </span>
              </div>
            </div>

            <div className="w-px h-10 bg-[#EFEDE7]" />

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#D32F2F] rounded-xl flex items-center justify-center text-white shadow-sm">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Alignment
                </span>
                <span className="text-2xl font-bold text-[#111111]">
                  {summaryData?.alignment_average !== null &&
                  summaryData?.alignment_average !== undefined
                    ? ` ${Number(summaryData.alignment_average).toFixed(1)}`
                    : " - "}
                </span>
              </div>
            </div>
          </div>

          {/* This Week Calendar Widget */}
          <div className="bg-white border border-[#EFEDE7] p-6 rounded-2xl flex-1 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrevWeek}
                className="p-1 hover:bg-[#F9FAFB] rounded-full transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-[#C4b89D]" />
              </button>
              <h4 className="text-[15px] font-bold text-[#374151]">
                {getWeekLabel()}
              </h4>
              <button
                onClick={handleNextWeek}
                className="p-1 hover:bg-[#F9FAFB] rounded-full transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-[#C4b89D]" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-6">
              {weekData.map((day, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center p-2 rounded-xl transition-all ${day.active ? "border-2 border-[#C4b89D] bg-[#FFF7ED]" : "bg-[#F9FAFB] border border-transparent"}`}
                >
                  <span
                    className={`text-[11px] font-bold mb-1 ${day.active ? "text-[#C4b89D]" : "text-[#6B7280]"}`}
                  >
                    {day.day}
                  </span>
                  <span
                    className={`text-[14px] font-extrabold mb-1.5 ${day.active ? "text-[#111111]" : "text-[#374151]"}`}
                  >
                    {day.date}
                  </span>
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      day.state === "filled"
                        ? "bg-[#22C55E]"
                        : day.state === "missed"
                          ? "bg-[#EF4444]"
                          : "bg-[#D1D5DB]"
                    }`}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Filled
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Missed
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#D1D5DB]" />
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Upcoming
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#FAF9F6] border-[#E8E4D9] p-10 rounded-xl flex flex-col min-h-[320px] items-center justify-center text-center shadow-none relative">
          <div className="absolute top-10 left-10 flex items-center justify-between w-[calc(100%-80px)]">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#333333]" />
              <h3 className="font-bold text-[#333333] text-[18px]">
                Highest Rank
              </h3>
            </div>
            <Link to="/achievements">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#BBA48B] font-bold text-[12px] hover:text-white hover:bg-red-700 h-auto p-0 px-2 uppercase tracking-wider"
              >
                View All
              </Button>
            </Link>
          </div>
          <div className="bg-white w-28 h-28 rounded-full border border-[#E8E4D9] flex items-center justify-center mb-6">
            <Trophy className="w-12 h-12 text-[#EFEDE7]" />
          </div>
          <p className="text-[13px] text-[#AAAAAA] font-bold uppercase tracking-widest">
            No rank achieved yet
          </p>
        </Card>

        <Card className="bg-[#FAF9F6] border-[#E8E4D9] p-10 rounded-xl flex flex-col min-h-[320px] items-center justify-center text-center shadow-none relative">
          <div className="absolute top-10 left-10 flex items-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#333333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3 className="font-bold text-[#333333] text-[18px]">People</h3>
          </div>
          <div
            className="bg-white w-28 h-28 rounded-full border border-[#E8E4D9] flex items-center justify-center mb-6"
            onClick={peopleHandler}
            style={{ cursor: "pointer" }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#EFEDE7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p className="text-[13px] text-[#AAAAAA] font-bold uppercase tracking-widest">
            No people added yet
          </p>
        </Card>
      </div>

      {/* Purpose & Direction Section */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[#555555] opacity-80 uppercase tracking-widest">
          Purpose & Direction
        </h2>
      </div>

      <Card className="bg-[#FAF9F6] border-[#E8E4D9] rounded-xl shadow-none p-8 mb-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-[#BBA48B]" />
            <h3 className="font-bold text-[#333333] text-[18px]">My Mission</h3>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <p className="text-[20px] font-bold text-[#333333] leading-tight">
              {previewData.mission || "Define your mission to see it here."}
            </p>
          </div>
          {previewData.vision_images &&
            previewData.vision_images.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-[#E8E4D9]">
                <h4 className="font-bold text-[#333333] text-[14px] mb-4">
                  Vision Board
                </h4>
                <div className="rounded-lg overflow-hidden">
                  <img
                    src={previewData.vision_images[0]}
                    alt="Vision Board"
                    className="w-full h-auto object-cover max-h-[200px]"
                  />
                </div>
              </div>
            )}
        </div>
      </Card>

      {/* Execution & Tracking Section */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[#555555] opacity-80 uppercase tracking-widest">
          Execution & Tracking
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Journaling Consistency */}
        <Card className="bg-white border-[#E8E4D9] p-8 rounded-xl shadow-none">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="w-5 h-5 text-[#BBA48B]" />
            <h3 className="font-bold text-[#333333] text-[18px]">
              Journaling Consistency
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white border border-[#EFEDE7] p-4 rounded-md text-center">
              <span className="text-2xl font-bold text-[#333333]">
                {summaryData?.current_streak || 0}
              </span>
              <span className="font-bold text-[#333333] ml-2 uppercase tracking-wide text-[10px]">
                Current Streak
              </span>
            </div>
            <div className="bg-white border border-[#EFEDE7] p-4 rounded-md text-center">
              <span className="text-2xl font-bold text-[#333333]">
                {last30DaysCount}
              </span>
              <span className="font-bold text-[#333333] ml-2 uppercase tracking-wide text-[10px]">
                Last 30 Days
              </span>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[14px] font-bold text-[#444444]">
                Consistency Score
              </span>
              <span className="text-[14px] font-bold text-[#444444]">
                {consistencyScore}%
              </span>
            </div>
            <div className="w-full bg-[#EFEDE7] h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-[#D2B48C] h-full rounded-full transition-all duration-500"
                style={{ width: `${consistencyScore}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-6 border-t border-[#EFEDE7]">
            <h4 className="text-[12px] font-bold text-[#555555] mb-8 text-center uppercase tracking-widest">
              Life Balance (Last 7 Days)
            </h4>
            <div className="flex justify-center">
              <div className="relative w-64 h-64">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {[20, 40, 60, 80, 100].map((r) => (
                    <polygon
                      key={r}
                      points="50,10 90,40 75,90 25,90 10,40"
                      transform={`scale(${r / 100}) translate(${(100 - r) / 2},${(100 - r) / 2})`}
                      fill="none"
                      stroke="#EFEDE7"
                      strokeWidth="0.5"
                    />
                  ))}
                  {[0, 72, 144, 216, 288].map((angle) => {
                    const x2 =
                      50 + 50 * Math.cos((angle - 90) * (Math.PI / 180));
                    const y2 =
                      50 + 50 * Math.sin((angle - 90) * (Math.PI / 180));
                    return (
                      <line
                        key={angle}
                        x1="50"
                        y1="50"
                        x2={x2}
                        y2={y2}
                        stroke="#EFEDE7"
                        strokeWidth="0.5"
                      />
                    );
                  })}
                  {summaryData?.life_balance && (
                    <polygon
                      points={`
                        ${50 + (summaryData.life_balance.career || 0) * 4 * Math.cos((0 - 90) * (Math.PI / 180))},${50 + (summaryData.life_balance.career || 0) * 4 * Math.sin((0 - 90) * (Math.PI / 180))}
                        ${50 + (summaryData.life_balance.growth || 0) * 4 * Math.cos((72 - 90) * (Math.PI / 180))},${50 + (summaryData.life_balance.growth || 0) * 4 * Math.sin((72 - 90) * (Math.PI / 180))}
                        ${50 + (summaryData.life_balance.relationships || 0) * 4 * Math.cos((144 - 90) * (Math.PI / 180))},${50 + (summaryData.life_balance.relationships || 0) * 4 * Math.sin((144 - 90) * (Math.PI / 180))}
                        ${50 + (summaryData.life_balance.growth || 0) * 4 * Math.cos((216 - 90) * (Math.PI / 180))},${50 + (summaryData.life_balance.growth || 0) * 4 * Math.sin((216 - 90) * (Math.PI / 180))}
                        ${50 + (summaryData.life_balance.finance || 0) * 4 * Math.cos((288 - 90) * (Math.PI / 180))},${50 + (summaryData.life_balance.finance || 0) * 4 * Math.sin((288 - 90) * (Math.PI / 180))}
                      `}
                      fill="rgba(210, 180, 140, 0.4)"
                      stroke="#BBA48B"
                      strokeWidth="1.5"
                    />
                  )}
                  <text
                    x="50"
                    y="5"
                    textAnchor="middle"
                    fontSize="4"
                    fontWeight="bold"
                    fill="#777777"
                  >
                    Career
                  </text>
                  <text
                    x="95"
                    y="42"
                    textAnchor="start"
                    fontSize="4"
                    fontWeight="bold"
                    fill="#777777"
                  >
                    Growth
                  </text>
                  <text
                    x="75"
                    y="93"
                    textAnchor="middle"
                    fontSize="4"
                    fontWeight="bold"
                    fill="#777777"
                  >
                    Relationships
                  </text>
                  <text
                    x="25"
                    y="93"
                    textAnchor="middle"
                    fontSize="4"
                    fontWeight="bold"
                    fill="#777777"
                  >
                    Personal Growth
                  </text>
                  <text
                    x="5"
                    y="42"
                    textAnchor="end"
                    fontSize="4"
                    fontWeight="bold"
                    fill="#777777"
                  >
                    Finance
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </Card>

        {/* Focus Areas */}
        <Card className="bg-white border border-[#E8E4D9] rounded-xl shadow-none flex flex-col p-10 justify-center">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-[#BBA48B]" />
            <h3 className="font-bold text-[#333333] text-[20px] max-w-sm leading-tight text-left">
              Complete Your Weekly Reflection To See Your Focus Areas Here
            </h3>
          </div>
        </Card>
      </div>

      {/* Habit Tracking Section */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[#555555] opacity-80 uppercase tracking-widest">
          Habit Tracking
        </h2>
      </div>

      <Card className="bg-white border-[#E8E4D9] rounded-xl shadow-none overflow-hidden mb-10">
        <div className="p-6 border-b border-[#EFEDE7] bg-[#FAF9F6]/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-[#BBA48B]" />
            <h3 className="font-bold text-[#333333] text-[17px]">
              Active Habits
            </h3>
          </div>
          <div className="flex gap-8">
            <div className="text-center">
              <p className="text-[20px] font-bold text-[#333333]">
                {activeHabitsCount}
              </p>
              <p className="text-[10px] font-bold text-[#AAAAAA] uppercase">
                Total
              </p>
            </div>
            <div className="text-center">
              <p className="text-[20px] font-bold text-[#BBA48B]">
                {avgHabitCompletion}%
              </p>
              <p className="text-[10px] font-bold text-[#AAAAAA] uppercase">
                Avg. Comp
              </p>
            </div>
          </div>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <h4 className="text-[14px] font-bold text-[#555555] opacity-70 uppercase tracking-wider">
              Daily Habits
            </h4>
            {dailyHabits.length > 0 ? (
              dailyHabits.map((h, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-[14px] font-bold text-[#333333]">
                    <span>{h.name}</span>
                    <span>{h.completion_percentage}%</span>
                  </div>
                  <div className="w-full bg-[#EFEDE7] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#D2B48C] h-full"
                      style={{ width: `${h.completion_percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#AAAAAA] italic font-medium">
                No daily habits active.
              </p>
            )}
          </div>
          <div className="space-y-6">
            <h4 className="text-[14px] font-bold text-[#555555] opacity-70 uppercase tracking-wider">
              Weekly Habits
            </h4>
            {weeklyHabits.length > 0 ? (
              weeklyHabits.map((h, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center text-[14px] font-bold text-[#333333]">
                    <span>{h.name}</span>
                    <span>{h.completion_percentage}%</span>
                  </div>
                  <div className="w-full bg-[#EFEDE7] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#D2B48C] h-full"
                      style={{ width: `${h.completion_percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#AAAAAA] italic font-medium">
                No weekly habits active.
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Review & Growth Section */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[#555555] opacity-80 uppercase tracking-widest">
          Review & Growth
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="bg-[#FAF9F6] border-[#E8E4D9] p-8 rounded-xl shadow-none">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-[#BBA48B]" />
              <h3 className="font-bold text-[#333333] text-[18px]">
                Recent Journal Entries
              </h3>
            </div>
            <Link to="/daily-journal">
              <Button
                size="sm"
                className="bg-[#BBA48B] hover:bg-[#A68F76] text-white font-bold text-[12px] rounded-md px-3 h-8 shadow-sm"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Entry
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentJournals.length > 0 ? (
              recentJournals.slice(0, 3).map((j, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#EFEDE7] p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-bold text-[#333333] text-[14px] mb-1">
                      {j.title || "Daily Journal"}
                    </h4>
                    <p className="text-[12px] text-[#888888] font-medium">
                      {j.start_date || j.created_at}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[#BBA48B] font-bold hover:bg-[#FAF9F6]"
                  >
                    View
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#AAAAAA] italic font-medium px-2">
                No entries yet.
              </p>
            )}
          </div>
        </Card>

        <Card className="bg-white border-[#E8E4D9] p-8 rounded-xl shadow-none">
          <div className="flex items-center gap-3 mb-8">
            <Sparkles className="w-5 h-5 text-[#BBA48B]" />
            <h3 className="font-bold text-[#333333] text-[18px]">
              Personalized Insights
            </h3>
          </div>
          <div className="space-y-4">
            {insightsData.personalized_insights.length > 0 ? (
              insightsData.personalized_insights.slice(0, 2).map((ins, i) => (
                <div
                  key={i}
                  className="bg-[#FAF9F6] border border-[#EFEDE7] p-4 rounded-lg italic text-[14px] text-[#444444] leading-relaxed font-medium"
                >
                  "{ins.insight || ins.text}"
                </div>
              ))
            ) : (
              <p className="text-sm text-[#AAAAAA] italic font-medium px-2">
                Complete more journals to unlock insights.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Bucket List & Leaderboard Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card className="bg-[#FAF9F6] border-[#E8E4D9] p-8 rounded-xl shadow-none">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Target className="w-5 h-5 text-[#BBA48B]" />
              <h3 className="font-bold text-[#333333] text-[18px]">
                Bucket List
              </h3>
            </div>
            <Link to="/leaderboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#BBA48B] font-bold text-[12px] hover:text-white hover:bg-red-700 h-auto p-0 px-2 uppercase tracking-wider"
              >
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {previewData.bucket_preview.length > 0 ? (
              previewData.bucket_preview.slice(0, 3).map((item, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-[14px] font-medium text-[#444444] border-b border-[#EFEDE7] pb-3"
                >
                  <span>{item.title}</span>
                  <Badge
                    variant="outline"
                    className="border-[#E8E4D9] text-[#777777] bg-white text-[10px] font-bold uppercase"
                  >
                    {item.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#AAAAAA] italic font-medium">
                Your dreams will appear here.
              </p>
            )}
          </div>
        </Card>

        <Card className="bg-white border-[#E8E4D9] p-8 rounded-xl shadow-none">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Trophy className="w-5 h-5 text-[#BBA48B]" />
              <h3 className="font-bold text-[#333333] text-[18px]">
                Global Leaderboard
              </h3>
            </div>
            <Link to="/leaderboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-[#BBA48B] font-bold text-[12px] hover:text-white hover:bg-red-700 h-auto p-0 px-2 uppercase tracking-wider"
              >
                View All
              </Button>
            </Link>
          </div>
          <div className="space-y-4">
            {leaderboardData.top.length > 0 ? (
              leaderboardData.top.map((player, i) => (
                <div
                  key={i}
                  className="flex justify-between items-center text-[14px] font-bold text-[#333333]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[#AAAAAA] w-4">{i + 1}</span>
                    <span>{player.name || "Anonymous"}</span>
                  </div>
                  <span>{player.points || player.score || 0} pts</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#AAAAAA] italic font-medium">
                Leaderboard data coming soon.
              </p>
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
